import {
  formatConf,
  formatToml,
  parseConf,
  parseToml,
  type ConfigDocument,
} from "@mangowm.github.io/config";

import type { ConfigLine, FileFormat } from "./types";

/** Pick the reader from the extension, then from the first meaningful character. */
export function detectFormat(name: string, text: string): FileFormat {
  if (name.endsWith(".toml")) return "toml";
  if (name.endsWith(".conf")) return "conf";
  return text.trimStart().startsWith("[") ? "toml" : "conf";
}

export function parseDocument(text: string, format: FileFormat): ConfigDocument {
  return format === "toml" ? parseToml(text) : parseConf(text);
}

export function formatDocument(document: ConfigDocument): string {
  return document.format === "toml" ? formatToml(document) : formatConf(document);
}

function entryLine(key: string, value: string): ConfigLine {
  return { type: "entry", key, value, raw: `${key} = ${value}` };
}

const BINDING_SECTIONS = new Set(["bind", "mousebind", "axisbind", "gesturebind", "switchbind"]);

const FLAG_LETTERS: Record<string, string> = {
  sym: "s",
  lock: "l",
  release: "r",
  pass: "p",
  conflict: "c",
};

const SECTION_HEADERS: Record<string, string> = {
  mousebind: "mousebind",
  axisbind: "axisbind",
  gesturebind: "gesturebind",
  switchbind: "switchbind",
};

function isBindingSection(path: readonly string[]): boolean {
  return BINDING_SECTIONS.has(path[0] ?? "");
}

/** The binding keyword represented by a TOML section, e.g. `bind.default.lock` → `bindl`. */
function bindingKeyword(path: readonly string[]): string {
  const head = path[0] ?? "";
  if (head !== "bind") return SECTION_HEADERS[head] ?? head;
  const letters = path
    .slice(2)
    .map((flag) => FLAG_LETTERS[flag] ?? "")
    .join("");
  return `bind${letters}`;
}

/**
 * Convert one TOML binding entry back to the `.conf` value form used by the
 * settings UI, e.g. `SUPER+Return = "spawn,foot"` → `SUPER,Return,spawn,foot`.
 */
function bindingValue(path: readonly string[], trigger: string, action: string): string {
  const head = path[0] ?? "";

  if (head === "switchbind") return `${trigger},${action}`;

  if (head === "gesturebind") {
    const parts = trigger.split("+");
    const fingers = parts.pop() ?? "";
    const motion = parts.pop() ?? "";
    const mods = parts.join("+");
    return `${mods || "NONE"},${motion},${fingers},${action}`;
  }

  const parts = trigger.split("+");
  const key = parts.pop() ?? "";
  const mods = parts.join("+");
  return `${mods || "NONE"},${key},${action}`;
}

function confLines(document: ConfigDocument): ConfigLine[] {
  return document.nodes.flatMap((node): ConfigLine[] => {
    if (node.kind === "entry") {
      return [
        {
          type: "entry",
          key: node.path[node.path.length - 1] ?? "",
          value: node.value,
          raw: node.raw,
        },
      ];
    }
    if (node.kind === "blank") return [{ type: "blank", raw: node.raw }];
    return [{ type: "comment", text: node.raw, raw: node.raw }];
  });
}

function tomlLines(document: ConfigDocument): ConfigLine[] {
  const lines: ConfigLine[] = [];
  let section: string[] = [];
  let rule: { type: string; fields: string[] } | null = null;
  let currentMode: string | null = null;

  const flushRule = () => {
    if (!rule) return;
    const value = rule.fields.join(",");
    lines.push(entryLine(rule.type, value));
    rule = null;
  };

  for (const node of document.nodes) {
    if (node.kind === "section") {
      flushRule();
      section = [...node.path];

      if (section[0] === "rule" && section[1]) {
        rule = { type: section[1], fields: [] };
      }

      if (isBindingSection(section)) {
        const mode = section[1] ?? "default";
        if (mode !== currentMode) {
          currentMode = mode;
          lines.push(entryLine("key_mode", mode));
        }
      }
      continue;
    }

    if (node.kind !== "entry") continue;

    const head = section[0] ?? "";

    if (rule) {
      const field = node.path[2] ?? node.path[node.path.length - 1] ?? "";
      if (field) rule.fields.push(`${field}:${node.value}`);
      continue;
    }

    if (head === "global") {
      lines.push(entryLine(node.path[1] ?? node.path[node.path.length - 1] ?? "", node.value));
    } else if (head === "env" || head === "var") {
      lines.push(entryLine(head, `${node.path[1] ?? ""},${node.value}`));
    } else if (isBindingSection(section)) {
      lines.push(
        entryLine(
          bindingKeyword(section),
          bindingValue(section, node.path[node.path.length - 1] ?? "", node.value),
        ),
      );
    } else {
      lines.push(entryLine(node.path[node.path.length - 1] ?? "", node.value));
    }
  }

  flushRule();
  return lines;
}

/**
 * Derive the flat line view used by the form UI.
 *
 * TOML sections are mapped back to their `.conf` equivalents so panels see the
 * same keys (`env`, `bind`, `window_rule`, …) regardless of file format.
 */
export function documentLines(document: ConfigDocument): ConfigLine[] {
  return document.format === "toml" ? tomlLines(document) : confLines(document);
}
