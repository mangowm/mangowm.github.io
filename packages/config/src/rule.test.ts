import { RULES } from "./schema/data";
import { describe, expect, it } from "vite-plus/test";

import { parseRule, parseRuleField } from "./rule";

function rule(key: string) {
  const found = RULES.find((candidate) => candidate.key === key);
  if (!found) throw new Error(`missing rule ${key}`);
  return found;
}

describe("rule fields", () => {
  it("parses typed values", () => {
    const windowRule = rule("window_rule");

    expect(parseRule(windowRule, "app_id:firefox,tags:1|3,is_floating:1")).toEqual({
      key: "window_rule",
      record: { app_id: "firefox", tags: [1, 3], is_floating: true },
      warnings: [],
    });
  });

  it("keeps tag ids and wildcards", () => {
    const tagRule = rule("tag_rule");

    expect(parseRule(tagRule, "id:*,master_count:2").record).toEqual({
      id: "*",
      master_count: 2,
    });
  });

  it("keeps a negative float that is in range", () => {
    const deviceRule = rule("device_rule");

    expect(parseRule(deviceRule, "accel_speed:-1").record).toEqual({ accel_speed: -1 });
  });

  it("omits an unset boolean", () => {
    const windowRule = rule("window_rule");

    expect(parseRule(windowRule, "is_floating:-1").record).toEqual({});
  });

  it("reports unknown fields and malformed parts", () => {
    const windowRule = rule("window_rule");
    const parsed = parseRule(windowRule, "nope:1,broken,app_id:foot");

    expect(parsed.record).toEqual({ app_id: "foot" });
    expect(parsed.warnings).toEqual([
      'unknown window_rule field "nope"',
      'expected key:value, got "broken"',
    ]);
  });

  it("reports invalid values", () => {
    const windowRule = rule("window_rule");
    const parsed = parseRule(windowRule, "is_floating:2");

    expect(parsed.record).toEqual({});
    expect(parsed.warnings).toHaveLength(1);
  });

  it("keeps variables unresolved", () => {
    const windowRule = rule("window_rule");
    const field = windowRule.fields.find((candidate) => candidate.key === "is_floating");

    if (!field) throw new Error("missing is_floating");
    expect(parseRuleField("$float", field)).toBe("$float");
  });
});
