import type { RuleType, ParsedRule } from "@/lib/rules/types";
import { RULE_MATCHERS } from "@/lib/rules/metadata";

export type { RuleType, ParsedRule };

export function parseRuleString(ruleType: RuleType, rawValue: string): ParsedRule {
  const matchers: Record<string, string> = {};
  const overrides: Record<string, string> = {};
  const knownMatchers = RULE_MATCHERS[ruleType];

  for (const part of rawValue.split(",")) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    const colonIdx = trimmed.indexOf(":");
    if (colonIdx === -1) continue;

    const key = trimmed.slice(0, colonIdx).trim();
    const val = trimmed.slice(colonIdx + 1).trim();
    if (!key || !val) continue;

    if (knownMatchers.includes(key)) {
      matchers[key] = val;
    } else {
      overrides[key] = val;
    }
  }

  return { id: rawValue, matchers, overrides };
}

export function serializeRule(rule: ParsedRule): string {
  const parts: string[] = [];

  for (const [key, val] of Object.entries(rule.matchers)) {
    if (val !== undefined && val !== "") parts.push(`${key}:${val}`);
  }
  for (const [key, val] of Object.entries(rule.overrides)) {
    if (val !== undefined && val !== "") parts.push(`${key}:${val}`);
  }

  return parts.join(",");
}

export function removeOverride(rule: ParsedRule, key: string): ParsedRule {
  const { [key]: _dropped, ...restOverrides } = rule.overrides;
  return { ...rule, overrides: restOverrides };
}

export function setOverride(rule: ParsedRule, key: string, value: string): ParsedRule {
  return { ...rule, overrides: { ...rule.overrides, [key]: value } };
}

export function setMatcher(rule: ParsedRule, key: string, value: string): ParsedRule {
  return { ...rule, matchers: { ...rule.matchers, [key]: value } };
}
