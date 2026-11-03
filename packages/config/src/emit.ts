import { DIRECTIVES, GLOBALS } from "@mangowm.github.io/schema";

import type { AnnotatedComment, AnnotatedConfig, CommentAnchor } from "./annotate";
import { serializeConf } from "./serialize";
import { serializeToml } from "./toml";
import type { ConfigFormat } from "./types";

const GLOBAL_KEYS = new Set<string>(GLOBALS.map((option) => option.key));
const DIRECTIVE_KEYS = new Set<string>(DIRECTIVES.map((directive) => directive.key));

function anchorKey(anchor: CommentAnchor): string {
  switch (anchor.kind) {
    case "global":
      return `g:${anchor.key}`;
    case "directive":
      return `d:${anchor.key}:${anchor.index}`;
    case "pair":
      return `p:${anchor.table}:${anchor.name}`;
    case "binding":
      return `b:${anchor.mode}:${anchor.keyword}:${anchor.trigger}`;
    case "rule":
      return `r:${anchor.key}:${anchor.index}`;
    case "section":
      return `s:${anchor.path.join(".")}`;
    case "file":
      return "file";
    case "unplaced":
      return "unplaced";
  }
}

function commentsByAnchor(comments: AnnotatedComment[]) {
  const before = new Map<string, string[]>();
  const inline = new Map<string, string[]>();

  for (const comment of comments) {
    const key = anchorKey(comment.anchor);
    const target = comment.position === "inline" ? inline : before;
    const list = target.get(key) ?? [];
    list.push(comment.text);
    target.set(key, list);
  }

  return { before, inline };
}

function confLineAnchor(line: string, counters: Map<string, number>): string | undefined {
  const match = /^([A-Za-z0-9_]+)\s*=\s*(.*)$/.exec(line);
  if (!match) return undefined;

  const key = match[1] ?? "";
  const value = match[2] ?? "";

  if (key === "env" || key === "var") {
    const comma = value.indexOf(",");
    return comma === -1 ? undefined : `p:${key}:${value.slice(0, comma).trim()}`;
  }

  if (DIRECTIVE_KEYS.has(key)) {
    const index = counters.get(key) ?? 0;
    counters.set(key, index + 1);
    return `d:${key}:${index}`;
  }

  if (GLOBAL_KEYS.has(key)) return `g:${key}`;
  return undefined;
}

function tomlLineAnchor(
  line: string,
  section: string[],
  counters: Map<string, number>,
): string | undefined {
  const match = /^"?([^"=]+?)"?\s*=\s*(.*)$/.exec(line);
  if (!match) return undefined;

  const key = (match[1] ?? "").trim();
  const head = section[0] ?? "";

  if (head === "global") {
    if (DIRECTIVE_KEYS.has(key)) {
      const index = counters.get(key) ?? 0;
      counters.set(key, index + 1);
      return `d:${key}:${index}`;
    }
    if (GLOBAL_KEYS.has(key)) return `g:${key}`;
    return undefined;
  }

  if (head === "env" || head === "var") return `p:${head}:${key}`;
  return undefined;
}

function applyComments(text: string, format: ConfigFormat, comments: AnnotatedComment[]): string {
  const { before, inline } = commentsByAnchor(comments);
  const used = new Set<string>();
  const lines = text.split("\n");
  const output: string[] = [];
  const counters = new Map<string, number>();
  let section: string[] = [];

  for (const line of lines) {
    if (format === "toml") {
      const header = /^\[([^\]]+)\]$/.exec(line);
      if (header) {
        section = (header[1] ?? "").split(".");
        output.push(line);
        continue;
      }
    }

    const anchor =
      line.trim() === ""
        ? undefined
        : format === "toml"
          ? tomlLineAnchor(line, section, counters)
          : confLineAnchor(line, counters);

    if (!anchor) {
      output.push(line);
      continue;
    }

    used.add(anchor);
    const leading = before.get(anchor);
    if (leading) output.push(...leading);

    const trailing = inline.get(anchor);
    output.push(trailing ? `${line} ${trailing.join(" ")}` : line);
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
