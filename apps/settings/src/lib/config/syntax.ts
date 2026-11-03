import {
  normalize,
  stripComment,
  stripTomlComment,
  type ConfigDocument,
} from "@mangowm.github.io/config";

import { parseDocument } from "./parse";
import type { FileFormat } from "./types";

export interface SyntaxIssue {
  line: number;
  text: string;
  message: string;
  key?: string;
  severity: "error" | "warning";
}

interface ArrayFrame {
  startLine: number;
  raw: string;
  expectValue: boolean;
  valueDone: boolean;
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

function warningSeverity(message: string): "error" | "warning" {
  if (message.startsWith("unknown option ")) return "warning";
  if (message.startsWith("unknown section ")) return "warning";
  if (/^unknown \w+ field /.test(message)) return "warning";
  if (message.includes(" clamped to ")) return "warning";
  return "error";
}

function checkConfStructure(text: string): SyntaxIssue[] {
  const issues: SyntaxIssue[] = [];

  text.split(/\r?\n/).forEach((raw, index) => {
    const line = index + 1;
    const trimmed = raw.trim();
    if (!trimmed || trimmed.startsWith("#")) return;

    const equals = raw.indexOf("=");
    if (equals === -1) {
      issues.push({
        line,
        text: raw,
        message: "This line is not a setting. Use key = value.",
        key: keyFromLine(raw),
        severity: "error",
      });
      return;
    }

    if (!raw.slice(0, equals).trim()) {
      issues.push({
        line,
        text: raw,
        message: "The setting name is empty.",
        severity: "error",
      });
    }

    const value = stripComment(raw.slice(equals + 1)).trim();
    const first = value[0];
    if ((first === '"' || first === "'") && (value.length < 2 || !value.endsWith(first))) {
      issues.push({
        line,
        text: raw,
        message: `The value has an unclosed ${first === '"' ? "double" : "single"} quote.`,
        severity: "error",
      });
    }
  });

  return issues;
}

function checkTomlStructure(text: string): SyntaxIssue[] {
  const issues: SyntaxIssue[] = [];
  const arrays: ArrayFrame[] = [];

  text.split(/\r?\n/).forEach((raw, index) => {
    const line = index + 1;
    const content = stripTomlComment(raw);
    const trimmed = content.trim();

    if (arrays.length === 0) {
      if (!trimmed) return;

      if (trimmed.startsWith("[")) {
        if (!trimmed.endsWith("]")) {
          issues.push({
            line,
            text: raw,
            message: "The section header is not closed.",
            severity: "error",
          });
        }
        return;
      }

      const equals = trimmed.indexOf("=");
      if (equals === -1) {
        issues.push({
          line,
          text: raw,
          message: "This line is not a section or setting. Use key = value.",
          key: keyFromLine(raw),
          severity: "error",
        });
        return;
      }

      if (!trimmed.slice(0, equals).trim()) {
        issues.push({
          line,
          text: raw,
          message: "The setting name is empty.",
          severity: "error",
        });
      }
    }

    const start = arrays.length === 0 ? Math.max(0, content.indexOf("=") + 1) : 0;
    scanTomlLine(content, start, line, raw, arrays, issues);
  });

  for (const frame of arrays) {
    issues.push({
      line: frame.startLine,
      text: frame.raw,
      message: "The array is not closed.",
      severity: "error",
    });
  }

  return issues;
}

function scanTomlLine(
  content: string,
  start: number,
  line: number,
  raw: string,
  arrays: ArrayFrame[],
  issues: SyntaxIssue[],
): void {
  let quote: '"' | "'" | null = null;

  for (let index = start; index < content.length; index++) {
    const char = content[index];

    if (quote) {
      if (quote === '"' && char === "\\") {
        index += 1;
      } else if (char === quote) {
        quote = null;
      }
      continue;
    }

    if (char === '"' || char === "'") {
      if (arrays.length === 0) {
        quote = char;
        continue;
      }
    }

    const frame = arrays[arrays.length - 1];
    if (!frame) {
      if (char === "[") {
        arrays.push({ startLine: line, raw, expectValue: true, valueDone: false });
      } else if (char === "]") {
        issues.push({ line, text: raw, message: "Unexpected ].", severity: "error" });
      }
      continue;
    }

    if (/\s/.test(char)) continue;

    if (frame.expectValue) {
      if (char === "]") {
        arrays.pop();
        const parent = arrays[arrays.length - 1];
        if (parent) {
          parent.expectValue = false;
          parent.valueDone = true;
        }
        continue;
      }

      if (char === ",") {
        issues.push({
          line,
          text: raw,
          message: "The array is missing a value before the comma.",
          severity: "error",
        });
        continue;
      }

      if (char === "[") {
        arrays.push({ startLine: line, raw, expectValue: true, valueDone: false });
        continue;
      }

      if (char === '"' || char === "'") {
        const quoteChar = char;
        let closed = false;

        for (index += 1; index < content.length; index += 1) {
          const next = content[index];
          if (quoteChar === '"' && next === "\\") {
            index += 1;
          } else if (next === quoteChar) {
            closed = true;
            break;
          }
        }

        if (!closed) {
          issues.push({
            line,
            text: raw,
            message: "The value has an unclosed quote.",
            severity: "error",
          });
          return;
        }

        frame.expectValue = false;
        frame.valueDone = true;
        continue;
      }

      while (index < content.length && !/[\s,\]]/.test(content[index] ?? "")) index += 1;
      index -= 1;
      frame.expectValue = false;
      frame.valueDone = true;
      continue;
    }

    if (char === ",") {
      frame.expectValue = true;
      frame.valueDone = false;
      continue;
    }

    if (char === "]") {
      arrays.pop();
      const parent = arrays[arrays.length - 1];
      if (parent) {
        parent.expectValue = false;
        parent.valueDone = true;
      }
      continue;
    }

    issues.push({
      line,
      text: raw,
      message: "The array is missing a comma between values.",
      severity: "error",
    });
    frame.expectValue = true;
    frame.valueDone = false;
    index -= 1;
  }

  if (quote) {
    issues.push({
      line,
      text: raw,
      message: "The value has an unclosed quote.",
      severity: "error",
    });
  }
}

/** Find syntax errors and normalization warnings in edited config text. */
export function validateText(text: string, format: FileFormat): SyntaxIssue[] {
  const document = parseDocument(text, format);
  const issues = format === "toml" ? checkTomlStructure(text) : checkConfStructure(text);
  const errorLines = new Set(issues.map((issue) => issue.line));
  const texts = rawTexts(document);
  const keys = keyByLine(document);

  for (const node of document.nodes) {
    if (node.kind !== "raw" || errorLines.has(node.at.line)) continue;
    issues.push({
      line: node.at.line,
      text: node.raw,
      message:
        format === "toml"
          ? "This line is not a section or setting. Use key = value."
          : "This line is not a setting. Use key = value.",
      key: keyFromLine(node.raw),
      severity: "error",
    });
    errorLines.add(node.at.line);
  }

  try {
    for (const warning of normalize(document).warnings) {
      const line = warning.at.line;
      if (errorLines.has(line)) continue;

      issues.push({
        line,
        text: texts.get(line) ?? "",
        message: warning.message,
        key: keys.get(line) ?? keyFromLine(texts.get(line) ?? ""),
        severity: warningSeverity(warning.message),
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
