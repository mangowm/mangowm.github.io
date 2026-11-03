import { describe, expect, it } from "vite-plus/test";

import { parseConf } from "./conf";
import { convertDocument } from "./convert";
import { parseToml } from "./toml";

describe("convertDocument", () => {
  it("keeps placed comments when converting to toml", () => {
    const toml = convertDocument(parseConf("# header\nblur = 1 # note\nenv = DPI,140\n"), "toml");

    expect(toml).toContain("# header");
    expect(toml).toContain("blur = true # note");
    expect(toml).toContain('"DPI" = "140"');
  });

  it("keeps the native document unchanged", () => {
    const text = "blur = 1 # note\n";
    expect(convertDocument(parseConf(text), "conf")).toBe(text);
  });
});

describe("convertDocument anchors", () => {
  it("places comments on bindings and rules", () => {
    const conf = parseConf(
      [
        "key_mode = default",
        "# open terminal",
        "bind = SUPER,Return,spawn,foot",
        "# window rule",
        "window_rule = app_id:firefox",
      ].join("\n"),
    );

    const toml = convertDocument(conf, "toml");

    expect(toml.indexOf("# open terminal")).toBeGreaterThan(toml.indexOf("[bind.default]"));
    expect(toml).toContain('"SUPER+Return" = "spawn,foot"');
    expect(toml.indexOf("# window rule")).toBeLessThan(toml.indexOf("[[rule.window_rule]]"));
    expect(toml).toContain('app_id = "firefox"');
  });

  it("keeps inline binding comments", () => {
    const conf = parseConf(
      ["key_mode = default", "bind = SUPER,Return,spawn,foot # launch"].join("\n"),
    );

    const toml = convertDocument(conf, "toml");

    expect(toml).toContain('"SUPER+Return" = "spawn,foot" # launch');
  });

  it("moves rule field comments onto the conf rule line", () => {
    const toml = parseToml(
      [
        "[global]",
        "blur = true",
        "",
        "[[rule.window_rule]]",
        "# match firefox",
        'app_id = "firefox"',
        "# float it",
        "float = true",
      ].join("\n"),
    );

    const conf = convertDocument(toml, "conf");
    const lines = conf.split("\n");
    const ruleLine = lines.findIndex((line) => line.startsWith("window_rule = "));

    expect(ruleLine).toBeGreaterThan(-1);
    expect(lines[ruleLine - 2]).toBe("# match firefox");
    expect(lines[ruleLine - 1]).toBe("# float it");
    expect(conf.indexOf("# match firefox")).toBeGreaterThan(conf.indexOf("blur = 1"));
  });

  it("keeps rule field inline comments on the conf rule line", () => {
    const toml = parseToml(["[[rule.window_rule]]", 'app_id = "firefox" # match'].join("\n"));

    const conf = convertDocument(toml, "conf");

    expect(conf).toContain("window_rule = app_id:firefox # match");
  });

  it("keeps comments above key_mode with the binding section", () => {
    const conf = parseConf(
      ["# bindings", "key_mode = default", "bind = SUPER,Return,spawn,foot"].join("\n"),
    );

    const toml = convertDocument(conf, "toml");

    expect(toml.indexOf("# bindings")).toBeLessThan(toml.indexOf("[bind.default]"));
    expect(toml.indexOf("# bindings")).toBeGreaterThan(toml.indexOf("[global]"));
  });
});
