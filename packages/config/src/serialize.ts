import { GLOBALS, RULES, type RuleDef } from "./schema/data";

import {
  bindKeyword,
  flagLetters,
  formatBinding,
  splitTrigger,
  type BindingFlags,
  type BindingKind,
  type ParsedBinding,
} from "./binding";
import { formatTagMask } from "./tag";
import { orderedBy, type OrderMap } from "./order";
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

interface LineItem {
  key: string;
  line: string;
}

function collectBindings(
  node: BindingNode,
  family: BindingKind,
  mode: string,
  flags: BindingFlags,
): LineItem[] {
  const items: LineItem[] = [];

  for (const flag of FLAGS) {
    const child = node[flag];
    if (child !== undefined && !Array.isArray(child)) {
      items.push(...collectBindings(child, family, mode, { ...flags, [flag]: true }));
    }
  }

  for (const [trigger, actions] of Object.entries(node)) {
    if ((FLAGS as readonly string[]).includes(trigger) || !Array.isArray(actions)) continue;

    const parts = splitTrigger(family, trigger);
    for (const action of actions) {
      const binding: ParsedBinding = {
        kind: family,
        flags,
        mods: parts.mods,
        trigger: parts.key,
        fingers: parts.fingers,
        action,
      };
      items.push({
        key: `b:${family}:${mode}:${flagLetters(flags)}:${trigger}`,
        line: `${bindKeyword(binding)} = ${formatBinding(binding)}`,
      });
    }
  }

  return items;
}

/** Serialize the canonical config to `.conf` text. */
export function serializeConf(config: CanonicalConfig, order?: OrderMap): string {
  const global = config.global ?? {};

  const optionItems: LineItem[] = GLOBALS.flatMap((def) => {
    const value = global[def.key];
    return value === undefined
      ? []
      : [{ key: `g:${def.key}`, line: `${def.key} = ${formatOption(value)}` }];
  });

  const pairItems: LineItem[] = [
    ...Object.entries(config.env ?? {}).map(([name, value]) => ({
      key: `p:env:${name}`,
      line: `env = ${name},${value}`,
    })),
    ...Object.entries(config.var ?? {}).map(([name, value]) => ({
      key: `p:var:${name}`,
      line: `var = ${name},${value}`,
    })),
  ];

  const directiveItems: LineItem[] = DIRECTIVES.flatMap((key) => {
    const values = global[key];
    if (!Array.isArray(values)) return [];
    return (values as string[]).map((value, index) => ({
      key: `d:${key}:${index}`,
      line: `${key} = ${value}`,
    }));
  });

  const ruleItems: LineItem[] = [];
  for (const rule of RULES) {
    (config.rule?.[rule.key] ?? []).forEach((record, index) => {
      const parts = orderedBy(
        rule.fields
          .filter((field) => record[field.key] !== undefined)
          .map((field) => ({
            key: `r:${rule.key}:${index}:${field.key}`,
            line: `${field.key}:${formatRuleValue(
              rule,
              field.key,
              record[field.key] as RuleRecord[string],
            )}`,
          })),
        (item) => item.key,
        order,
      ).map((item) => item.line);

      if (parts.length > 0) {
        ruleItems.push({ key: `r:${rule.key}:${index}`, line: `${rule.key} = ${parts.join(",")}` });
      }
    });
  }

  const bindingItems: LineItem[] = KINDS.flatMap((kind) => {
    const map = bindingMap(config, kind);
    return Object.entries(map ?? {}).flatMap(([mode, node]) => [
      { key: `s:bind.${mode}`, line: `key_mode = ${mode}` },
      ...collectBindings(node, kind, mode, {
        sym: false,
        lock: false,
        release: false,
        pass: false,
        conflict: false,
      }),
    ]);
  });

  if (order) {
    const flat = orderedBy(
      [...optionItems, ...pairItems, ...directiveItems, ...ruleItems, ...bindingItems],
      (item) => item.key,
      order,
    );
    return flat.length === 0 ? "" : `${flat.map((item) => item.line).join("\n")}\n`;
  }

  const sections = [
    orderedBy(optionItems, (item) => item.key, order),
    orderedBy(pairItems, (item) => item.key, order),
    orderedBy(directiveItems, (item) => item.key, order),
    orderedBy(ruleItems, (item) => item.key, order),
    orderedBy(bindingItems, (item) => item.key, order),
  ]
    .filter((items) => items.length > 0)
    .map((items) => items.map((item) => item.line));

  if (sections.length === 0) return "";
  return `${sections.map((section) => section.join("\n")).join("\n\n")}\n`;
}
