import { describe, expect, it } from "vite-plus/test";

import { buildCatalog } from "./catalog";
import { DISPATCHER_ARGS, DISPATCHERS } from "./data/dispatcherArgs";
import {
  DISPATCHER_ALIASES,
  DISPATCHER_DESCRIPTIONS,
  DISPATCHER_EXAMPLES,
} from "./data/dispatcherMeta";
import { GLOBAL_META } from "./data/globalMeta";
import {
  RULE_CATEGORIES,
  RULE_FIELD_META,
  RULE_MATCHERS,
  RULE_MATCHER_META,
} from "./data/ruleMeta";
import { schema } from "./schema";

const catalog = buildCatalog();

function propertiesOf(name: string): string[] {
  const section = schema.properties[name] as { properties?: Record<string, unknown> } | undefined;
  return Object.keys(section?.properties ?? {});
}

describe("catalog consistency", () => {
  it("covers every schema global", () => {
    expect([...Object.keys(catalog.globals), ...Object.keys(catalog.directives)].sort()).toEqual(
      propertiesOf("global").sort(),
    );
  });

  it("includes global metadata", () => {
    for (const [key, meta] of Object.entries(GLOBAL_META)) {
      expect(catalog.globals[key]?.category).toBe(meta.category);
      expect(catalog.globals[key]?.aliases ?? []).toEqual(meta.aliases ?? []);
    }
  });

  it("covers every schema rule", () => {
    expect(Object.keys(catalog.rules).sort()).toEqual(propertiesOf("rule").sort());

    for (const [key, rule] of Object.entries(catalog.rules)) {
      const ruleKey = key as keyof typeof RULE_CATEGORIES;
      expect(rule.category).toBe(RULE_CATEGORIES[ruleKey]);
      expect(rule.matchers).toEqual(RULE_MATCHERS[ruleKey]);
      expect(rule.fieldMeta).toEqual(RULE_FIELD_META[ruleKey]);
      expect(rule.matcherMeta).toEqual(RULE_MATCHER_META[ruleKey]);
    }
  });

  it("covers every dispatcher and its argument signature", () => {
    expect(Object.keys(catalog.dispatchers).sort()).toEqual([...DISPATCHERS].sort());

    for (const dispatcher of DISPATCHERS) {
      expect(catalog.dispatchers[dispatcher].args.map((arg) => arg.kind)).toEqual(
        DISPATCHER_ARGS[dispatcher],
      );
      expect(catalog.dispatchers[dispatcher].description).toBe(DISPATCHER_DESCRIPTIONS[dispatcher]);
      expect(catalog.dispatchers[dispatcher].aliases).toEqual(DISPATCHER_ALIASES[dispatcher] ?? []);
      expect(catalog.dispatchers[dispatcher].examples).toEqual(
        DISPATCHER_EXAMPLES[dispatcher] ?? [],
      );
    }
  });

  it("points at the matching schema artifact", () => {
    expect(catalog.schema).toBe(schema.$id);
  });
});
