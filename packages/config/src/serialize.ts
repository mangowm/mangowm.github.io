import { GLOBALS, RULES, type RuleDef } from "@mangowm.github.io/schema";

import {
  bindKeyword,
  formatBinding,
  type BindingFlags,
  type BindingKind,
  type ParsedBinding,
} from "./binding";
import { formatTagMask } from "./tag";
import type { BindingMap, BindingNode, CanonicalConfig, OptionValue, RuleRecord } from "./types";

const FLAGS = ["sym", "lock", "release", "pass", "conflict"] as const;
const DIRECTIVES = ["exec", "exec_once", "source", "source_optional"] as const;
const KINDS: readonly BindingKind[] = ["key", "mouse", "axis", "gesture", "switch"];

function formatOption(value: OptionValue): string {
  if (typeof value === "boolean") return value ? "1" : "0";
  if (Array.isArray(value)) return value.join(",");
  return String(value);
}

function formatRuleValue(rule: RuleDef, key: string, value: RuleRecord[string]): string {
  if (typeof value === "boolean") return value ? "1" : "0";
  if (Array.isArray(value)) {
    const field = rule.fields.find((candidate) => candidate.key === key);
    return field?.type === "tag-mask"
      ? formatTagMask(value as number[])
      : (value as (string | number)[]).join(",");
  }
  return String(value);
}

function splitTrigger(
  kind: BindingKind,
  trigger: string,
): { mods: string; key: string; fingers: string } {
  if (kind === "switch") return { mods: "", key: trigger, fingers: "" };

  const parts = trigger.split("+");

  if (kind === "gesture") {
    const fingers = parts.pop() ?? "";
    const motion = parts.pop() ?? "";
    return { mods: parts.join("+"), key: motion, fingers };
  }

  const key = parts.pop() ?? "";
  return { mods: parts.join("+"), key, fingers: "" };
}

function bindingMap(config: CanonicalConfig, kind: BindingKind): BindingMap | undefined {
  switch (kind) {
    case "key":
      return config.bind;
    case "mouse":
      return config.mousebind;
    case "axis":
      return config.axisbind;
    case "gesture":
      return config.gesturebind;
    case "switch":
      return config.switchbind;
  }
}

function emitBindings(
  node: BindingNode,
  kind: BindingKind,
  flags: BindingFlags,
  lines: string[],
): void {
  for (const flag of FLAGS) {
    const child = node[flag];
    if (child !== undefined && !Array.isArray(child)) {
      emitBindings(child, kind, { ...flags, [flag]: true }, lines);
    }
  }

  for (const [trigger, actions] of Object.entries(node)) {
    if ((FLAGS as readonly string[]).includes(trigger) || !Array.isArray(actions)) continue;

    const parts = splitTrigger(kind, trigger);
    for (const action of actions) {
      const binding: ParsedBinding = {
        kind,
        flags,
        mods: parts.mods,
        trigger: parts.key,
        fingers: parts.fingers,
        action,
      };
      lines.push(`${bindKeyword(binding)} = ${formatBinding(binding)}`);
    }
  }
}

/** Serialize the canonical config to `.conf` text. */
export function serializeConf(config: CanonicalConfig): string {
  const sections: string[][] = [];
  const global = config.global ?? {};

  const options: string[] = [];
  for (const def of GLOBALS) {
    const value = global[def.key];
    if (value !== undefined) options.push(`${def.key} = ${formatOption(value)}`);
  }
  if (options.length > 0) sections.push(options);

  const pairs: string[] = [];
  for (const [name, value] of Object.entries(config.env ?? {})) {
    pairs.push(`env = ${name},${value}`);
  }
  for (const [name, value] of Object.entries(config.var ?? {})) {
    pairs.push(`var = ${name},${value}`);
  }
  if (pairs.length > 0) sections.push(pairs);

  const directives: string[] = [];
  for (const key of DIRECTIVES) {
    const values = global[key];
    if (!Array.isArray(values)) continue;
    for (const value of values as string[]) {
      directives.push(`${key} = ${value}`);
    }
  }
  if (directives.length > 0) sections.push(directives);

  const rules: string[] = [];
  for (const rule of RULES) {
    for (const record of config.rule?.[rule.key] ?? []) {
      const parts = rule.fields
        .filter((field) => record[field.key] !== undefined)
        .map(
          (field) =>
            `${field.key}:${formatRuleValue(rule, field.key, record[field.key] as RuleRecord[string])}`,
        );
      if (parts.length > 0) rules.push(`${rule.key} = ${parts.join(",")}`);
    }
  }
  if (rules.length > 0) sections.push(rules);

  const bindings: string[] = [];
  for (const kind of KINDS) {
    const map = bindingMap(config, kind);
    for (const [mode, node] of Object.entries(map ?? {})) {
      bindings.push(`key_mode = ${mode}`);
      emitBindings(
        node,
        kind,
        {
          sym: false,
          lock: false,
          release: false,
          pass: false,
          conflict: false,
        },
        bindings,
      );
    }
  }
  if (bindings.length > 0) sections.push(bindings);

  if (sections.length === 0) return "";
  return `${sections.map((section) => section.join("\n")).join("\n\n")}\n`;
}
