import { describe, expect, it } from "vite-plus/test";

import { documentLines, parseDocument } from "./parse";
import type { ConfigLine } from "./types";

function entries(lines: ConfigLine[]) {
  return lines.flatMap((line) =>
    line.type === "entry" ? [{ key: line.key, value: line.value }] : [],
  );
}

describe("documentLines", () => {
  it("maps TOML sections back to conf keys", () => {
    const document = parseDocument(
      [
        "[global]",
        "animations = true",
        "",
        "[env]",
        'FOO = "bar"',
        "",
        "[bind.default]",
        '"SUPER+r" = "reload_config"',
        "",
        "[bind.resize.lock]",
        '"SUPER+m" = "move_client"',
        "",
        "[[rule.window_rule]]",
        'app_id = "foot"',
        "is_floating = true",
        "",
      ].join("\n"),
      "toml",
    );

    expect(entries(documentLines(document))).toEqual([
      { key: "animations", value: "1" },
      { key: "env", value: "FOO,bar" },
      { key: "key_mode", value: "default" },
      { key: "bind", value: "SUPER,r,reload_config" },
      { key: "key_mode", value: "resize" },
      { key: "bindl", value: "SUPER,m,move_client" },
      { key: "window_rule", value: "app_id:foot,is_floating:1" },
    ]);
  });

  it("keeps conf lines as-is", () => {
    const document = parseDocument("# note\nbind = SUPER,r,reload_config\n", "conf");
    const lines = documentLines(document);

    expect(lines[0]).toMatchObject({ type: "comment" });
    expect(lines[1]).toMatchObject({
      type: "entry",
      key: "bind",
      value: "SUPER,r,reload_config",
    });
  });
});
