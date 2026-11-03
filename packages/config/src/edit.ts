import { RULES, type RuleDef, type RuleFieldDef } from "@mangowm.github.io/schema";

import {
  bindKeyword,
  bindingKind,
  bindingTrigger,
  formatBinding,
  parseBinding,
  splitTrigger,
  type BindingFlags,
  type BindingKind,
  type ParsedBinding,
} from "./binding";
import { formatAction } from "./dispatch";
import type { ConfigDocument, EntryNode, SectionNode } from "./document";
import { formatTagMask } from "./tag";
import type { Actions, OptionValue, RuleKey, RuleRecord, SourceLocation } from "./types";

export type Change =
  | { kind: "option"; key: string; value: OptionValue }
  | { kind: "directive"; key: string; values: string[] }
  | { kind: "pair"; table: "env" | "var"; name: string; value?: string }
  | {
      kind: "binding";
      binding: BindingKind;
      mode: string;
      flags: BindingFlags;
      trigger: string;
      actions: Actions;
      remove?: boolean;
    }
  | {
      kind: "rule";
      rule: RuleKey;
      index: number;
      field: string;
      value?: RuleRecord[string];
    };

const COLOR = /^0x[0-9a-fA-F]{8}$/;
const FLAGS = ["sym", "lock", "release", "pass", "conflict"] as const;

const SECTION_BY_BINDING: Record<BindingKind, string> = {
  key: "bind",
  mouse: "mousebind",
  axis: "axisbind",
  gesture: "gesturebind",
  switch: "switchbind",
};

const RULE_BY_KEY: ReadonlyMap<string, RuleDef> = new Map(RULES.map((rule) => [rule.key, rule]));

function quote(text: string): string {
  return `"${text.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function confValue(value: OptionValue): string {
  if (typeof value === "boolean") return value ? "1" : "0";
  if (Array.isArray(value)) return value.join(",");
  return String(value);
}

function tomlValue(value: OptionValue): string {
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") return String(value);
  if (Array.isArray(value)) {
    return `[${value
      .map((item) => (typeof item === "number" ? String(item) : quote(String(item))))
      .join(", ")}]`;
  }
  return COLOR.test(value) ? value : quote(value);
}

function confRuleValue(field: RuleFieldDef, value: RuleRecord[string]): string {
  if (typeof value === "boolean") return value ? "1" : "0";
  if (Array.isArray(value))
    return field.type === "tag-mask" ? formatTagMask(value) : value.join(",");
  return String(value);
}

function tomlRuleValue(field: RuleFieldDef, value: RuleRecord[string]): string {
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") return String(value);
  if (Array.isArray(value)) return quote(formatTagMask(value));
  if (field.type === "color" && COLOR.test(value)) return value;
  return quote(value);
}

function commentIndex(text: string): number {
  let quoteCharacter = "";
  for (let index = 0; index < text.length; index++) {
    const character = text[index];
    if (quoteCharacter) {
      if (quoteCharacter === '"' && character === "\\") index++;
      else if (character === quoteCharacter) quoteCharacter = "";
    } else if (character === '"' || character === "'") {
      quoteCharacter = character;
    } else if (character === "#" && index > 0 && /\s/.test(text[index - 1] ?? "")) {
      return index;
    }
  }
  return -1;
}

function replaceValue(raw: string, value: string): string {
  const equals = raw.indexOf("=");
  if (equals === -1) return raw;

  const head = raw.slice(0, equals + 1);
  const tail = raw.slice(equals + 1);
  const comment = commentIndex(tail);
  const suffix = comment === -1 ? "" : tail.slice(comment);

  return `${head} ${value}${suffix === "" ? "" : ` ${suffix}`}`;
}

function location(document: ConfigDocument): SourceLocation {
  const last = document.nodes.at(-1)?.at;
  return { file: last?.file ?? "", line: (last?.line ?? 0) + 1 };
}

function entry(document: ConfigDocument, path: readonly string[]): EntryNode | undefined {
  return document.nodes.find(
    (node): node is EntryNode =>
      node.kind === "entry" &&
      node.path.length === path.length &&
      node.path.every((part, index) => part === path[index]),
  );
}

function section(document: ConfigDocument, path: readonly string[]): SectionNode | undefined {
  return document.nodes.find(
    (node): node is SectionNode =>
      node.kind === "section" &&
      node.path.length === path.length &&
      node.path.every((part, index) => part === path[index]),
  );
}

function insertAfter(document: ConfigDocument, anchor: number, nodes: EntryNode[]): void {
  document.nodes.splice(anchor + 1, 0, ...nodes);
}

function insertTomlEntry(
  document: ConfigDocument,
  table: readonly string[],
  node: EntryNode,
): void {
  const header = section(document, table);
  if (!header) {
    document.nodes.push(
      {
        kind: "section",
        path: [...table],
        array: false,
        raw: `[${table.join(".")}]`,
        at: location(document),
      },
      node,
    );
    return;
  }

  const index = document.nodes.indexOf(header);
  let anchor = index;
  for (let cursor = index + 1; cursor < document.nodes.length; cursor++) {
    if (document.nodes[cursor].kind === "section") break;
    anchor = cursor;
  }
  insertAfter(document, anchor, [node]);
}

function applyOption(document: ConfigDocument, key: string, value: OptionValue): void {
  const text = document.format === "toml" ? tomlValue(value) : confValue(value);
  const path = document.format === "toml" ? ["global", key] : [key];
  const existing = entry(document, path);

  if (existing) {
    existing.value = text;
    existing.raw = replaceValue(existing.raw, text);
    return;
  }

  const node: EntryNode = {
    kind: "entry",
    path,
    value: text,
    raw: `${key} = ${text}`,
    at: location(document),
  };

  if (document.format === "toml") insertTomlEntry(document, ["global"], node);
  else document.nodes.push(node);
}

function applyDirective(document: ConfigDocument, key: string, values: string[]): void {
  if (document.format === "toml") {
    const path = ["global", key];
    const text = `[${values.map(quote).join(", ")}]`;
    const existing = entry(document, path);
    if (existing) {
      existing.value = text;
      existing.raw = replaceValue(existing.raw, text);
      return;
    }
    insertTomlEntry(document, ["global"], {
      kind: "entry",
      path,
      value: text,
      raw: `${key} = ${text}`,
      at: location(document),
    });
    return;
  }

  const indices = document.nodes.flatMap((node, index) =>
    node.kind === "entry" && node.path[0] === key ? [index] : [],
  );

  if (indices.length === 0) {
    for (const value of values) {
      document.nodes.push({
        kind: "entry",
        path: [key],
        value,
        raw: `${key} = ${value}`,
        at: location(document),
      });
    }
    return;
  }

  const first = indices[0] as number;
  const existing = document.nodes[first] as EntryNode;
  existing.value = values[0] ?? "";
  existing.raw = replaceValue(existing.raw, values[0] ?? "");

  for (const index of [...indices].reverse()) {
    if (index !== first) document.nodes.splice(index, 1);
  }

  values.slice(1).forEach((value, offset) => {
    document.nodes.splice(first + 1 + offset, 0, {
      kind: "entry",
      path: [key],
      value,
      raw: `${key} = ${value}`,
      at: location(document),
    });
  });
}

function applyPair(
  document: ConfigDocument,
  table: "env" | "var",
  name: string,
  value: string | undefined,
): void {
  if (document.format === "toml") {
    const path = [table, name];
    const existing = entry(document, path);

    if (value === undefined) {
      if (existing) document.nodes.splice(document.nodes.indexOf(existing), 1);
      return;
    }

    const text = quote(value);
    if (existing) {
      existing.value = value;
      existing.raw = replaceValue(existing.raw, text);
      return;
    }

    insertTomlEntry(document, [table], {
      kind: "entry",
      path,
      value,
      raw: `"${name}" = ${text}`,
      at: location(document),
    });
    return;
  }

  const nodes = document.nodes.filter(
    (node): node is EntryNode =>
      node.kind === "entry" && node.path[0] === table && node.value.startsWith(`${name},`),
  );

  if (value === undefined) {
    for (const node of nodes) document.nodes.splice(document.nodes.indexOf(node), 1);
    return;
  }

  const text = `${name},${value}`;
  const existing = nodes[0];
  if (existing) {
    existing.value = text;
    existing.raw = replaceValue(existing.raw, text);
    return;
  }

  document.nodes.push({
    kind: "entry",
    path: [table],
    value: text,
    raw: `${table} = ${text}`,
    at: location(document),
  });
}

function confBinding(
  document: ConfigDocument,
  binding: BindingKind,
  mode: string,
  flags: BindingFlags,
  trigger: string,
): EntryNode | undefined {
  let currentMode = "default";

  for (const node of document.nodes) {
    if (node.kind !== "entry") continue;
    if (node.path[0] === "key_mode") {
      currentMode = node.value.trim() || "default";
      continue;
    }
    if (currentMode !== mode) continue;

    const keyword = node.path[0] ?? "";
    try {
      if (bindingKind(keyword) !== binding) continue;
      const parsed = parseBinding(keyword, node.value);
      if (
        bindingTrigger(parsed) === trigger &&
        FLAGS.every((flag) => parsed.flags[flag] === flags[flag])
      ) {
        return node;
      }
    } catch {
      // Invalid binding lines are left for the normalizer to report.
    }
  }

  return undefined;
}

function confBindingNode(parsed: ParsedBinding): EntryNode {
  const keyword = bindKeyword(parsed);
  const value = formatBinding(parsed);
  return {
    kind: "entry",
    path: [keyword],
    value,
    raw: `${keyword} = ${value}`,
    at: { file: "", line: 0 },
  };
}

function applyConfBinding(
  document: ConfigDocument,
  change: Extract<Change, { kind: "binding" }>,
): void {
  const existing = confBinding(document, change.binding, change.mode, change.flags, change.trigger);

  if (change.remove) {
    if (existing) document.nodes.splice(document.nodes.indexOf(existing), 1);
    return;
  }

  const parts = splitTrigger(change.binding, change.trigger);
  const nodes = change.actions.map((action) =>
    confBindingNode({
      kind: change.binding,
      flags: change.flags,
      mods: parts.mods,
      trigger: parts.key,
      fingers: parts.fingers,
      action,
    }),
  );

  if (existing) {
    const index = document.nodes.indexOf(existing);
    existing.value = nodes[0]?.value ?? "";
    existing.raw = nodes[0]?.raw ?? existing.raw;
    if (nodes.length > 1) document.nodes.splice(index + 1, 0, ...nodes.slice(1));
    return;
  }

  let anchor = -1;
  let currentMode = "default";
  document.nodes.forEach((node, index) => {
    if (node.kind === "entry" && node.path[0] === "key_mode") {
      currentMode = node.value.trim() || "default";
    }
    if (currentMode === change.mode) anchor = index;
  });

  if (anchor === -1) {
    document.nodes.push(
      {
        kind: "entry",
        path: ["key_mode"],
        value: change.mode,
        raw: `key_mode = ${change.mode}`,
        at: location(document),
      },
      ...nodes,
    );
    return;
  }

  document.nodes.splice(anchor + 1, 0, ...nodes);
}

function applyTomlBinding(
  document: ConfigDocument,
  change: Extract<Change, { kind: "binding" }>,
): void {
  const table = [
    SECTION_BY_BINDING[change.binding],
    change.mode,
    ...FLAGS.filter((flag) => change.flags[flag]),
  ];
  const path = [...table, change.trigger];

  if (change.remove) {
    const existing = entry(document, path);
    if (existing) document.nodes.splice(document.nodes.indexOf(existing), 1);
    return;
  }

  const values = change.actions.map(formatAction);
  const text = change.flags.conflict ? `[${values.map(quote).join(", ")}]` : quote(values[0] ?? "");
  const existing = entry(document, path);

  if (existing) {
    existing.value = values.join(",");
    existing.raw = replaceValue(existing.raw, text);
    return;
  }

  insertTomlEntry(document, table, {
    kind: "entry",
    path,
    value: values.join(","),
    raw: `${quote(change.trigger)} = ${text}`,
    at: location(document),
  });
}

function applyConfRule(document: ConfigDocument, change: Extract<Change, { kind: "rule" }>): void {
  const definition = RULE_BY_KEY.get(change.rule);
  const field = definition?.fields.find((candidate) => candidate.key === change.field);
  if (!field) throw new Error(`unknown ${change.rule} field "${change.field}"`);

  const lines = document.nodes.filter(
    (node): node is EntryNode => node.kind === "entry" && node.path[0] === change.rule,
  );
  const existing = lines[change.index];

  if (!existing) {
    if (change.value === undefined) return;
    const text = `${change.field}:${confRuleValue(field, change.value)}`;
    document.nodes.push({
      kind: "entry",
      path: [change.rule],
      value: text,
      raw: `${change.rule} = ${text}`,
      at: location(document),
    });
    return;
  }

  const parts = existing.value
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part !== "");
  const index = parts.findIndex((part) => part.slice(0, part.indexOf(":")).trim() === change.field);

  if (change.value === undefined) {
    if (index !== -1) parts.splice(index, 1);
    if (parts.length === 0) {
      document.nodes.splice(document.nodes.indexOf(existing), 1);
      return;
    }
  } else {
    const text = `${change.field}:${confRuleValue(field, change.value)}`;
    if (index === -1) parts.push(text);
    else parts[index] = text;
  }

  const value = parts.join(",");
  existing.value = value;
  existing.raw = replaceValue(existing.raw, value);
}

function applyTomlRule(document: ConfigDocument, change: Extract<Change, { kind: "rule" }>): void {
  const definition = RULE_BY_KEY.get(change.rule);
  const field = definition?.fields.find((candidate) => candidate.key === change.field);
  if (!field) throw new Error(`unknown ${change.rule} field "${change.field}"`);

  const headers = document.nodes.filter(
    (node): node is SectionNode =>
      node.kind === "section" && node.path[0] === "rule" && node.path[1] === change.rule,
  );
  const header = headers[change.index];

  if (!header) {
    if (change.value === undefined) return;
    const path = ["rule", change.rule];
    document.nodes.push(
      {
        kind: "section",
        path,
        array: true,
        raw: `[[rule.${change.rule}]]`,
        at: location(document),
      },
      {
        kind: "entry",
        path: [...path, change.field],
        value: String(change.value),
        raw: `${change.field} = ${tomlRuleValue(field, change.value)}`,
        at: location(document),
      },
    );
    return;
  }

  const start = document.nodes.indexOf(header);
  let end = document.nodes.length;
  for (let index = start + 1; index < document.nodes.length; index++) {
    if (document.nodes[index].kind === "section") {
      end = index;
      break;
    }
  }

  const existing = document.nodes
    .slice(start + 1, end)
    .find((node): node is EntryNode => node.kind === "entry" && node.path[2] === change.field);

  if (change.value === undefined) {
    if (existing) document.nodes.splice(document.nodes.indexOf(existing), 1);
    return;
  }

  if (existing) {
    const text = tomlRuleValue(field, change.value);
    existing.value = String(change.value);
    existing.raw = replaceValue(existing.raw, text);
    return;
  }

  document.nodes.splice(end, 0, {
    kind: "entry",
    path: [...header.path, change.field],
    value: String(change.value),
    raw: `${change.field} = ${tomlRuleValue(field, change.value)}`,
    at: location(document),
  });
}

/** Apply one structured change while keeping the rest of the document intact. */
export function applyChange(document: ConfigDocument, change: Change): ConfigDocument {
  const next: ConfigDocument = {
    ...document,
    nodes: document.nodes.map((node) => ({ ...node })),
  };

  switch (change.kind) {
    case "option":
      applyOption(next, change.key, change.value);
      break;
    case "directive":
      applyDirective(next, change.key, change.values);
      break;
    case "pair":
      applyPair(next, change.table, change.name, change.value);
      break;
    case "binding":
      if (next.format === "toml") applyTomlBinding(next, change);
      else applyConfBinding(next, change);
      break;
    case "rule":
      if (next.format === "toml") applyTomlRule(next, change);
      else applyConfRule(next, change);
      break;
  }

  return next;
}
