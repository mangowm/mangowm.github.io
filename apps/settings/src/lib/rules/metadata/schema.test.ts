import { describe, expect, it } from "vite-plus/test";
import { RULES } from "@mangowm.github.io/config/catalog";

import type { RuleType } from "../types";
import { OVERRIDE_REGISTRY, RULE_MATCHERS } from "./schema";

const RULE_KEY: Record<RuleType, string> = {
  windowrule: "window_rule",
  monitorrule: "monitor_rule",
  tagrule: "tag_rule",
  layerrule: "layer_rule",
};

const TYPES = Object.keys(RULE_KEY) as RuleType[];

describe("rule metadata", () => {
  for (const type of TYPES) {
    it(`covers every schema field for ${type}`, () => {
      const rule = RULES.find((candidate) => candidate.key === RULE_KEY[type]);
      if (!rule) throw new Error(`missing schema rule ${RULE_KEY[type]}`);

      const matchers = new Set(RULE_MATCHERS[type]);
      const fields = rule.fields
        .filter((field) => !matchers.has(field.key))
        .map((field) => field.key);
      const overrides = OVERRIDE_REGISTRY.filter((meta) => meta.appliesTo?.includes(type)).map(
        (meta) => meta.key,
      );

      expect(new Set(overrides)).toEqual(new Set(fields));
    });
  }

  it("uses schema matcher keys", () => {
    for (const type of TYPES) {
      const rule = RULES.find((candidate) => candidate.key === RULE_KEY[type]);
      if (!rule) continue;
      const keys = new Set(rule.fields.map((field) => field.key));

      for (const matcher of RULE_MATCHERS[type]) {
        expect(keys.has(matcher)).toBe(true);
      }
    }
  });

  it("maps schema value types to the right controls", () => {
    const meta = (key: string) => OVERRIDE_REGISTRY.find((candidate) => candidate.key === key);

    expect(meta("force_tearing")?.type).toBe("select");
    expect(meta("force_tearing")?.options?.map((option) => option.value)).toEqual(["0", "1", "2"]);
    expect(meta("tags")?.type).toBe("string");
    expect(meta("global_key_binding")?.type).toBe("string");
    expect(meta("master_count")?.range).toEqual([1, 99]);
  });
});
