import {
  RULES,
  RULE_FIELD_META,
  RULE_MATCHERS as CATALOG_RULE_MATCHERS,
  RULE_MATCHER_META,
  type RuleDef,
  type RuleFieldDef,
  type RuleKey,
} from "@mangowm.github.io/config/catalog";

import type { OverrideMeta, OverrideValueType, RuleType } from "../types";

export const RULE_CONFIG_KEY: Record<RuleType, RuleKey> = {
  windowrule: "window_rule",
  monitorrule: "monitor_rule",
  tagrule: "tag_rule",
  layerrule: "layer_rule",
};

const RULE_TYPES: RuleType[] = ["windowrule", "monitorrule", "tagrule", "layerrule"];

function ruleDef(type: RuleType): RuleDef {
  const rule = RULES.find((candidate) => candidate.key === RULE_CONFIG_KEY[type]);
  if (!rule) throw new Error(`Missing schema rule ${RULE_CONFIG_KEY[type]}`);
  return rule;
}

export const RULE_MATCHERS: Record<RuleType, readonly string[]> = Object.fromEntries(
  RULE_TYPES.map((type) => [type, CATALOG_RULE_MATCHERS[RULE_CONFIG_KEY[type]]]),
) as Record<RuleType, readonly string[]>;

export const RULE_MATCHER_LABELS: Record<string, string> = {};
export const RULE_MATCHER_OPTIONS: Record<string, { value: string; label: string }[]> = {};
export const RULE_MATCHER_PLACEHOLDERS: Record<string, string> = {};

for (const type of RULE_TYPES) {
  const rule = ruleDef(type);
  for (const matcher of RULE_MATCHERS[type]) {
    const meta = RULE_MATCHER_META[rule.key]?.[matcher];
    const field = rule.fields.find((candidate) => candidate.key === matcher);

    RULE_MATCHER_LABELS[matcher] = meta?.label ?? field?.label ?? matcher;
    if (meta?.placeholder) RULE_MATCHER_PLACEHOLDERS[matcher] = meta.placeholder;
    if (meta?.options)
      RULE_MATCHER_OPTIONS[matcher] = meta.options.map((option) => ({ ...option }));
  }
}

function uiType(field: RuleFieldDef): OverrideValueType {
  switch (field.type) {
    case "bool":
      return "boolean";
    case "int":
      return "integer";
    case "float":
      return "float";
    case "enum":
      return "select";
    case "color":
      return "color";
    default:
      return "string";
  }
}

function buildOverrides(type: RuleType): OverrideMeta[] {
  const rule = ruleDef(type);
  const matchers = new Set(RULE_MATCHERS[type]);

  return rule.fields
    .filter((field) => !matchers.has(field.key))
    .map((field) => {
      const meta = RULE_FIELD_META[rule.key]?.[field.key];
      const min = "min" in field ? field.min : undefined;
      const max = "max" in field ? field.max : undefined;
      const schemaRange: [number, number] | undefined =
        min !== undefined && max !== undefined ? [min, max] : undefined;

      return {
        key: field.key,
        label: field.label,
        description: field.description,
        type: uiType(field),
        category: meta?.category ?? "rules",
        range: schemaRange,
        step: meta?.step ?? (field.type === "float" ? 0.01 : undefined),
        unit: meta?.unit,
        options:
          field.type === "enum"
            ? field.options.map((option) => ({ value: option.value, label: option.label }))
            : undefined,
        appliesTo: [type],
        aliases: meta?.aliases ? [...meta.aliases] : undefined,
        inherit: meta?.inheritable,
        pattern: meta?.pattern,
        patternError: meta?.patternError,
      };
    });
}

export const OVERRIDE_REGISTRY: OverrideMeta[] = RULE_TYPES.flatMap(buildOverrides);

export function getOverridesForRuleType(type: RuleType): OverrideMeta[] {
  return OVERRIDE_REGISTRY.filter((meta) => meta.appliesTo?.includes(type) ?? false);
}

export function getOverrideMeta(key: string, ruleType?: RuleType): OverrideMeta | undefined {
  if (ruleType) {
    return OVERRIDE_REGISTRY.find((meta) => meta.key === key && meta.appliesTo?.includes(ruleType));
  }
  return OVERRIDE_REGISTRY.find((meta) => meta.key === key);
}

export const RULE_LABELS: Record<RuleType, string> = Object.fromEntries(
  RULE_TYPES.map((type) => [type, ruleDef(type).label]),
) as Record<RuleType, string>;

export const RULE_DESCRIPTIONS: Record<RuleType, string> = Object.fromEntries(
  RULE_TYPES.map((type) => [type, ruleDef(type).description]),
) as Record<RuleType, string>;
