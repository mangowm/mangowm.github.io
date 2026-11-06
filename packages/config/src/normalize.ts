import { GLOBALS, RULES, type GlobalDef, type RuleDef } from "@mangowm.github.io/schema";

import {
  bindingTrigger,
  parseBinding,
  type BindingFlags,
  type BindingKind,
  type ParsedBinding,
} from "./binding";
import { parseAction } from "./dispatch";
import type { ConfigDocument } from "./document";
import { parseRule, parseRuleField } from "./rule";
import type {
  Action,
  BindingMap,
  BindingNode,
  CanonicalConfig,
  OptionValue,
  RuleKey,
  RuleRecord,
  SourceLocation,
} from "./types";
import { parseOption } from "./value";

export type WarningSeverity = "error" | "warning";

export type WarningCode =
  | "unknown-option"
  | "unknown-section"
  | "unknown-rule-field"
  | "invalid-value"
  | "invalid-variable"
  | "duplicate-binding"
  | "reserved-binding"
  | "clamped";

/** A recoverable problem in the source text. */
export interface Warning {
  message: string;
  at: SourceLocation;
  severity: WarningSeverity;
  code: WarningCode;
}

export type WarnFn = (
  message: string,
  at: SourceLocation,
  code?: WarningCode,
  severity?: WarningSeverity,
) => void;

/** The canonical config plus every warning collected while normalizing. */
export interface NormalizedConfig {
  config: CanonicalConfig;
  warnings: Warning[];
}

const FLAGS = ["sym", "lock", "release", "pass", "conflict"] as const;
const RESERVED_TRIGGERS = new Set<string>(FLAGS);
const DIRECTIVES = new Set(["exec", "exec_once", "source", "source_optional"]);
const BIND_KEY = /^bind[slrpc]*$/;
const PLAIN_BINDINGS = new Set(["mousebind", "axisbind", "gesturebind", "switchbind"]);
const VARIABLE_NAME = /^[A-Za-z_][A-Za-z0-9_]*$/;

const KIND_BY_SECTION: Record<string, BindingKind> = {
  bind: "key",
  mousebind: "mouse",
  axisbind: "axis",
  gesturebind: "gesture",
  switchbind: "switch",
};

const RULE_BY_KEY: ReadonlyMap<string, RuleDef> = new Map(RULES.map((rule) => [rule.key, rule]));
const GLOBAL_BY_KEY: ReadonlyMap<string, GlobalDef> = new Map(
  GLOBALS.map((option) => [option.key, option]),
);

function isBindingKey(key: string): boolean {
  return BIND_KEY.test(key) || PLAIN_BINDINGS.has(key);
}

function bindingsFor(config: CanonicalConfig, kind: BindingKind): BindingMap {
  switch (kind) {
    case "key":
      return (config.bind ??= {});
    case "mouse":
      return (config.mousebind ??= {});
    case "axis":
      return (config.axisbind ??= {});
    case "gesture":
      return (config.gesturebind ??= {});
    case "switch":
      return (config.switchbind ??= {});
  }
}

function placeAction(
  config: CanonicalConfig,
  kind: BindingKind,
  mode: string,
  flags: BindingFlags,
  trigger: string,
  action: Action,
  warn: WarnFn,
  at: SourceLocation,
): void {
  if (RESERVED_TRIGGERS.has(trigger)) {
    warn(`"${trigger}" is a reserved binding name`, at, "reserved-binding");
    return;
  }

  const bindings = bindingsFor(config, kind);
  let node: BindingNode = (bindings[mode] ??= {});

  for (const flag of FLAGS) {
    if (!flags[flag]) continue;
    const child = node[flag];
    node = child !== undefined && !Array.isArray(child) ? child : (node[flag] = {});
  }

  const existing = node[trigger];
  if (flags.conflict && Array.isArray(existing)) {
    existing.push(action);
    return;
  }

  if (existing !== undefined) {
    warn(`duplicate binding "${trigger}"`, at, "duplicate-binding");
  }

  node[trigger] = [action];
}

function placeBinding(
  config: CanonicalConfig,
  mode: string,
  binding: ParsedBinding,
  warn: WarnFn,
  at: SourceLocation,
): void {
  placeAction(
    config,
    binding.kind,
    mode,
    binding.flags,
    bindingTrigger(binding),
    binding.action,
    warn,
    at,
  );
}

function addDirective(config: CanonicalConfig, key: string, value: string): void {
  const global = (config.global ??= {});
  const existing = global[key];
  if (Array.isArray(existing)) {
    (existing as string[]).push(value);
  } else {
    global[key] = [value];
  }
}

function splitPair(value: string): [string, string] | null {
  const comma = value.indexOf(",");
  if (comma === -1) return null;
  return [value.slice(0, comma).trim(), value.slice(comma + 1).trim()];
}

function clampOption(value: OptionValue, def: GlobalDef): [OptionValue, boolean] {
  if (def.type === "int" || def.type === "float") {
    if (typeof value !== "number") return [value, false];
    const minimum = def.min ?? -Infinity;
    const maximum = def.max ?? Infinity;
    const clamped = Math.min(maximum, Math.max(minimum, value));
    return [clamped, clamped !== value];
  }

  if (def.type === "preset") {
    if (!Array.isArray(value)) return [value, false];
    const preset = value as number[];
    const clamped = preset.map((item) => Math.min(1, Math.max(0.1, item)));
    return [clamped, clamped.some((item, index) => item !== preset[index])];
  }

  return [value, false];
}

function applyGlobal(
  config: CanonicalConfig,
  key: string,
  value: string,
  at: SourceLocation,
  warn: WarnFn,
): void {
  if (DIRECTIVES.has(key)) {
    addDirective(config, key, value);
    return;
  }

  const def = GLOBAL_BY_KEY.get(key);
  if (!def) {
    warn(`unknown option "${key}"`, at, "unknown-option", "warning");
    return;
  }

  try {
    const [parsed, clamped] = clampOption(parseOption(value, def), def);
    (config.global ??= {})[key] = parsed;
    if (clamped) {
      warn(`${key} clamped to ${JSON.stringify(parsed)}`, at, "clamped", "warning");
    }
  } catch (error) {
    warn(error instanceof Error ? error.message : String(error), at);
  }
}

/** Normalize a `.conf` document to the canonical config. */
export function normalizeConf(document: ConfigDocument): NormalizedConfig {
  const config: CanonicalConfig = {};
  const warnings: Warning[] = [];
  const warn: WarnFn = (message, at, code = "invalid-value", severity = "error") =>
    warnings.push({ message, at, code, severity });
  let mode = "default";

  for (const node of document.nodes) {
    if (node.kind !== "entry") continue;
    const key = node.path[0] ?? "";

    if (key === "key_mode") {
      mode = node.value.trim() || "default";
      continue;
    }

    if (key === "env" || key === "var") {
      const pair = splitPair(node.value);
      if (!pair) {
        warn(`expected name,value in ${key}`, node.at, "invalid-value");
        continue;
      }
      const [name, value] = pair;
      if (key === "var") {
        if (!VARIABLE_NAME.test(name)) {
          warn(`invalid variable name "${name}"`, node.at, "invalid-variable");
          continue;
        }
        (config.var ??= {})[name] = value;
      } else {
        (config.env ??= {})[name] = value;
      }
      continue;
    }

    const rule = RULE_BY_KEY.get(key);
    if (rule) {
      const parsed = parseRule(rule, node.value);
      for (const message of parsed.warnings) {
        const unknown = message.startsWith("unknown ");
        warn(
          message,
          node.at,
          unknown ? "unknown-rule-field" : "invalid-value",
          unknown ? "warning" : "error",
        );
      }
      if (Object.keys(parsed.record).length > 0) {
        const rules = (config.rule ??= {});
        (rules[parsed.key] ??= []).push(parsed.record);
      }
      continue;
    }

    if (isBindingKey(key)) {
      try {
        placeBinding(config, mode, parseBinding(key, node.value), warn, node.at);
      } catch (error) {
        warn(error instanceof Error ? error.message : String(error), node.at);
      }
      continue;
    }

    applyGlobal(config, key, node.value, node.at, warn);
  }

  return { config, warnings };
}

/** Normalize a TOML document to the canonical config. */
export function normalizeToml(document: ConfigDocument): NormalizedConfig {
  const config: CanonicalConfig = {};
  const warnings: Warning[] = [];
  const warn: WarnFn = (message, at, code = "invalid-value", severity = "error") =>
    warnings.push({ message, at, code, severity });
  let rule: { key: RuleKey; record: RuleRecord } | null = null;

  const flushRule = () => {
    if (rule && Object.keys(rule.record).length > 0) {
      const rules = (config.rule ??= {});
      (rules[rule.key] ??= []).push(rule.record);
    }
    rule = null;
  };

  for (const node of document.nodes) {
    if (node.kind === "section") {
      flushRule();
      const [head, name] = node.path;
      if (head === "rule" && name && RULE_BY_KEY.has(name)) {
        rule = { key: name as RuleKey, record: {} };
      }
      continue;
    }

    if (node.kind !== "entry") continue;

    const head = node.path[0] ?? "";
    const second = node.path[1] ?? "";

    if (head === "global") {
      applyGlobal(config, second, node.value, node.at, warn);
      continue;
    }

    if (head === "env" || head === "var") {
      if (head === "var" && !VARIABLE_NAME.test(second)) {
        warn(`invalid variable name "${second}"`, node.at, "invalid-variable");
        continue;
      }
      if (head === "env") {
        (config.env ??= {})[second] = node.value;
      } else {
        (config.var ??= {})[second] = node.value;
      }
      continue;
    }

    if (head === "rule") {
      const definition = RULE_BY_KEY.get(second);
      const fieldKey = node.path[2] ?? "";
      const field = definition?.fields.find((candidate) => candidate.key === fieldKey);

      if (!definition || !field) {
        warn(`unknown rule field "${fieldKey}"`, node.at, "unknown-rule-field", "warning");
        continue;
      }

      if (!rule || rule.key !== second) {
        flushRule();
        rule = { key: second as RuleKey, record: {} };
      }

      try {
        rule.record[fieldKey] = parseRuleField(node.value, field);
      } catch (error) {
        warn(error instanceof Error ? error.message : String(error), node.at);
      }
      continue;
    }

    const kind = KIND_BY_SECTION[head];
    if (!kind) {
      warn(`unknown section "${head}"`, node.at, "unknown-section", "warning");
      continue;
    }

    const mode = second || "default";
    const trigger = node.path[node.path.length - 1] ?? "";
    const flags: BindingFlags = {
      sym: false,
      lock: false,
      release: false,
      pass: false,
      conflict: false,
    };

    for (const segment of node.path.slice(2, -1)) {
      if (segment in flags) {
        flags[segment as keyof BindingFlags] = true;
      } else {
        warn(`unknown binding flag "${segment}"`, node.at, "invalid-value");
      }
    }

    try {
      placeAction(config, kind, mode, flags, trigger, parseAction(node.value), warn, node.at);
    } catch (error) {
      warn(error instanceof Error ? error.message : String(error), node.at);
    }
  }

  flushRule();

  return { config, warnings };
}

/** Normalize either supported format. */
export function normalize(document: ConfigDocument): NormalizedConfig {
  return document.format === "toml" ? normalizeToml(document) : normalizeConf(document);
}
