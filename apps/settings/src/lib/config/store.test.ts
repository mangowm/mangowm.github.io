import { describe, expect, it } from "vite-plus/test";

import { useConfigStore } from "./store";
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
  useConfigStore.setState({ files: [sourceFile(text, format)], data: {}, dirty: false });
}

function saved(format: FileFormat): string {
  const file = useConfigStore.getState().files[0];
  if (!file) throw new Error("missing source file");
  return convertFile(file, format);
}

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
    expect(useConfigStore.getState().data.env).toEqual(["FOO,bar"]);

    reset("", "toml");
    useConfigStore.getState().setPair("env", "FOO", "bar");
    expect(saved("toml")).toContain("[env]");
    expect(saved("toml")).toContain('"FOO" = "bar"');
    expect(useConfigStore.getState().data.env).toEqual(["FOO,bar"]);
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
