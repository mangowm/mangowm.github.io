import { readFileSync } from "node:fs";
import { describe, expect, it } from "vite-plus/test";
import Value from "typebox/value";

import { DISPATCHERS } from "./data/dispatchers";
import { schema, tomlSchema } from "./schema";
import { MANGO_VERSION } from "./version";

const exportedSchema = JSON.parse(
  readFileSync(new URL(`../schemas/${MANGO_VERSION}/schema.json`, import.meta.url), "utf8"),
);

const exportedTomlSchema = JSON.parse(
  readFileSync(new URL(`../schemas/${MANGO_VERSION}/toml.schema.json`, import.meta.url), "utf8"),
);

const canonicalConfig = {
  global: {
    animations: true,
    gap_inner_horizontal: 5,
    animation_type_open: "slide",
    root_color: "0x323232ff",
    exec: ["waybar"],
  },
  env: { QT_IM_MODULE: "fcitx", DPI: "140" },
  var: { term: "foot" },
  bind: {
    default: {
      "SUPER+r": [{ dispatcher: "reload_config" }],
      "SUPER+Return": [{ dispatcher: "spawn", args: "foot" }],
      lock: { "CTRL+comma": [{ dispatcher: "spawn", args: "brightnessctl set 10%+" }] },
      release: { conflict: { "SUPER+x": [{ dispatcher: "reload_config" }] } },
    },
  },
  rule: {
    monitor_rule: [{ name: "eDP-1", width: 1920, height: 1080, refresh: 60, x: 0, y: 0 }],
  },
};

describe("canonical schema", () => {
  it("uses the expected dialect and URL", () => {
    expect(schema.$schema).toBe("https://json-schema.org/draft/2020-12/schema");
    expect(schema.$id).toBe(`https://mangowm.github.io/schema/${MANGO_VERSION}/schema.json`);
  });

  it("matches the published snapshot", () => {
    expect(exportedSchema).toEqual(schema);
  });

  it("exposes every global option", () => {
    const global = schema.properties.global as {
      properties: Record<string, unknown>;
    };
    const keys = Object.keys(global.properties);
    expect(keys).toHaveLength(244);
    expect(
      keys.filter((key) => !["exec", "exec_once", "source", "source_optional"].includes(key)),
    ).toHaveLength(240);
  });

  it("has six rule types and 165 fields", () => {
    const rules = schema.properties.rule.properties;
    expect(Object.keys(rules)).toHaveLength(6);
    const fields = Object.values(rules).reduce(
      (count, rule: any) => count + Object.keys(rule.items.properties).length,
      0,
    );
    expect(fields).toBe(165);
  });

  it("validates every global default", () => {
    const global = schema.properties.global.properties as Record<string, any>;
    const defaults = Object.fromEntries(
      Object.entries(global)
        .filter(([, value]) => value.default !== undefined)
        .map(([key, value]) => [key, value.default]),
    );
    expect(Value.Check(schema, { global: defaults })).toBe(true);
    expect(Value.Check(tomlSchema, { global: defaults })).toBe(true);
  });

  it("validates a canonical config object", () => {
    expect(Value.Check(schema, canonicalConfig)).toBe(true);
  });

  it("rejects raw TOML forms", () => {
    expect(Value.Check(schema, { global: { blur: 1 } })).toBe(false);
    expect(Value.Check(schema, { global: { root_color: 0x323232ff } })).toBe(false);
    expect(Value.Check(schema, { env: { DPI: 140 } })).toBe(false);
    expect(Value.Check(schema, { var: { FLAG: true } })).toBe(false);
    expect(Value.Check(schema, { global: { exec: "waybar" } })).toBe(false);
    expect(Value.Check(schema, { bind: { default: { "SUPER+r": "reload_config" } } })).toBe(false);
    expect(Value.Check(schema, { rule: { window_rule: [{ tags: "1|2" }] } })).toBe(false);
  });

  it("accepts a .conf-derived canonical object", () => {
    expect(
      Value.Check(schema, {
        global: {
          blur: false,
          root_color: "0x323232ff",
          animation_curve_open: [0.46, 1, 0.29, 1],
          exec_once: ["waybar"],
          source: ["./extra.conf"],
        },
        env: { QT_IM_MODULE: "fcitx" },
        bind: { default: { "SUPER+Return": [{ dispatcher: "spawn", args: "foot" }] } },
        rule: { tag_rule: [{ id: 1, layout_name: "tile" }], window_rule: [{ tags: [1, 2] }] },
      }),
    ).toBe(true);
  });

  it("rejects a monitor rule without a match field", () => {
    expect(Value.Check(schema, { rule: { monitor_rule: [{ scale: 1 }] } })).toBe(false);
  });

  it("enforces monitor rule groups", () => {
    expect(Value.Check(schema, { rule: { monitor_rule: [{ name: "eDP-1", width: 1920 }] } })).toBe(
      false,
    );
    expect(Value.Check(schema, { rule: { monitor_rule: [{ name: "eDP-1", x: 0 }] } })).toBe(false);
  });

  it("rejects unknown rule fields", () => {
    expect(
      Value.Check(schema, { rule: { window_rule: [{ app_id: "foot", not_a_rule: true }] } }),
    ).toBe(false);
  });

  it("accepts every dispatcher name", () => {
    const bind = Object.fromEntries(
      DISPATCHERS.map((dispatcher, index) => [`SUPER+F${index}`, [{ dispatcher }]]),
    );
    expect(Value.Check(schema, { bind: { default: bind } })).toBe(true);
  });

  it("rejects unknown dispatchers", () => {
    expect(
      Value.Check(schema, { bind: { default: { "SUPER+r": [{ dispatcher: "reload_confg" }] } } }),
    ).toBe(false);
    expect(
      Value.Check(schema, {
        bind: { default: { lock: { "SUPER+r": [{ dispatcher: "reload_confg" }] } } },
      }),
    ).toBe(false);
  });

  it("accepts action objects", () => {
    expect(
      Value.Check(schema, {
        bind: {
          default: {
            "SUPER+r": [{ dispatcher: "reload_config" }],
            "SUPER+t": [{ variable: "term" }],
            "SUPER+s": [{ dispatcher: "spawn", args: "foot" }],
            "SUPER+v": [{ variable: "term", args: "--hold" }],
          },
        },
      }),
    ).toBe(true);
    expect(
      Value.Check(schema, {
        bind: { default: { "SUPER+r": [{ dispatcher: "reload_config", variable: "x" }] } },
      }),
    ).toBe(false);
    expect(Value.Check(schema, { bind: { default: { "SUPER+r": [{ args: "x" }] } } })).toBe(false);
  });

  it("accepts uppercase hex colors", () => {
    expect(Value.Check(schema, { global: { root_color: "0X323232FF" } })).toBe(true);
  });

  it("clamps saturation in canonical output", () => {
    expect(Value.Check(schema, { global: { blur_params_saturation: 1 } })).toBe(true);
    expect(Value.Check(schema, { global: { blur_params_saturation: 1.2 } })).toBe(false);
    expect(Value.Check(tomlSchema, { global: { blur_params_saturation: 1.2 } })).toBe(true);
  });

  it("accepts an empty animation type", () => {
    expect(Value.Check(schema, { rule: { window_rule: [{ animation_type_open: "" }] } })).toBe(
      true,
    );
  });

  it("accepts flags, numeric tag ids, and layout lists", () => {
    expect(
      Value.Check(schema, {
        global: { circle_layout: ["tile", "scroller"] },
        bind: {
          default: {
            release: { conflict: { "SUPER+r": [{ dispatcher: "reload_config" }] } },
          },
        },
        rule: { tag_rule: [{ id: 1, layout_name: "tile" }] },
      }),
    ).toBe(true);
    expect(Value.Check(schema, { global: { circle_layout: ["not_a_layout"] } })).toBe(false);
  });

  it("validates tag ids and tag arrays", () => {
    expect(Value.Check(schema, { rule: { tag_rule: [{ id: "*" }, { id: 1 }] } })).toBe(true);
    expect(Value.Check(schema, { rule: { tag_rule: [{ id: "abc" }] } })).toBe(false);
    expect(Value.Check(schema, { rule: { tag_rule: [{ id: "99" }] } })).toBe(false);
    expect(Value.Check(schema, { rule: { window_rule: [{ tags: [1, 2] }, { tags: [0] }] } })).toBe(
      true,
    );
    expect(Value.Check(schema, { rule: { window_rule: [{ tags: [0, 1] }] } })).toBe(false);
    expect(Value.Check(schema, { rule: { window_rule: [{ tags: [] }] } })).toBe(false);
    expect(Value.Check(schema, { rule: { window_rule: [{ tags: [1, 1] }] } })).toBe(false);
    expect(Value.Check(schema, { rule: { window_rule: [{ tags: [1, 32] }] } })).toBe(false);
  });

  it("validates global key bindings", () => {
    expect(
      Value.Check(schema, {
        rule: { window_rule: [{ global_key_binding: "SUPER-XF86AudioMute" }] },
      }),
    ).toBe(true);
    expect(Value.Check(schema, { rule: { window_rule: [{ global_key_binding: "SUPER" }] } })).toBe(
      false,
    );
  });

  it("accepts tearing overrides", () => {
    expect(Value.Check(schema, { rule: { window_rule: [{ force_tearing: 2 }] } })).toBe(true);
    expect(Value.Check(schema, { rule: { window_rule: [{ force_tearing: 3 }] } })).toBe(false);
  });

  it("rejects unknown global options", () => {
    expect(Value.Check(schema, { global: { not_an_option: true } })).toBe(false);
  });

  it("rejects wrong value types", () => {
    expect(Value.Check(schema, { global: { animations: "yes" } })).toBe(false);
  });
});

describe("TOML schema", () => {
  it("uses the expected dialect and URL", () => {
    expect(tomlSchema.$schema).toBe("https://json-schema.org/draft/2020-12/schema");
    expect(tomlSchema.$id).toBe(
      `https://mangowm.github.io/schema/${MANGO_VERSION}/toml.schema.json`,
    );
  });

  it("matches the published snapshot", () => {
    expect(exportedTomlSchema).toEqual(tomlSchema);
  });

  it("accepts raw TOML forms", () => {
    expect(
      Value.Check(tomlSchema, {
        global: {
          blur: 0,
          root_color: 0x323232ff,
          exec: "waybar",
          source: "./extra.toml",
        },
        env: { DPI: 140, FLAG: true },
        var: { scale: 1.5 },
        bind: { default: { "SUPER+r": "reload_config", "SUPER+Return": ["spawn,foot"] } },
        rule: { window_rule: [{ is_floating: 1, width: 0.5, tags: "1 | 2" }] },
      }),
    ).toBe(true);
  });

  it("accepts canonical scalar forms", () => {
    expect(
      Value.Check(tomlSchema, {
        global: { animations: true, root_color: "0x323232ff", exec: ["waybar"] },
        env: { DPI: "140" },
        bind: { default: { "SUPER+r": "reload_config" } },
      }),
    ).toBe(true);
  });

  it("rejects canonical actions and tag arrays", () => {
    expect(
      Value.Check(tomlSchema, {
        bind: { default: { "SUPER+r": [{ dispatcher: "reload_config" }] } },
      }),
    ).toBe(false);
    expect(Value.Check(tomlSchema, { rule: { window_rule: [{ tags: [1, 2] }] } })).toBe(false);
  });

  it("accepts custom off as an integer", () => {
    expect(
      Value.Check(tomlSchema, { rule: { monitor_rule: [{ name: "eDP-1", custom: 0 }] } }),
    ).toBe(true);
  });

  it("accepts quoted tag ids and spaced tag masks", () => {
    expect(
      Value.Check(tomlSchema, {
        rule: {
          tag_rule: [{ id: "*" }, { id: "1" }],
          window_rule: [{ tags: "1 | 2" }],
        },
      }),
    ).toBe(true);
    expect(Value.Check(tomlSchema, { rule: { tag_rule: [{ id: "99" }] } })).toBe(false);
  });
});
