import { normalize, type ConfigDocument } from "@mangowm.github.io/config";

import { parseDocument } from "./parse";
import type { FileFormat } from "./types";

export interface SyntaxIssue {
  line: number;
  text: string;
  message: string;
  key?: string;
  severity: "error" | "warning";
}

function keyFromLine(line: string): string | undefined {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("[")) return undefined;
  return /^([A-Za-z0-9_-]+)/.exec(trimmed)?.[1];
}

function rawTexts(document: ConfigDocument): Map<number, string> {
  const texts = new Map<number, string>();
  for (const node of document.nodes) {
    if (node.kind === "raw" || node.kind === "entry") texts.set(node.at.line, node.raw);
  }
  return texts;
}

function keyByLine(document: ConfigDocument): Map<number, string> {
  const keys = new Map<number, string>();
  for (const node of document.nodes) {
    if (node.kind !== "entry") continue;
    const key = node.path[node.path.length - 1];
    if (key) keys.set(node.at.line, key);
  }
  return keys;
}

/** Find syntax errors and normalization warnings in edited config text. */
export function validateText(text: string, format: FileFormat): SyntaxIssue[] {
  const document = parseDocument(text, format);
  const texts = rawTexts(document);
  const keys = keyByLine(document);
  const issues: SyntaxIssue[] = [];

  for (const node of document.nodes) {
    if (node.kind !== "raw") continue;
    const key = keyFromLine(node.raw);
    issues.push({
      line: node.at.line,
      text: node.raw,
      message:
        format === "toml"
          ? "This line is not a section or setting. Use [section] or key = value."
          : "This line is not a setting. Use key = value.",
      key,
      severity: "error",
    });
  }

  try {
    for (const warning of normalize(document).warnings) {
      const line = warning.at.line;
      issues.push({
        line,
        text: texts.get(line) ?? "",
        message: warning.message,
        key: keys.get(line) ?? keyFromLine(texts.get(line) ?? ""),
        severity: "warning",
      });
    }
  } catch {
    // The document parser already reported anything structural.
  }

  const seen = new Set<string>();
  return issues
    .filter((issue) => {
      const id = `${issue.line}:${issue.message}`;
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    })
    .sort((left, right) => {
      if (left.severity !== right.severity) return left.severity === "error" ? -1 : 1;
      return left.line - right.line;
    });
}
