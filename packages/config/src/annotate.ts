import { DIRECTIVES, RULES } from "./schema/data";

import { bindingKind, bindingTrigger, parseBinding, type BindingKind } from "./binding";
import type { ConfigDocument, EntryNode } from "./document";
import { normalize } from "./normalize";
import type { CanonicalConfig, ConfigFormat } from "./types";

export type CommentAnchor =
  | { kind: "file" }
  | { kind: "global"; key: string }
  | { kind: "directive"; key: string; index: number }
  | { kind: "pair"; table: "env" | "var"; name: string }
  | { kind: "binding"; family: BindingKind; mode: string; flags: string; trigger: string }
  | { kind: "rule"; key: string; index: number; field?: string }
  | { kind: "section"; path: string[] }
  | { kind: "unplaced" };

export interface AnnotatedComment {
  text: string;
  anchor: CommentAnchor;
  position: "before" | "inline";
}

export interface AnnotatedBlank {
  anchor: CommentAnchor;
  count: number;
}

export interface AnnotatedConfig {
  format: ConfigFormat;
  canonical: CanonicalConfig;
  comments: AnnotatedComment[];
  blanks: AnnotatedBlank[];
  order: Map<string, number>;
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

/** Stable key for a comment or blank anchor. */
export function anchorKey(anchor: CommentAnchor, format?: ConfigFormat): string {
  switch (anchor.kind) {
    case "global":
      return `g:${anchor.key}`;
    case "directive":
      return `d:${anchor.key}:${anchor.index}`;
    case "pair":
      return `p:${anchor.table}:${anchor.name}`;
    case "binding":
      return `b:${anchor.family}:${anchor.mode}:${anchor.flags}:${anchor.trigger}`;
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
          family: binding.kind,
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
      family: bindingKind(head),
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

/** Extract canonical values, comment anchors, and document order. */
export function annotate(document: ConfigDocument): AnnotatedConfig {
  const { config } = normalize(document);
  const comments: AnnotatedComment[] = [];
  const blanks: AnnotatedBlank[] = [];
  const order = new Map<string, number>();
  const pending: string[] = [];
  const state = {
    mode: "default",
    ruleIndex: new Map<string, number>(),
    directiveIndex: new Map<string, number>(),
  };
  let pendingBlanks = 0;
  let lastGroup = "";
  let seenContent = false;
  let leading = true;
  let hasFileHeader = false;

  const mark = (anchor: CommentAnchor) => {
    const key = anchorKey(anchor);
    if (!order.has(key)) order.set(key, order.size);
  };

  const flushBlanks = (anchor: CommentAnchor | undefined) => {
    if (anchor && pendingBlanks > 0) blanks.push({ anchor, count: pendingBlanks });
    pendingBlanks = 0;
  };

  const flushComments = (anchor: CommentAnchor) => {
    for (const text of pending) comments.push({ text, anchor, position: "before" });
    pending.length = 0;
  };

  const fileAnchor: CommentAnchor = { kind: "file" };

  for (const node of document.nodes) {
    if (node.kind === "blank") {
      if (!seenContent && leading) {
        if (pending.length > 0) {
          flushComments(fileAnchor);
          hasFileHeader = true;
        }
        leading = false;
      }
      pendingBlanks += 1;
      continue;
    }

    if (node.kind === "comment") {
      pending.push(node.raw);
      continue;
    }

    if (node.kind === "section") {
      const isRuleArray = node.array && node.path[0] === "rule" && Boolean(node.path[1]);
      let anchor: CommentAnchor;

      if (isRuleArray) {
        const key = node.path[1] ?? "";
        const index = (state.ruleIndex.get(key) ?? -1) + 1;
        state.ruleIndex.set(key, index);
        anchor = { kind: "rule", key, index };
      } else {
        anchor = { kind: "section", path: [...node.path] };
      }

      mark(anchor);
      flushBlanks(seenContent ? anchor : hasFileHeader ? anchor : undefined);
      flushComments(!seenContent && leading ? fileAnchor : anchor);
      leading = false;
      seenContent = true;
      continue;
    }

    if (node.kind !== "entry") continue;

    if (document.format === "conf" && node.path[0] === "key_mode") {
      const mode = node.value.trim() || "default";
      state.mode = mode;

      const anchor: CommentAnchor = { kind: "section", path: ["bind", mode] };
      mark(anchor);
      flushBlanks(seenContent ? anchor : hasFileHeader ? anchor : undefined);
      flushComments(!seenContent && leading ? fileAnchor : anchor);
      leading = false;
      seenContent = true;

      const inline = inlineComment(node.raw);
      if (inline) comments.push({ text: inline, anchor, position: "inline" });
      continue;
    }

    const anchor = anchorForEntry(node, document.format, state);
    const hasAnchor = anchor.kind !== "unplaced";
    if (hasAnchor) mark(anchor);
    if (document.format === "conf" && anchor.kind === "binding") {
      mark({ kind: "section", path: ["bind", state.mode] });
    }
    if (document.format === "conf" && anchor.kind === "rule") {
      for (const part of node.value.split(",")) {
        const colon = part.indexOf(":");
        if (colon > 0) mark({ ...anchor, field: part.slice(0, colon).trim() });
      }
    }

    let blankAnchor: CommentAnchor | undefined;
    if (seenContent) {
      blankAnchor = hasAnchor ? anchor : { kind: "unplaced" };
    } else if (hasFileHeader && hasAnchor) {
      blankAnchor = anchor;
    }

    if (document.format === "conf") {
      const group = node.path[0] === "env" || node.path[0] === "var" ? node.path[0] : "other";
      if (group !== "other" && lastGroup !== group && seenContent) {
        blankAnchor = { kind: "section", path: [group] };
      }
      lastGroup = group;
    }

    flushBlanks(blankAnchor);
    flushComments(!seenContent && leading ? fileAnchor : hasAnchor ? anchor : { kind: "unplaced" });
    leading = false;
    seenContent = true;

    const inline = inlineComment(node.raw);
    if (inline && hasAnchor) comments.push({ text: inline, anchor, position: "inline" });
  }

  for (const text of pending) {
    comments.push({
      text,
      anchor: seenContent ? { kind: "unplaced" } : fileAnchor,
      position: "before",
    });
  }

  return { format: document.format, canonical: config, comments, blanks, order };
}
