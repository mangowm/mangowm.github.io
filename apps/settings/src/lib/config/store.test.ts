import { describe, expect, it } from "vite-plus/test";

import { deriveConfigData, deriveMigrationFindings, useConfigStore, undo } from "./store";
import { documentLines, parseDocument } from "./parse";
import { convertFile } from "./convert";
import type { FileFormat, SourceFile } from "./types";

function sourceFile(text: string, format: FileFormat): SourceFile {
  const document = parseDocument(text, format);
  return {
    absPath: `/tmp/config.${format}`,
    refPath: `config.${format}`,
    format,
    document,
    lines: documentLines(document),
    original: text,
  };
}

function reset(text: string, format: FileFormat): void {
  useConfigStore.setState({ files: [sourceFile(text, format)] });
}

function saved(format: FileFormat): string {
  const file = useConfigStore.getState().files[0];
  if (!file) throw new Error("missing source file");
  return convertFile(file, format);
}

describe("derived config data", () => {
  it("caches the projection per files reference", () => {
    const files = useConfigStore.getState().files;
    expect(deriveConfigData(files)).toBe(deriveConfigData(files));
  });

  it("reuses unchanged arrays when another value changes", () => {
    reset("blur = 1\nborder_radius = 2\n", "conf");
    const before = deriveConfigData(useConfigStore.getState().files);
    const borderBefore = before.border_radius;

    useConfigStore.getState().setValue("blur", "0");

    const after = deriveConfigData(useConfigStore.getState().files);
    expect(after.border_radius).toBe(borderBefore);
    expect(after.blur).not.toEqual(before.blur);
  });

  it("derives correctly after undo and redo", () => {
    reset("border_radius = 2\n", "conf");
    useConfigStore.temporal.getState().clear();

    useConfigStore.getState().setValue("border_radius", "3");
    expect(deriveConfigData(useConfigStore.getState().files).border_radius).toEqual(["3"]);

    useConfigStore.temporal.getState().undo();
    expect(deriveConfigData(useConfigStore.getState().files).border_radius).toEqual(["2"]);

    useConfigStore.temporal.getState().redo();
    expect(deriveConfigData(useConfigStore.getState().files).border_radius).toEqual(["3"]);
  });

  it("keeps data out of the store state", () => {
    expect("data" in useConfigStore.getState()).toBe(false);
  });
});

describe("config migrations", () => {
  it("keeps legacy states when the output format changes", () => {
    reset("switchbind=fold,spawn,swaylock\n", "conf");
    useConfigStore.getState().setOutputFormat("toml");

    const file = useConfigStore.getState().files[0];
    if (!file) throw new Error("missing source file");
    const toml = convertFile(file, "toml");

    expect(toml).toContain("fold");
    expect(toml).not.toContain("lid_on");
    expect(deriveMigrationFindings(useConfigStore.getState().files)).toHaveLength(1);

    useConfigStore.getState().setFileText(file.absPath, toml, "toml");
    expect(saved("conf")).toContain("switchbind = fold,spawn,swaylock");
    expect(deriveMigrationFindings(useConfigStore.getState().files)).toHaveLength(1);

    useConfigStore.getState().setOutputFormat("conf");
  });

  it("detects and fixes legacy switch states", async () => {
    reset("switchbind=fold,spawn,a\nswitchbind=unfold,spawn,b\n", "conf");
    useConfigStore.temporal.getState().clear();

    const findings = deriveMigrationFindings(useConfigStore.getState().files);
    expect(findings.map((finding) => finding.before)).toEqual(["fold", "unfold"]);

    const applied = await useConfigStore.getState().fixMigrations();

    expect(applied).toBe(2);
    expect(saved("conf")).toBe("switchbind=lid_on,spawn,a\nswitchbind=lid_off,spawn,b\n");
    expect(deriveMigrationFindings(useConfigStore.getState().files)).toEqual([]);

    undo();
    expect(saved("conf")).toBe("switchbind=fold,spawn,a\nswitchbind=unfold,spawn,b\n");
  });

  it("does not rewrite conflicting bindings", async () => {
    const text = "switchbind=fold,spawn,a\nswitchbind=lid_on,spawn,b\n";
    reset(text, "conf");

    const findings = deriveMigrationFindings(useConfigStore.getState().files);
    expect(findings).toHaveLength(1);
    expect(findings[0]?.fixable).toBe(false);

    expect(await useConfigStore.getState().fixMigrations()).toBe(0);
    expect(saved("conf")).toBe(text);
  });
});

describe("config mutations reach the saved document", () => {
  it("adds, updates, and removes a conf rule", () => {
    reset("", "conf");

    useConfigStore.getState().addEntry("window_rule", "app_id:foot,is_floating:1");
    expect(saved("conf")).toContain("window_rule = app_id:foot,is_floating:1");

    useConfigStore.getState().updateEntry("window_rule", 0, "app_id:kitty");
    expect(saved("conf")).toContain("window_rule = app_id:kitty");
    expect(saved("conf")).not.toContain("app_id:foot");

    useConfigStore.getState().removeEntry("window_rule", 0);
    expect(saved("conf")).not.toContain("window_rule");
  });

  it("adds, updates, and removes a conf binding", () => {
    reset("", "conf");

    useConfigStore.getState().insertEntry("bind", "SUPER,r,reload_config", {
      fileIdx: 0,
      mode: "default",
    });
    expect(saved("conf")).toContain("bind = SUPER,r,reload_config");

    useConfigStore.getState().updateEntry("bind", 0, "SUPER,q,killclient");
    expect(saved("conf")).toContain("bind = SUPER,q,killclient");
    expect(saved("conf")).not.toContain("reload_config");

    useConfigStore.getState().removeEntry("bind", 0);
    expect(saved("conf")).not.toContain("bind =");
  });

  it("adds, updates, and removes a TOML rule", () => {
    reset("", "toml");

    useConfigStore.getState().addEntry("window_rule", "app_id:foot,is_floating:1");
    expect(saved("toml")).toContain("[[rule.window_rule]]");
    expect(saved("toml")).toContain('app_id = "foot"');
    expect(saved("toml")).toContain("is_floating = true");

    useConfigStore.getState().updateEntry("window_rule", 0, "app_id:kitty");
    expect(saved("toml")).toContain('app_id = "kitty"');
    expect(saved("toml")).not.toContain('app_id = "foot"');

    useConfigStore.getState().removeEntry("window_rule", 0);
    expect(saved("toml")).not.toContain("[[rule.window_rule]]");
  });

  it("keeps env pairs readable in both formats", () => {
    reset("", "conf");
    useConfigStore.getState().setPair("env", "FOO", "bar");
    expect(saved("conf")).toContain("env = FOO,bar");
    expect(deriveConfigData(useConfigStore.getState().files).env).toEqual(["FOO,bar"]);

    reset("", "toml");
    useConfigStore.getState().setPair("env", "FOO", "bar");
    expect(saved("toml")).toContain("[env]");
    expect(saved("toml")).toContain('"FOO" = "bar"');
    expect(deriveConfigData(useConfigStore.getState().files).env).toEqual(["FOO,bar"]);
  });

  it("tracks conflict actions independently", () => {
    reset("", "conf");
    useConfigStore.getState().insertEntry("bindc", "SUPER,a,centerwin", {
      fileIdx: 0,
      mode: "default",
    });
    useConfigStore.getState().insertEntry("bindc", "SUPER,a,reload_config", {
      fileIdx: 0,
      mode: "default",
    });
    expect(saved("conf")).toContain("bindc = SUPER,a,centerwin");
    expect(saved("conf")).toContain("bindc = SUPER,a,reload_config");

    useConfigStore.getState().removeEntry("bindc", 1);
    expect(saved("conf")).toContain("bindc = SUPER,a,centerwin");
    expect(saved("conf")).not.toContain("reload_config");

    reset("", "toml");
    useConfigStore.getState().insertEntry("bindc", "SUPER,a,centerwin", {
      fileIdx: 0,
      mode: "default",
    });
    useConfigStore.getState().insertEntry("bindc", "SUPER,a,reload_config", {
      fileIdx: 0,
      mode: "default",
    });
    expect(saved("toml")).toContain('"SUPER+a" = ["centerwin", "reload_config"]');

    useConfigStore.getState().removeEntry("bindc", 1);
    expect(saved("toml")).toContain('"SUPER+a" = ["centerwin"]');
    expect(saved("toml")).not.toContain("reload_config");
  });

  it("adds, updates, and removes a TOML binding", () => {
    reset("", "toml");

    useConfigStore.getState().insertEntry("bind", "SUPER,r,reload_config", {
      fileIdx: 0,
      mode: "default",
    });
    expect(saved("toml")).toContain("[bind.default]");
    expect(saved("toml")).toContain('"SUPER+r" = "reload_config"');

    useConfigStore.getState().updateEntry("bind", 0, "SUPER,q,killclient");
    expect(saved("toml")).toContain('"SUPER+q" = "killclient"');
    expect(saved("toml")).not.toContain("reload_config");

    useConfigStore.getState().removeEntry("bind", 0);
    expect(saved("toml")).not.toContain('"SUPER+q"');
  });
});
