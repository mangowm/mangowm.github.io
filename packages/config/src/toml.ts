import { GLOBALS, RULES } from "@mangowm.github.io/schema";

import { type BindingKind } from "./binding";
import { formatAction } from "./dispatch";
import type { ConfigDocument, DocumentNode } from "./document";
import { formatTagMask } from "./tag";
import type {
  Action,
  BindingMap,
  BindingNode,
  CanonicalConfig,
  OptionValue,
  SourceLocation,
} from "./types";

/** Remove a `#` comment, respecting quotes. */
export function stripTomlComment(text: string): string {
  let quote = "";
  for (let index = 0; index < text.length; index++) {
    const char = text[index];
    if (quote) {
      if (quote === '"' && char === "\\") {
        index++;
      } else if (char === quote) {
        quote = "";
      }
    } else if (char === '"' || char === "'") {
      quote = char;
    } else if (char === "#") {
      return text.slice(0, index);
    }
  }
  return text;
}

/** Whether the collected lines form a complete statement. */
function isComplete(statement: string): boolean {
  const text = statement.trim();
  if (text === "") return true;
  if (text.startsWith("[")) return text.endsWith("]");

  const equals = text.indexOf("=");
  if (equals === -1) return true;

  let depth = 0;
  let quote = "";
  for (let index = equals + 1; index < text.length; index++) {
    const char = text[index];
    if (quote) {
      if (quote === '"' && char === "\\") {
        index++;
      } else if (char === quote) {
        quote = "";
      }
    } else if (char === '"' || char === "'") {
      quote = char;
    } else if (char === "[") {
      depth++;
    } else if (char === "]") {
      depth--;
    }
  }

  return depth <= 0 && quote === "";
}

/** Remove matching quotes and decode double-quoted escapes. */
function unquote(text: string): string {
  const value = text.trim();
  const first = value[0];
  if (value.length < 2 || (first !== '"' && first !== "'") || !value.endsWith(first)) {
    return value;
  }

  const body = value.slice(1, -1);
  if (first === "'") return body;

  return body.replace(/\\(.)/g, (_match, escaped: string) => {
    switch (escaped) {
      case "n":
        return "\n";
      case "t":
        return "\t";
      case "r":
        return "\r";
      default:
        return escaped;
    }
  });
}

/** Convert one TOML scalar to the text form the normalizer expects. */
function scalar(text: string): string {
  const value = text.trim();
  if (value === "") return "";
  if (value === "true") return "1";
  if (value === "false") return "0";
  return unquote(value);
}

/** Split a TOML array into its scalar elements. */
export function arrayElements(text: string): string[] {
  const value = text.trim();
  if (!value.startsWith("[") || !value.endsWith("]")) return [scalar(value)];

  const body = value.slice(1, -1);
  const elements: string[] = [];
  let current = "";
  let quote = "";

  for (let index = 0; index < body.length; index++) {
    const char = body[index];
    if (quote) {
      current += char;
      if (quote === '"' && char === "\\") {
        current += body[++index] ?? "";
      } else if (char === quote) {
        quote = "";
      }
    } else if (char === '"' || char === "'") {
      quote = char;
      current += char;
    } else if (char === ",") {
      elements.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  elements.push(current);

  return elements.map(scalar).filter((element) => element !== "");
}

/** Keys whose TOML array is joined back into a comma list. */
function joinsArray(key: string): boolean {
  return (
    key.startsWith("animation_curve_") ||
    key === "scroller_proportion_preset" ||
    key === "circle_layout"
  );
}

/** Parse mango's line-oriented TOML subset into a lossless document. */
export function parseToml(text: string, file = ""): ConfigDocument {
  const newline: "\n" | "\r\n" = text.includes("\r\n") ? "\r\n" : "\n";
  const nodes: DocumentNode[] = [];
  let section: string[] = [];
  let buffer: string[] = [];
  let start = 0;

  const flush = () => {
    if (buffer.length === 0) return;

    const raw = buffer.join(newline);
    const at: SourceLocation = { file, line: start + 1 };
    const statement = buffer.map(stripTomlComment).join("\n").trim();
    buffer = [];

    if (statement.startsWith("[")) {
      const array = statement.startsWith("[[");
      const name = statement.replace(/^\[+/, "").replace(/\]+$/, "").trim();
      const path = name
        .split(".")
        .map((part) => part.trim())
        .filter((part) => part !== "");
      section = path;
      nodes.push({ kind: "section", path, array, raw, at });
      return;
    }

    const equals = statement.indexOf("=");
    if (equals === -1) {
      nodes.push({ kind: "raw", raw, at });
      return;
    }

    const key = unquote(statement.slice(0, equals).trim());
    const value = statement.slice(equals + 1).trim();
    const path = [...section, key];

    if (value.startsWith("[")) {
      const elements = arrayElements(value);
      if (joinsArray(key)) {
        nodes.push({ kind: "entry", path, value: elements.join(","), raw, at });
      } else {
        for (const element of elements) {
          nodes.push({ kind: "entry", path, value: element, raw, at });
        }
      }
      return;
    }

    nodes.push({ kind: "entry", path, value: scalar(value), raw, at });
  };

  text.split(/\r?\n/).forEach((line, index) => {
    const trimmed = line.trim();

    if (buffer.length === 0) {
      if (trimmed === "") {
        nodes.push({ kind: "blank", raw: line, at: { file, line: index + 1 } });
        return;
      }
      if (trimmed.startsWith("#")) {
        nodes.push({ kind: "comment", raw: line, at: { file, line: index + 1 } });
        return;
      }
      start = index;
    }

    buffer.push(line);
    if (isComplete(buffer.map(stripTomlComment).join("\n"))) flush();
  });

  flush();

  return { format: "toml", newline, nodes };
}

/** Write a TOML document back to text, preserving untouched statements. */
export function formatToml(document: ConfigDocument): string {
  return document.nodes.map((node) => node.raw).join(document.newline);
}

const FLAGS = ["sym", "lock", "release", "pass", "conflict"] as const;
const DIRECTIVES = ["exec", "exec_once", "source", "source_optional"] as const;
const KINDS: readonly [BindingKind, string][] = [
  ["key", "bind"],
  ["mouse", "mousebind"],
  ["axis", "axisbind"],
  ["gesture", "gesturebind"],
  ["switch", "switchbind"],
];
const COLOR = /^0x[0-9a-fA-F]{8}$/;

function quote(text: string): string {
  return `"${text.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function tomlKey(name: string, force = false): string {
  return force || !/^[A-Za-z0-9_-]+$/.test(name) ? quote(name) : name;
}

function tomlValue(value: OptionValue): string {
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") return String(value);
  if (Array.isArray(value)) {
    return `[${value
      .map((item) => (typeof item === "number" ? String(item) : quote(item)))
      .join(", ")}]`;
  }
  if (COLOR.test(value)) return value;
  return quote(value);
}

function tomlRuleValue(type: string, value: boolean | number | string | number[]): string {
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") return String(value);
  if (Array.isArray(value)) return quote(formatTagMask(value));
  if (type === "color" && COLOR.test(value)) return value;
  return quote(value);
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

function emitTomlBindings(node: BindingNode, path: string[], lines: string[]): void {
  const triggers = Object.entries(node).filter(
    ([name, value]) => !(FLAGS as readonly string[]).includes(name) && Array.isArray(value),
  );
  const conflict = path[path.length - 1] === "conflict";

  if (triggers.length > 0) {
    lines.push(`[${path.join(".")}]`);
    for (const [trigger, actions] of triggers) {
      const values = (actions as Action[]).map(formatAction);
      if (conflict) {
        lines.push(`${quote(trigger)} = [`);
        for (const value of values) lines.push(`  ${quote(value)},`);
        lines.push("]");
      } else {
        lines.push(`${quote(trigger)} = ${quote(values[0] ?? "")}`);
      }
    }
    lines.push("");
  }

  for (const flag of FLAGS) {
    const child = node[flag];
    if (child !== undefined && !Array.isArray(child)) {
      emitTomlBindings(child, [...path, flag], lines);
    }
  }
}

/** Serialize the canonical config to mango's TOML subset. */
export function serializeToml(config: CanonicalConfig): string {
  const lines: string[] = [];
  const global = config.global ?? {};

  const options: string[] = [];
  for (const def of GLOBALS) {
    const value = global[def.key];
    if (value !== undefined) options.push(`${def.key} = ${tomlValue(value)}`);
  }
  for (const directive of DIRECTIVES) {
    const value = global[directive];
    if (Array.isArray(value)) options.push(`${directive} = ${tomlValue(value as string[])}`);
  }
  if (options.length > 0) lines.push("[global]", ...options, "");

  const env = Object.entries(config.env ?? {});
  if (env.length > 0) {
    lines.push("[env]");
    for (const [name, value] of env) lines.push(`${tomlKey(name, true)} = ${quote(value)}`);
    lines.push("");
  }

  const vars = Object.entries(config.var ?? {});
  if (vars.length > 0) {
    lines.push("[var]");
    for (const [name, value] of vars) lines.push(`${tomlKey(name)} = ${quote(value)}`);
    lines.push("");
  }

  for (const rule of RULES) {
    for (const record of config.rule?.[rule.key] ?? []) {
      lines.push(`[[rule.${rule.key}]]`);
      for (const field of rule.fields) {
        const value = record[field.key];
        if (value === undefined) continue;
        lines.push(`${field.key} = ${tomlRuleValue(field.type, value)}`);
      }
      lines.push("");
    }
  }

  for (const [kind, section] of KINDS) {
    for (const [mode, node] of Object.entries(bindingMap(config, kind) ?? {})) {
      emitTomlBindings(node, [section, mode], lines);
    }
  }

  return lines.length === 0 ? "" : `${lines.join("\n").trimEnd()}\n`;
}
