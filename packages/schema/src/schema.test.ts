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
      "SUPER+r": "reload_config",
      "SUPER+Return": ["spawn,foot"],
      lock: { "CTRL+comma": "spawn,brightnessctl set 10%+" },
      release: { conflict: { "SUPER+x": "reload_config" } },
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

  it("rejects raw TOML scalar forms", () => {
    expect(Value.Check(schema, { global: { blur: 1 } })).toBe(false);
    expect(Value.Check(schema, { global: { root_color: 0x323232ff } })).toBe(false);
    expect(Value.Check(schema, { env: { DPI: 140 } })).toBe(false);
    expect(Value.Check(schema, { var: { FLAG: true } })).toBe(false);
    expect(Value.Check(schema, { global: { exec: "waybar" } })).toBe(false);
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
        bind: { default: { "SUPER+Return": "spawn,foot" } },
        rule: { tag_rule: [{ id: 1, layout_name: "tile" }] },
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
      DISPATCHERS.map((dispatcher, index) => [`SUPER+F${index}`, dispatcher]),
    );
    expect(Value.Check(schema, { bind: { default: bind } })).toBe(true);
  });

  it("rejects unknown dispatchers", () => {
    expect(Value.Check(schema, { bind: { default: { "SUPER+r": "reload_confg" } } })).toBe(false);
    expect(
      Value.Check(schema, { bind: { default: { lock: { "SUPER+r": "reload_confg" } } } }),
    ).toBe(false);
  });

  it("accepts variable actions and uppercase hex colors", () => {
    expect(
      Value.Check(schema, {
        global: { root_color: "0X323232FF" },
        bind: { default: { "SUPER+r": "${myAction}", "SUPER+x": " reload_config " } },
      }),
    ).toBe(true);
  });

  it("accepts flags, numeric tag ids, and layout lists", () => {
    expect(
      Value.Check(schema, {
        global: { circle_layout: ["tile", "scroller"] },
        bind: { default: { release: { conflict: { "SUPER+r": "reload_config" } } } },
        rule: { tag_rule: [{ id: 1, layout_name: "tile" }] },
      }),
    ).toBe(true);
  });

  it("validates tag ids and tag masks", () => {
    expect(Value.Check(schema, { rule: { tag_rule: [{ id: "*" }, { id: 1 }] } })).toBe(true);
    expect(Value.Check(schema, { rule: { tag_rule: [{ id: "abc" }] } })).toBe(false);
    expect(Value.Check(schema, { rule: { tag_rule: [{ id: "99" }] } })).toBe(false);
    expect(Value.Check(schema, { rule: { window_rule: [{ tags: "1|2" }, { tags: 0 }] } })).toBe(
      true,
    );
    expect(Value.Check(schema, { rule: { window_rule: [{ tags: "foo" }] } })).toBe(false);
    expect(Value.Check(schema, { rule: { window_rule: [{ tags: "99" }] } })).toBe(false);
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

  it("accepts raw TOML scalar forms", () => {
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
        rule: { window_rule: [{ is_floating: 1, width: 0.5 }] },
      }),
    ).toBe(true);
  });

  it("also accepts canonical forms", () => {
    expect(Value.Check(tomlSchema, canonicalConfig)).toBe(true);
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
  });
});
