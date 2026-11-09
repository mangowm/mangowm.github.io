import { schema } from "./schema";
import Value from "typebox/value";
import { describe, expect, it } from "vite-plus/test";

import { normalize, normalizeToml } from "./normalize";
import { formatToml, parseToml, serializeToml } from "./toml";
import type { CanonicalConfig } from "./types";

describe("parseToml", () => {
  it("round-trips text", () => {
    const text = [
      "# comment",
      "",
      "[global]",
      "blur = 1",
      'root_color = "0x201b14ff"',
      "",
      "[bind.default]",
      '"Alt+Return" = "spawn,foot"',
      "",
    ].join("\n");

    expect(formatToml(parseToml(text))).toBe(text);
  });

  it("keeps multi-line arrays in one statement", () => {
    const text = [
      "[bind.default.conflict]",
      '"SUPER+r" = [',
      '  "spawn_shell,config-check.sh",',
      '  "reload_config",',
      "]",
    ].join("\n");

    const document = parseToml(text);

    expect(document.nodes.filter((node) => node.kind === "entry")).toHaveLength(2);
    expect(document.nodes.some((node) => node.kind === "section")).toBe(true);
  });

  it("converts booleans to the conf spelling", () => {
    const document = parseToml("[global]\nblur = true\nlayer_animations = false\n");

    const values = document.nodes.filter((node) => node.kind === "entry").map((node) => node.value);

    expect(values).toEqual(["1", "0"]);
  });

  it("joins comma-list arrays and expands other arrays", () => {
    const text = [
      "[global]",
      'circle_layout = ["tile", "scroller"]',
      'exec_once = ["waybar", "swaybg -i wall.png"]',
    ].join("\n");

    const entries = parseToml(text).nodes.filter((node) => node.kind === "entry");

    expect(entries.map((node) => node.value)).toEqual([
      "tile,scroller",
      "waybar",
      "swaybg -i wall.png",
    ]);
  });
});

describe("normalizeToml", () => {
  const text = [
    "[global]",
    "blur = 1",
    "border_radius = 8",
    "root_color = 0x201b14ff",
    "animation_curve_open = [0.46, 1.0, 0.29, 1]",
    'exec_once = ["waybar", "swaybg -i wall.png"]',
    "",
    "[env]",
    '"QT_IM_MODULE" = "fcitx"',
    "",
    "[var]",
    'term = "foot"',
    "",
    "[bind.default]",
    '"Alt+Return" = "spawn,foot"',
    "",
    "[bind.resize]",
    '"SUPER+Left" = "resizewin,-10,0"',
    "",
    "[bind.default.conflict]",
    '"SUPER+r" = ["spawn_shell,config-check.sh", "reload_config"]',
    "",
    "[[rule.window_rule]]",
    "is_floating = 1",
    "width = 800",
    'app_id = "mpv"',
    "",
  ].join("\n");

  it("normalizes tables, bindings, and rules", () => {
    const { config, warnings } = normalizeToml(parseToml(text));

    expect(warnings).toEqual([]);
    expect(Value.Check(schema, config)).toBe(true);
    expect(config).toEqual({
      global: {
        blur: true,
        border_radius: 8,
        root_color: "0x201b14ff",
        animation_curve_open: [0.46, 1, 0.29, 1],
        exec_once: ["waybar", "swaybg -i wall.png"],
      },
      env: { QT_IM_MODULE: "fcitx" },
      var: { term: "foot" },
      bind: {
        default: {
          "Alt+Return": [{ dispatcher: "spawn", args: "foot" }],
          conflict: {
            "SUPER+r": [
              { dispatcher: "spawn_shell", args: "config-check.sh" },
              { dispatcher: "reload_config" },
            ],
          },
        },
        resize: { "SUPER+Left": [{ dispatcher: "resizewin", args: "-10,0" }] },
      },
      rule: { window_rule: [{ is_floating: true, width: 800, app_id: "mpv" }] },
    });
  });

  it("starts a new record for every array table", () => {
    const document = parseToml(
      '[[rule.window_rule]]\napp_id = "firefox"\n\n[[rule.window_rule]]\napp_id = "mpv"\n',
    );

    const { config } = normalizeToml(document);

    expect(config.rule?.window_rule).toEqual([{ app_id: "firefox" }, { app_id: "mpv" }]);
  });

  it("dispatches on the document format", () => {
    expect(normalize(parseToml("[global]\nblur = 1\n")).config).toEqual({ global: { blur: true } });
  });
});

describe("serializeToml", () => {
  const config: CanonicalConfig = {
    global: {
      blur: true,
      border_radius: 8,
      root_color: "0x201b14ff",
      animation_curve_open: [0.46, 1, 0.29, 1],
      exec_once: ["waybar"],
    },
    env: { QT_IM_MODULE: "fcitx" },
    var: { term: "foot" },
    bind: {
      default: {
        "Alt+Return": [{ dispatcher: "spawn", args: "foot" }],
        conflict: {
          "SUPER+r": [
            { dispatcher: "spawn_shell", args: "config-check.sh" },
            { dispatcher: "reload_config" },
          ],
        },
      },
    },
    rule: { window_rule: [{ is_floating: true, width: 800, app_id: "mpv" }] },
  };

  it("writes tables, arrays, and rules", () => {
    const text = serializeToml(config);

    expect(text).toContain("[global]");
    expect(text).toContain("blur = true");
    expect(text).toContain("animation_curve_open = [0.46, 1, 0.29, 1]");
    expect(text).toContain('exec_once = ["waybar"]');
    expect(text).toContain("[env]");
    expect(text).toContain('"QT_IM_MODULE" = "fcitx"');
    expect(text).toContain("[var]");
    expect(text).toContain('term = "foot"');
    expect(text).toContain("[bind.default]");
    expect(text).toContain('"Alt+Return" = "spawn,foot"');
    expect(text).toContain("[bind.default.conflict]");
    expect(text).toContain('"SUPER+r" = [');
    expect(text).toContain("[[rule.window_rule]]");
    expect(text).toContain("is_floating = true");
  });

  it("round-trips the canonical config", () => {
    const { config: parsed, warnings } = normalizeToml(parseToml(serializeToml(config)));

    expect(warnings).toEqual([]);
    expect(parsed).toEqual(config);
  });

  it("writes nothing for an empty config", () => {
    expect(serializeToml({})).toBe("");
  });
});
