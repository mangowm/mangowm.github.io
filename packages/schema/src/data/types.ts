export interface EnumOption {
  value: string;
  label: string;
}

interface GlobalBase {
  key: string;
  label: string;
  description: string;
  examples?: readonly unknown[];
  tomlExamples?: readonly unknown[];
}

export type GlobalDef =
  | (GlobalBase & {
      type: "bool";
      default: boolean;
    })
  | (GlobalBase & {
      type: "int";
      default: number;
      min?: number;
      max?: number;
    })
  | (GlobalBase & {
      type: "float";
      default: number;
      min?: number;
      max?: number;
      canonicalDefault?: number;
      canonicalMax?: number;
    })
  | (GlobalBase & {
      type: "string";
      default: string;
    })
  | (GlobalBase & {
      type: "enum";
      default: string | number;
      options: readonly EnumOption[];
      numeric?: boolean;
    })
  | (GlobalBase & {
      type: "color";
      default: string;
    })
  | (GlobalBase & {
      type: "curve";
      default: readonly number[];
    })
  | (GlobalBase & {
      type: "preset";
      default: readonly number[];
    })
  | (GlobalBase & {
      type: "layout-array";
      default: readonly string[];
    });

export type GlobalType = GlobalDef["type"];

export type RuleKey =
  | "monitor_rule"
  | "tag_rule"
  | "layer_rule"
  | "window_rule"
  | "window_rule_once"
  | "device_rule";

export type RuleFieldType =
  | "bool"
  | "int"
  | "float"
  | "string"
  | "enum"
  | "color"
  | "key-binding"
  | "device-name"
  | "tag-id"
  | "tag-mask";

interface RuleFieldBase {
  key: string;
  label: string;
  description: string;
  examples?: readonly unknown[];
  tomlExamples?: readonly unknown[];
}

export type RuleFieldDef =
  | (RuleFieldBase & {
      type: "bool";
    })
  | (RuleFieldBase & {
      type: "int";
      min?: number;
      max?: number;
    })
  | (RuleFieldBase & {
      type: "float";
      min?: number;
      max?: number;
    })
  | (RuleFieldBase & {
      type: "string";
    })
  | (RuleFieldBase & {
      type: "enum";
      options: readonly EnumOption[];
      numeric?: boolean;
      tomlBoolean?: boolean;
    })
  | (RuleFieldBase & {
      type: "color";
    })
  | (RuleFieldBase & {
      type: "key-binding";
    })
  | (RuleFieldBase & {
      type: "device-name";
    })
  | (RuleFieldBase & {
      type: "tag-id";
    })
  | (RuleFieldBase & {
      type: "tag-mask";
    });

export interface RuleDef {
  key: RuleKey;
  label: string;
  description: string;
  examples?: readonly Record<string, unknown>[];
  tomlExamples?: readonly Record<string, unknown>[];
  fields: readonly RuleFieldDef[];
}
