export type RuleType = "windowrule" | "monitorrule" | "tagrule" | "layerrule";

export interface ParsedRule {
  id: string;
  matchers: Record<string, string>;
  overrides: Record<string, string>;
}

export type OverrideValueType = "boolean" | "float" | "integer" | "string" | "select" | "color";

export interface OverrideMeta {
  key: string;
  label: string;
  description: string;
  type: OverrideValueType;
  category: string;
  range?: [number, number];
  step?: number;
  unit?: string;
  options?: { value: string; label: string }[];
  appliesTo?: RuleType[];
  aliases?: string[];
  inherit?: boolean;
  pattern?: string;
  patternError?: string;
}
