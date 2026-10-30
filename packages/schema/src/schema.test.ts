import { readFileSync } from "node:fs";
import { describe, expect, it } from "vite-plus/test";
import Value from "typebox/value";

import { schema } from "./schema";
import { MANGO_VERSION } from "./version";

const exportedSchema = JSON.parse(
  readFileSync(new URL(`../schemas/${MANGO_VERSION}/schema.json`, import.meta.url), "utf8"),
);

const validConfig = {
  global: {
    animations: true,
    gap_inner_horizontal: 5,
    animation_type_open: "slide",
  },
  env: { QT_IM_MODULE: "fcitx" },
  exec: ["waybar"],
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

describe("mangowm schema", () => {
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
    expect(Object.keys(global.properties)).toHaveLength(240);
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
      Object.entries(global).map(([key, value]) => [key, value.default]),
    );
    expect(Value.Check(schema, { global: defaults })).toBe(true);
  });

  it("validates a canonical config object", () => {
    expect(Value.Check(schema, validConfig)).toBe(true);
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

  it("rejects unknown global options", () => {
    expect(Value.Check(schema, { global: { not_an_option: true } })).toBe(false);
  });

  it("rejects wrong value types", () => {
    expect(Value.Check(schema, { global: { animations: "yes" } })).toBe(false);
  });
});
