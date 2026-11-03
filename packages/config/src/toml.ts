import { GLOBALS, RULES } from "@mangowm.github.io/schema";

import { flagLetters, type BindingFlags, type BindingKind } from "./binding";
import { formatAction } from "./dispatch";
import type { ConfigDocument, DocumentNode } from "./document";
import { orderedBy, type OrderMap } from "./order";
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
        elements.forEach((element, index) => {
          nodes.push({
            kind: "entry",
            path,
            value: element,
            raw: index === 0 ? raw : "",
            at,
            synthetic: index > 0,
          });
        });
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
  return document.nodes
    .filter((node) => !(node.kind === "entry" && node.synthetic))
    .map((node) => node.raw)
    .join(document.newline);
}

const FLAGS = ["sym", "lock", "release", "pass", "conflict"] as const;
const DIRECTIVES = ["exec", "exec_once", "source", "source_optional"] as const;

interface LineItem {
  key: string;
  line: string;
}
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

function emitTomlBindings(
  node: BindingNode,
  path: string[],
  family: BindingKind,
  mode: string,
  flags: BindingFlags,
  order: OrderMap | undefined,
  lines: string[],
): void {
  const triggers = orderedBy(
    Object.entries(node)
      .filter(
        ([name, value]) => !(FLAGS as readonly string[]).includes(name) && Array.isArray(value),
      )
      .map(([trigger, actions]) => ({
        key: `b:${family}:${mode}:${flagLetters(flags)}:${trigger}`,
        trigger,
        actions: actions as Action[],
      })),
    (item) => item.key,
    order,
  );

  if (triggers.length > 0) {
    lines.push(`[${path.join(".")}]`);
    for (const { trigger, actions } of triggers) {
      const values = actions.map(formatAction);
      if (flags.conflict) {
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
      emitTomlBindings(
        child,
        [...path, flag],
        family,
        mode,
        { ...flags, [flag]: true },
        order,
        lines,
      );
    }
  }
}

/** Serialize the canonical config to mango's TOML subset. */
export function serializeToml(config: CanonicalConfig, order?: OrderMap): string {
  const lines: string[] = [];
  const global = config.global ?? {};

  const globalItems: LineItem[] = [];
  for (const def of GLOBALS) {
    const value = global[def.key];
    if (value !== undefined) {
      globalItems.push({ key: `g:${def.key}`, line: `${def.key} = ${tomlValue(value)}` });
    }
  }
  for (const directive of DIRECTIVES) {
    const value = global[directive];
    if (!Array.isArray(value)) continue;
    const values = value as string[];
    const key =
      values
        .map((_, index) => `d:${directive}:${index}`)
        .find((candidate) => order?.has(candidate)) ?? `d:${directive}:0`;
    globalItems.push({ key, line: `${directive} = ${tomlValue(values)}` });
  }
  const options = orderedBy(globalItems, (item) => item.key, order).map((item) => item.line);
  if (options.length > 0) lines.push("[global]", ...options, "");

  const env = orderedBy(
    Object.entries(config.env ?? {}).map(([name, value]) => ({
      key: `p:env:${name}`,
      line: `${tomlKey(name, true)} = ${quote(value)}`,
    })),
    (item) => item.key,
    order,
  );
  if (env.length > 0) lines.push("[env]", ...env.map((item) => item.line), "");

  const vars = orderedBy(
    Object.entries(config.var ?? {}).map(([name, value]) => ({
      key: `p:var:${name}`,
      line: `${tomlKey(name)} = ${quote(value)}`,
    })),
    (item) => item.key,
    order,
  );
  if (vars.length > 0) lines.push("[var]", ...vars.map((item) => item.line), "");

  const ruleItems: { key: string; ruleKey: string; fields: string[] }[] = [];
  for (const rule of RULES) {
    (config.rule?.[rule.key] ?? []).forEach((record, index) => {
      const fields = orderedBy(
        rule.fields.flatMap((field) => {
          const value = record[field.key];
          return value === undefined
            ? []
            : [
                {
                  key: `r:${rule.key}:${index}:${field.key}`,
                  line: `${field.key} = ${tomlRuleValue(field.type, value)}`,
                },
              ];
        }),
        (item) => item.key,
        order,
      ).map((item) => item.line);

      ruleItems.push({ key: `r:${rule.key}:${index}`, ruleKey: rule.key, fields });
    });
  }
  for (const item of orderedBy(ruleItems, (rule) => rule.key, order)) {
    lines.push(`[[rule.${item.ruleKey}]]`, ...item.fields, "");
  }

  for (const [kind, section] of KINDS) {
    const modes = orderedBy(
      Object.entries(bindingMap(config, kind) ?? {}),
      ([mode]) => `s:bind.${mode}`,
      order,
    );
    for (const [mode, node] of modes) {
      emitTomlBindings(
        node,
        [section, mode],
        kind,
        mode,
        { sym: false, lock: false, release: false, pass: false, conflict: false },
        order,
        lines,
      );
    }
  }

  return lines.length === 0 ? "" : `${lines.join("\n").trimEnd()}\n`;
}
