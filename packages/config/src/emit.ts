import { DIRECTIVES, GLOBALS, RULES } from "@mangowm.github.io/schema";

import type { AnnotatedComment, AnnotatedConfig, CommentAnchor } from "./annotate";
import { bindingTrigger, parseBinding } from "./binding";
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

function anchorKey(anchor: CommentAnchor, format: ConfigFormat): string {
  switch (anchor.kind) {
    case "global":
      return `g:${anchor.key}`;
    case "directive":
      return `d:${anchor.key}:${anchor.index}`;
    case "pair":
      return `p:${anchor.table}:${anchor.name}`;
    case "binding":
      return `b:${anchor.mode}:${anchor.flags}:${anchor.trigger}`;
    case "rule":
      // A conf rule is a single line, so field comments ride along with the rule.
      return format === "conf"
        ? `r:${anchor.key}:${anchor.index}`
        : `r:${anchor.key}:${anchor.index}${anchor.field ? `:${anchor.field}` : ""}`;
    case "section":
      return `s:${anchor.path.join(".")}`;
    case "file":
      return "file";
    case "unplaced":
      return "unplaced";
  }
}

function commentsByAnchor(comments: AnnotatedComment[], format: ConfigFormat) {
  const before = new Map<string, string[]>();
  const inline = new Map<string, string[]>();

  for (const comment of comments) {
    const key = anchorKey(comment.anchor, format);
    const target = comment.position === "inline" ? inline : before;
    const list = target.get(key) ?? [];
    list.push(comment.text);
    target.set(key, list);
  }

  return { before, inline };
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
  if (GLOBAL_KEYS.has(key)) return "s:global";
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
      return `b:${state.mode}:${keywordFlags(key)}:${bindingTrigger(binding)}`;
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
    return `b:${state.section[1] ?? "default"}:${sectionFlags(state.section.slice(2))}:${key}`;
  }

  if (head === "rule") {
    const ruleKey = state.section[1] ?? "";
    const index = state.ruleIndex.get(ruleKey) ?? 0;
    return `r:${ruleKey}:${index}:${key}`;
  }

  return undefined;
}

function applyComments(text: string, format: ConfigFormat, comments: AnnotatedComment[]): string {
  const { before, inline } = commentsByAnchor(comments, format);
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
          const leading = before.get(ruleKey);
          if (leading) {
            output.push(...leading);
            used.add(ruleKey);
          }
        }

        const sectionKey = `s:${state.section.join(".")}`;
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
  return [...header, ...output].join("\n");
}

/** Emit an annotated config in the requested format, preserving placed comments. */
export function emit(annotated: AnnotatedConfig, target: ConfigFormat): string {
  const text =
    target === "toml" ? serializeToml(annotated.canonical) : serializeConf(annotated.canonical);

  return applyComments(text, target, annotated.comments);
}
