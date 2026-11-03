import { GLOBALS, RULES, type GlobalDef, type RuleDef } from "@mangowm.github.io/schema";

import { bindingTrigger, parseBinding, type BindingKind, type ParsedBinding } from "./binding";
import type { ConfigDocument } from "./document";
import { parseRule } from "./rule";
import type {
  BindingMap,
  BindingNode,
  CanonicalConfig,
  OptionValue,
  SourceLocation,
} from "./types";
import { parseOption } from "./value";

/** A recoverable problem in the source text. */
export interface Warning {
  message: string;
  at: SourceLocation;
}

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

function placeBinding(
  config: CanonicalConfig,
  mode: string,
  binding: ParsedBinding,
  warn: (message: string, at: SourceLocation) => void,
  at: SourceLocation,
): void {
  if (RESERVED_TRIGGERS.has(binding.trigger)) {
    warn(`"${binding.trigger}" is a reserved binding name`, at);
    return;
  }

  const bindings = bindingsFor(config, binding.kind);
  let node: BindingNode = (bindings[mode] ??= {});
  const trigger = bindingTrigger(binding);

  for (const flag of FLAGS) {
    if (!binding.flags[flag]) continue;
    const child = node[flag];
    node = child !== undefined && !Array.isArray(child) ? child : (node[flag] = {});
  }

  const existing = node[trigger];
  if (binding.flags.conflict && Array.isArray(existing)) {
    existing.push(binding.action);
    return;
  }

  if (existing !== undefined) {
    warn(`duplicate binding "${trigger}"`, at);
  }

  node[trigger] = [binding.action];
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

/** Normalize a `.conf` document to the canonical config. */
export function normalizeConf(document: ConfigDocument): NormalizedConfig {
  const config: CanonicalConfig = {};
  const warnings: Warning[] = [];
  const warn = (message: string, at: SourceLocation) => warnings.push({ message, at });
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
        warn(`expected name,value in ${key}`, node.at);
        continue;
      }
      const [name, value] = pair;
      if (key === "var") {
        if (!VARIABLE_NAME.test(name)) {
          warn(`invalid variable name "${name}"`, node.at);
          continue;
        }
        (config.var ??= {})[name] = value;
      } else {
        (config.env ??= {})[name] = value;
      }
      continue;
    }

    if (DIRECTIVES.has(key)) {
      addDirective(config, key, node.value);
      continue;
    }

    const rule = RULE_BY_KEY.get(key);
    if (rule) {
      const parsed = parseRule(rule, node.value);
      for (const message of parsed.warnings) warn(message, node.at);
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

    const def = GLOBAL_BY_KEY.get(key);
    if (def) {
      try {
        const [value, clamped] = clampOption(parseOption(node.value, def), def);
        (config.global ??= {})[key] = value;
        if (clamped) {
          warn(`${key} clamped to ${JSON.stringify(value)}`, node.at);
        }
      } catch (error) {
        warn(error instanceof Error ? error.message : String(error), node.at);
      }
      continue;
    }

    warn(`unknown option "${key}"`, node.at);
  }

  return { config, warnings };
}
