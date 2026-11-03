import { RULES } from "@mangowm.github.io/schema";

/** Config text format supported by this package. */
export type ConfigFormat = "conf" | "toml";

/** Where a node came from; a config can span several `source` files. */
export interface SourceLocation {
  file: string;
  line: number;
}

/** A normalized global option value. */
export type OptionValue = boolean | number | string | number[] | string[];

/** One dispatcher call or variable reference. */
export type Action = { dispatcher: string; args?: string } | { variable: string; args?: string };

/** The actions attached to one trigger. */
export type Actions = Action[];

/** A binding node; the `sym`/`lock`/`release`/`pass`/`conflict` flags nest the same shape. */
export interface BindingNode {
  sym?: BindingNode;
  lock?: BindingNode;
  release?: BindingNode;
  pass?: BindingNode;
  conflict?: BindingNode;
  [trigger: string]: BindingNode | Actions | undefined;
}

/** Bindings grouped by key mode. */
export type BindingMap = Record<string, BindingNode>;

/** The six rule kinds, taken from the schema data. */
export type RuleKey = (typeof RULES)[number]["key"];

/** One normalized rule instance. */
export type RuleRecord = Record<string, boolean | number | string | number[]>;

/** The canonical, schema-shaped configuration object. */
export interface CanonicalConfig {
  global?: Record<string, OptionValue>;
  env?: Record<string, string>;
  var?: Record<string, string>;
  bind?: BindingMap;
  mousebind?: BindingMap;
  axisbind?: BindingMap;
  gesturebind?: BindingMap;
  switchbind?: BindingMap;
  rule?: Partial<Record<RuleKey, RuleRecord[]>>;
}
