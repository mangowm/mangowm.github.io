import { DIRECTIVES, GLOBALS, RULES } from "@mangowm.github.io/schema";

import type { AnnotatedBlank, AnnotatedComment, AnnotatedConfig, CommentAnchor } from "./annotate";
import { anchorKey } from "./annotate";
import { bindingKind, bindingTrigger, parseBinding } from "./binding";
import { serializeConf } from "./serialize";
import { serializeToml } from "./toml";
import type { ConfigFormat } from "./types";

const GLOBAL_KEYS = new Set<string>(GLOBALS.map((option) => option.key));
const DIRECTIVE_KEYS = new Set<string>(DIRECTIVES.map((directive) => directive.key));
const RULE_KEYS = new Set<string>(RULES.map((rule) => rule.key));
const BIND_KEY = /^bind[slrpc]*$/;
const PLAIN_BINDINGS = new Set(["mousebind", "axisbind", "gesturebind", "switchbind"]);
const FLAG_LETTER: Record<string, string> = {
  sym: "s",
  lock: "l",
  release: "r",
  pass: "p",
  conflict: "c",
};

function keywordFlags(keyword: string): string {
  const suffix = keyword.startsWith("bind") ? keyword.slice(4) : "";
  return "slrpc"
    .split("")
    .filter((letter) => suffix.includes(letter))
    .join("");
}

function sectionFlags(segments: readonly string[]): string {
  return Object.entries(FLAG_LETTER)
    .filter(([name]) => segments.includes(name))
    .map(([, letter]) => letter)
    .join("");
}

function commentKey(anchor: CommentAnchor, format: ConfigFormat): string {
  // TOML emits one array line per directive, so every value shares that anchor.
  if (format === "toml" && anchor.kind === "directive") return `d:${anchor.key}:0`;
  return anchorKey(anchor, format);
}

function commentsByAnchor(comments: AnnotatedComment[], format: ConfigFormat) {
  const before = new Map<string, string[]>();
  const inline = new Map<string, string[]>();

  for (const comment of comments) {
    const key = commentKey(comment.anchor, format);
    const target = comment.position === "inline" ? inline : before;
    const list = target.get(key) ?? [];
    list.push(comment.text);
    target.set(key, list);
  }

  return { before, inline };
}

function blanksByAnchor(blanks: AnnotatedBlank[], format: ConfigFormat): Map<string, number> {
  const result = new Map<string, number>();

  for (const blank of blanks) {
    const key = commentKey(blank.anchor, format);
    result.set(key, Math.max(result.get(key) ?? 0, blank.count));
  }

  return result;
}

function ensureBlanks(output: string[], count: number): void {
  let existing = 0;
  for (let index = output.length - 1; index >= 0 && output[index].trim() === ""; index--) {
    existing += 1;
  }

  for (let current = existing; current < count; current++) output.push("");
}

/** Keep blank lines that separate a table from what came before it, not its first key. */
function hoistSectionBlanks(lines: string[]): string[] {
  const result: string[] = [];

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index] ?? "";
    if (!/^\[+[^\]]+\]+$/.test(line.trim())) {
      result.push(line);
      continue;
    }

    let end = index + 1;
    while (end < lines.length && (lines[end] ?? "").trim() === "") end += 1;

    const blanks = end - index - 1;
    const before = result.some((entry) => entry.trim() !== "");
    if (blanks > 0 && before) result.push(...Array<string>(blanks).fill(""));
    result.push(line);
    index = end - 1;
  }

  return result;
}

interface EmitState {
  mode: string;
  section: string[];
  ruleIndex: Map<string, number>;
  directiveIndex: Map<string, number>;
  seenSections: Set<string>;
}

function confSectionAnchor(line: string): string | undefined {
  const match = /^([A-Za-z0-9_]+)\s*=\s*(.*)$/.exec(line);
  if (!match) return undefined;

  const key = match[1] ?? "";
  const value = match[2] ?? "";

  if (key === "key_mode") {
    const mode = value.trim() || "default";
    return `s:bind.${mode}`;
  }
  if (RULE_KEYS.has(key)) return `s:rule.${key}`;
  if (key === "env" || key === "var") return `s:${key}`;
  if (GLOBAL_KEYS.has(key) || DIRECTIVE_KEYS.has(key)) return "s:global";
  return undefined;
}

function confLineAnchor(line: string, state: EmitState): string | undefined {
  const match = /^([A-Za-z0-9_]+)\s*=\s*(.*)$/.exec(line);
  if (!match) return undefined;

  const key = match[1] ?? "";
  const value = match[2] ?? "";

  if (key === "key_mode") {
    state.mode = value.trim() || "default";
    return undefined;
  }

  if (key === "env" || key === "var") {
    const comma = value.indexOf(",");
    return comma === -1 ? undefined : `p:${key}:${value.slice(0, comma).trim()}`;
  }

  if (BIND_KEY.test(key) || PLAIN_BINDINGS.has(key)) {
    try {
      const binding = parseBinding(key, value);
      return `b:${binding.kind}:${state.mode}:${keywordFlags(key)}:${bindingTrigger(binding)}`;
    } catch {
      return undefined;
    }
  }

  if (RULE_KEYS.has(key)) {
    const index = state.ruleIndex.get(key) ?? 0;
    state.ruleIndex.set(key, index + 1);
    return `r:${key}:${index}`;
  }

  if (DIRECTIVE_KEYS.has(key)) {
    const index = state.directiveIndex.get(key) ?? 0;
    state.directiveIndex.set(key, index + 1);
    return `d:${key}:${index}`;
  }

  if (GLOBAL_KEYS.has(key)) return `g:${key}`;
  return undefined;
}

function tomlLineAnchor(line: string, state: EmitState): string | undefined {
  const match = /^"?([^"=]+?)"?\s*=\s*(.*)$/.exec(line);
  if (!match) return undefined;

  const key = (match[1] ?? "").trim();
  const head = state.section[0] ?? "";

  if (head === "global") {
    if (DIRECTIVE_KEYS.has(key)) {
      const index = state.directiveIndex.get(key) ?? 0;
      state.directiveIndex.set(key, index + 1);
      return `d:${key}:${index}`;
    }
    if (GLOBAL_KEYS.has(key)) return `g:${key}`;
    return undefined;
  }

  if (head === "env" || head === "var") return `p:${head}:${key}`;

  if (
    head === "bind" ||
    head === "mousebind" ||
    head === "axisbind" ||
    head === "gesturebind" ||
    head === "switchbind"
  ) {
    const mode = state.section[1] ?? "default";
    const flags = sectionFlags(state.section.slice(2));
    return `b:${bindingKind(head)}:${mode}:${flags}:${key}`;
  }

  if (head === "rule") {
    const ruleKey = state.section[1] ?? "";
    const index = state.ruleIndex.get(ruleKey) ?? 0;
    return `r:${ruleKey}:${index}:${key}`;
  }

  return undefined;
}

function applyComments(
  text: string,
  format: ConfigFormat,
  comments: AnnotatedComment[],
  blanks: AnnotatedBlank[],
): string {
  const { before, inline } = commentsByAnchor(comments, format);
  const blankCounts = blanksByAnchor(blanks, format);
  const used = new Set<string>();
  const lines = text.split("\n");
  const output: string[] = [];
  const state: EmitState = {
    mode: "default",
    section: [],
    ruleIndex: new Map(),
    directiveIndex: new Map(),
    seenSections: new Set(),
  };

  for (const line of lines) {
    let current = line;

    if (format === "toml") {
      const header = /^\[+([^\]]+)\]+$/.exec(line);
      if (header) {
        state.section = (header[1] ?? "").split(".");
        if (state.section[0] === "rule" && state.section[1]) {
          const key = state.section[1];
          state.ruleIndex.set(key, (state.ruleIndex.get(key) ?? -1) + 1);

          const index = state.ruleIndex.get(key) ?? 0;
          const ruleKey = `r:${key}:${index}`;
          ensureBlanks(output, blankCounts.get(ruleKey) ?? 0);

          const leading = before.get(ruleKey);
          if (leading) {
            output.push(...leading);
            used.add(ruleKey);
          }
        }

        const sectionKey = `s:${state.section.join(".")}`;
        ensureBlanks(output, blankCounts.get(sectionKey) ?? 0);

        const sectionComments = before.get(sectionKey);
        if (sectionComments) {
          output.push(...sectionComments);
          used.add(sectionKey);
        }

        const sectionInline = inline.get(sectionKey);
        if (sectionInline) {
          current = `${current} ${sectionInline.join(" ")}`;
          used.add(sectionKey);
        }

        output.push(current);
        continue;
      }
    } else {
      const sectionKey = confSectionAnchor(line);
      if (sectionKey && !state.seenSections.has(sectionKey)) {
        state.seenSections.add(sectionKey);
        ensureBlanks(output, blankCounts.get(sectionKey) ?? 0);

        const sectionComments = before.get(sectionKey);
        if (sectionComments) {
          output.push(...sectionComments);
          used.add(sectionKey);
        }

        const sectionInline = inline.get(sectionKey);
        if (sectionInline) {
          current = `${current} ${sectionInline.join(" ")}`;
          used.add(sectionKey);
        }
      }
    }

    const anchor =
      current.trim() === ""
        ? undefined
        : format === "toml"
          ? tomlLineAnchor(current, state)
          : confLineAnchor(current, state);

    if (!anchor) {
      output.push(current);
      continue;
    }

    used.add(anchor);
    ensureBlanks(output, blankCounts.get(anchor) ?? 0);

    const leading = before.get(anchor);
    if (leading) output.push(...leading);

    const trailing = inline.get(anchor);
    output.push(trailing ? `${current} ${trailing.join(" ")}` : current);
  }

  const file = before.get("file") ?? [];
  const unused = [...new Set([...before.keys(), ...inline.keys()])].filter(
    (key) => !used.has(key) && key !== "file" && key !== "unplaced",
  );
  const unplaced = [
    ...(before.get("unplaced") ?? []),
    ...unused.flatMap((key) => [...(before.get(key) ?? []), ...(inline.get(key) ?? [])]),
  ];

  const header = [...file, ...unplaced];
  const merged = [...header, ...output];
  return (format === "toml" ? hoistSectionBlanks(merged) : merged).join("\n");
}

/** Emit an annotated config in the requested format, preserving placed comments. */
export function emit(annotated: AnnotatedConfig, target: ConfigFormat): string {
  const text =
    target === "toml"
      ? serializeToml(annotated.canonical, annotated.order)
      : serializeConf(annotated.canonical, annotated.order);

  return applyComments(text, target, annotated.comments, annotated.blanks);
}
