export type GlobalType =
  | "bool"
  | "int"
  | "float"
  | "string"
  | "enum"
  | "color"
  | "curve"
  | "preset"
  | "string-array";

export interface EnumOption {
  value: string;
  label: string;
}

export interface GlobalDef {
  key: string;
  type: GlobalType;
  default: string;
  label: string;
  description: string;
  min?: number;
  max?: number;
  options?: readonly EnumOption[];
}

export type RuleKey =
  | "monitor_rule"
  | "tag_rule"
  | "layer_rule"
  | "window_rule"
  | "window_rule_once"
  | "device_rule";

export type RuleFieldType = "bool" | "int" | "float" | "string" | "enum" | "color" | "mask";

export interface RuleFieldDef {
  key: string;
  type: RuleFieldType;
  label: string;
  description: string;
  options?: readonly string[];
}

export interface RuleDef {
  key: RuleKey;
  label: string;
  description: string;
  fields: readonly RuleFieldDef[];
}
