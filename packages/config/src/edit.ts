import type { ConfigDocument, EntryNode, SectionNode } from "./document";
import type { OptionValue, SourceLocation } from "./types";

export type Change =
  | { kind: "option"; key: string; value: OptionValue }
  | { kind: "directive"; key: string; values: string[] }
  | { kind: "pair"; table: "env" | "var"; name: string; value?: string };

const COLOR = /^0x[0-9a-fA-F]{8}$/;

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
  }

  return next;
}
