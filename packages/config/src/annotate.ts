import { DIRECTIVES, RULES } from "@mangowm.github.io/schema";

import { bindingTrigger, parseBinding } from "./binding";
import type { ConfigDocument, EntryNode } from "./document";
import { normalize } from "./normalize";
import type { CanonicalConfig, ConfigFormat } from "./types";

export type CommentAnchor =
  | { kind: "file" }
  | { kind: "global"; key: string }
  | { kind: "directive"; key: string; index: number }
  | { kind: "pair"; table: "env" | "var"; name: string }
  | { kind: "binding"; mode: string; flags: string; trigger: string }
  | { kind: "rule"; key: string; index: number; field?: string }
  | { kind: "section"; path: string[] }
  | { kind: "unplaced" };

export interface AnnotatedComment {
  text: string;
  anchor: CommentAnchor;
  position: "before" | "inline";
}

export interface AnnotatedConfig {
  format: ConfigFormat;
  canonical: CanonicalConfig;
  comments: AnnotatedComment[];
}

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

function inlineComment(raw: string): string | undefined {
  let quote = "";
  for (let index = 0; index < raw.length; index++) {
    const character = raw[index];
    if (quote) {
      if (quote === '"' && character === "\\") index++;
      else if (character === quote) quote = "";
    } else if (character === '"' || character === "'") {
      quote = character;
    } else if (character === "#" && index > 0 && /\s/.test(raw[index - 1] ?? "")) {
      return raw.slice(index);
    }
  }
  return undefined;
}

function anchorForEntry(
  entry: EntryNode,
  format: ConfigFormat,
  state: {
    mode: string;
    ruleIndex: Map<string, number>;
    directiveIndex: Map<string, number>;
  },
): CommentAnchor {
  const key = entry.path[0] ?? "";

  if (format === "conf") {
    if (key === "key_mode") return { kind: "unplaced" };

    if (key === "env" || key === "var") {
      const comma = entry.value.indexOf(",");
      if (comma === -1) return { kind: "unplaced" };
      return { kind: "pair", table: key, name: entry.value.slice(0, comma).trim() };
    }

    if (BIND_KEY.test(key) || PLAIN_BINDINGS.has(key)) {
      try {
        const binding = parseBinding(key, entry.value);
        return {
          kind: "binding",
          mode: state.mode,
          flags: keywordFlags(key),
          trigger: bindingTrigger(binding),
        };
      } catch {
        return { kind: "unplaced" };
      }
    }

    if (RULE_KEYS.has(key)) {
      const index = state.ruleIndex.get(key) ?? 0;
      state.ruleIndex.set(key, index + 1);
      return { kind: "rule", key, index };
    }

    if (DIRECTIVE_KEYS.has(key)) {
      const index = state.directiveIndex.get(key) ?? 0;
      state.directiveIndex.set(key, index + 1);
      return { kind: "directive", key, index };
    }

    return { kind: "global", key };
  }

  const section = entry.path.slice(0, -1);
  const last = entry.path[entry.path.length - 1] ?? "";
  const head = section[0] ?? "";

  if (head === "global") {
    if (DIRECTIVE_KEYS.has(last)) {
      const index = state.directiveIndex.get(last) ?? 0;
      state.directiveIndex.set(last, index + 1);
      return { kind: "directive", key: last, index };
    }
    return { kind: "global", key: last };
  }

  if (head === "env" || head === "var") {
    return { kind: "pair", table: head, name: last };
  }

  if (
    head === "bind" ||
    head === "mousebind" ||
    head === "axisbind" ||
    head === "gesturebind" ||
    head === "switchbind"
  ) {
    return {
      kind: "binding",
      mode: section[1] ?? "default",
      flags: sectionFlags(section.slice(2)),
      trigger: last,
    };
  }

  if (head === "rule") {
    const ruleKey = section[1] ?? "";
    return {
      kind: "rule",
      key: ruleKey,
      index: state.ruleIndex.get(ruleKey) ?? 0,
      field: last,
    };
  }

  return { kind: "unplaced" };
}

/** Extract canonical values and comment anchors from a document. */
export function annotate(document: ConfigDocument): AnnotatedConfig {
  const { config } = normalize(document);
  const comments: AnnotatedComment[] = [];
  const pending: string[] = [];
  const state = {
    mode: "default",
    ruleIndex: new Map<string, number>(),
    directiveIndex: new Map<string, number>(),
  };
  let seenContent = false;

  for (const node of document.nodes) {
    if (node.kind === "blank") {
      continue;
    }

    if (node.kind === "comment") {
      pending.push(node.raw);
      continue;
    }

    if (node.kind === "section") {
      for (const text of pending) {
        comments.push({
          text,
          anchor: { kind: "section", path: [...node.path] },
          position: "before",
        });
      }
      pending.length = 0;
      seenContent = true;

      if (node.path[0] === "rule" && node.path[1]) {
        const key = node.path[1];
        state.ruleIndex.set(key, (state.ruleIndex.get(key) ?? -1) + 1);
      }
      continue;
    }

    if (node.kind !== "entry") continue;

    if (document.format === "conf" && node.path[0] === "key_mode") {
      const mode = node.value.trim() || "default";
      state.mode = mode;

      const anchor: CommentAnchor = { kind: "section", path: ["bind", mode] };
      for (const text of pending) {
        comments.push({ text, anchor, position: "before" });
      }
      pending.length = 0;
      seenContent = true;

      const inline = inlineComment(node.raw);
      if (inline) comments.push({ text: inline, anchor, position: "inline" });
      continue;
    }

    const anchor = anchorForEntry(node, document.format, state);
    const hasAnchor = anchor.kind !== "unplaced";

    for (const text of pending) {
      comments.push({
        text,
        anchor: !seenContent ? { kind: "file" } : hasAnchor ? anchor : { kind: "unplaced" },
        position: "before",
      });
    }
    pending.length = 0;
    seenContent = true;

    const inline = inlineComment(node.raw);
    if (inline && hasAnchor) comments.push({ text: inline, anchor, position: "inline" });
  }

  for (const text of pending) {
    comments.push({
      text,
      anchor: seenContent ? { kind: "unplaced" } : { kind: "file" },
      position: "before",
    });
  }

  return { format: document.format, canonical: config, comments };
}
