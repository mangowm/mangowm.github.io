import type { RuleDef, RuleFieldDef } from "./schema/data";

import { parseTagId, parseTagMask } from "./tag";
import type { RuleKey, RuleRecord } from "./types";
import { isVariable, parseBool, parseColor, parseEnum, parseInteger, parseNumber } from "./value";

/** A rule parsed from one config line. */
export interface ParsedRule {
  key: RuleKey;
  record: RuleRecord;
  warnings: string[];
}

/** Parse one rule field from its text form. */
export function parseRuleField(text: string, field: RuleFieldDef): RuleRecord[string] {
  if (isVariable(text)) return text;

  switch (field.type) {
    case "bool":
      return parseBool(text);
    case "int":
      return parseInteger(text);
    case "float":
      return parseNumber(text);
    case "string":
      return text;
    case "enum":
      return parseEnum(text, field.options, field.numeric ?? false);
    case "color":
      return parseColor(text);
    case "key-binding":
    case "device-name":
      return text;
    case "tag-id":
      return parseTagId(text);
    case "tag-mask":
      return parseTagMask(text);
  }
}

/** Parse a `key_rule=k:v,k:v` line. Boolean `-1` means unset and is omitted. */
export function parseRule(rule: RuleDef, value: string): ParsedRule {
  const warnings: string[] = [];
  const record: RuleRecord = {};
  const fields = new Map(rule.fields.map((field) => [field.key, field]));

  for (const part of value.split(",")) {
    const token = part.trim();
    if (token === "") continue;

    const colon = token.indexOf(":");
    if (colon === -1) {
      warnings.push(`expected key:value, got "${token}"`);
      continue;
    }

    const key = token.slice(0, colon).trim();
    const raw = token.slice(colon + 1).trim();
    const field = fields.get(key);

    if (!field) {
      warnings.push(`unknown ${rule.key} field "${key}"`);
      continue;
    }

    if (raw === "-1" && field.type === "bool") continue;

    try {
      record[key] = parseRuleField(raw, field);
    } catch (error) {
      warnings.push(error instanceof Error ? error.message : String(error));
    }
  }

  return { key: rule.key, record, warnings };
}
