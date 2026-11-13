import { describe, expect, it } from "vite-plus/test";

import { CATEGORIES } from "./data/categories";
import {
  RULE_CATEGORIES,
  RULE_FIELD_META,
  RULE_MATCHERS,
  RULE_MATCHER_META,
} from "./data/ruleMeta";
import { RULES } from "./data/rules";

const categoryIds = new Set(Object.keys(CATEGORIES));

describe("rule metadata", () => {
  it("covers every rule", () => {
    const keys = RULES.map((rule) => rule.key).sort();
    expect(Object.keys(RULE_CATEGORIES).sort()).toEqual(keys);
    expect(Object.keys(RULE_MATCHERS).sort()).toEqual(keys);
    expect(Object.keys(RULE_FIELD_META).sort()).toEqual(keys);
    expect(Object.keys(RULE_MATCHER_META).sort()).toEqual(keys);
  });

  it("uses known categories", () => {
    for (const category of Object.values(RULE_CATEGORIES)) {
      expect(categoryIds).toContain(category);
    }

    for (const fields of Object.values(RULE_FIELD_META)) {
      for (const field of Object.values(fields)) {
        expect(categoryIds).toContain(field.category);
      }
    }
  });

  it("uses schema field keys", () => {
    for (const rule of RULES) {
      const fields = new Set(rule.fields.map((field) => field.key));
      const matchers = new Set(RULE_MATCHERS[rule.key]);

      for (const matcher of matchers) expect(fields).toContain(matcher);
      for (const field of Object.keys(RULE_FIELD_META[rule.key])) {
        expect(fields).toContain(field);
      }
    }
  });

  it("does not treat matcher fields as overrides", () => {
    for (const rule of RULES) {
      const matchers = new Set(RULE_MATCHERS[rule.key]);
      for (const field of Object.keys(RULE_FIELD_META[rule.key])) {
        expect(matchers.has(field)).toBe(false);
      }
    }
  });
});
