import { RULES } from "@mangowm.github.io/schema";

import { parseConf, stripComment } from "./conf";
import type { ConfigDocument } from "./document";
import { normalize, type WarningCode, type WarningSeverity } from "./normalize";
import { parseRule } from "./rule";
import { parseToml, stripTomlComment } from "./toml";
import type { ConfigFormat } from "./types";

export type ValidationCode =
  | WarningCode
  | "syntax"
  | "missing-field"
  | "conflicting-fields"
  | "deprecated";

export interface ValidationIssue {
  line: number;
  column?: number;
  text: string;
  message: string;
  key?: string;
  severity: WarningSeverity;
  code: ValidationCode;
}

interface ArrayFrame {
  startLine: number;
  raw: string;
  expectValue: boolean;
  valueDone: boolean;
}

const RULE_BY_KEY = new Map(RULES.map((rule) => [rule.key as string, rule]));
const TEXT_ENCODER = new TextEncoder();
const MONITOR_MATCHERS = ["name", "make", "model", "serial"] as const;

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

function issue(
  line: number,
  text: string,
  message: string,
  severity: WarningSeverity,
  code: ValidationCode,
  key?: string,
): ValidationIssue {
  return { line, text, message, severity, code, key };
}

function checkConfStructure(text: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  text.split(/\r?\n/).forEach((raw, index) => {
    const line = index + 1;
    const trimmed = raw.trim();
    if (!trimmed || trimmed.startsWith("#")) return;

    const equals = raw.indexOf("=");
    if (equals === -1) {
      issues.push(
        issue(
          line,
          raw,
          "This line is not a setting. Use key = value.",
          "error",
          "syntax",
          keyFromLine(raw),
        ),
      );
      return;
    }

    if (!raw.slice(0, equals).trim()) {
      issues.push(issue(line, raw, "The setting name is empty.", "error", "syntax"));
    }

    const valueText = raw.slice(equals + 1);
    if (TEXT_ENCODER.encode(valueText).length > 255) {
      issues.push(issue(line, raw, "The value exceeds 255 bytes.", "error", "invalid-value"));
    }

    const value = stripComment(valueText).trim();
    const first = value[0];
    if ((first === '"' || first === "'") && (value.length < 2 || !value.endsWith(first))) {
      issues.push(
        issue(
          line,
          raw,
          `The value has an unclosed ${first === '"' ? "double" : "single"} quote.`,
          "error",
          "syntax",
        ),
      );
    }
  });

  return issues;
}

function checkTomlStructure(text: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const arrays: ArrayFrame[] = [];

  text.split(/\r?\n/).forEach((raw, index) => {
    const line = index + 1;
    const content = stripTomlComment(raw);
    const trimmed = content.trim();

    if (arrays.length === 0) {
      if (!trimmed) return;

      if (trimmed.startsWith("[")) {
        if (!trimmed.endsWith("]")) {
          issues.push(issue(line, raw, "The section header is not closed.", "error", "syntax"));
        }
        return;
      }

      const equals = trimmed.indexOf("=");
      if (equals === -1) {
        issues.push(
          issue(
            line,
            raw,
            "This line is not a section or setting. Use key = value.",
            "error",
            "syntax",
            keyFromLine(raw),
          ),
        );
        return;
      }

      if (!trimmed.slice(0, equals).trim()) {
        issues.push(issue(line, raw, "The setting name is empty.", "error", "syntax"));
      }
    }

    const start = arrays.length === 0 ? Math.max(0, content.indexOf("=") + 1) : 0;
    scanTomlLine(content, start, line, raw, arrays, issues);
  });

  for (const frame of arrays) {
    issues.push(issue(frame.startLine, frame.raw, "The array is not closed.", "error", "syntax"));
  }

  return issues;
}

function scanTomlLine(
  content: string,
  start: number,
  line: number,
  raw: string,
  arrays: ArrayFrame[],
  issues: ValidationIssue[],
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
        issues.push(issue(line, raw, "Unexpected ].", "error", "syntax"));
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
        issues.push(
          issue(line, raw, "The array is missing a value before the comma.", "error", "syntax"),
        );
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
          issues.push(issue(line, raw, "The value has an unclosed quote.", "error", "syntax"));
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

    issues.push(
      issue(line, raw, "The array is missing a comma between values.", "error", "syntax"),
    );
    frame.expectValue = true;
    frame.valueDone = false;
    index -= 1;
  }

  if (quote) {
    issues.push(issue(line, raw, "The value has an unclosed quote.", "error", "syntax"));
  }
}

interface RuleGroup {
  key: string;
  line: number;
  value: string;
}

function collectRuleGroups(document: ConfigDocument): RuleGroup[] {
  const groups: RuleGroup[] = [];

  if (document.format === "conf") {
    for (const node of document.nodes) {
      if (node.kind !== "entry") continue;
      const key = node.path[0] ?? "";
      if (RULE_BY_KEY.has(key)) groups.push({ key, line: node.at.line, value: node.value });
    }
    return groups;
  }

  let current: { key: string; line: number; parts: string[] } | null = null;
  const flush = () => {
    if (current && current.parts.length > 0) {
      groups.push({ key: current.key, line: current.line, value: current.parts.join(",") });
    }
    current = null;
  };

  for (const node of document.nodes) {
    if (node.kind === "section") {
      flush();
      if (node.path[0] === "rule" && node.path[1] && RULE_BY_KEY.has(node.path[1])) {
        current = { key: node.path[1], line: node.at.line, parts: [] };
      }
      continue;
    }

    if (
      node.kind === "entry" &&
      current &&
      node.path[0] === "rule" &&
      node.path[1] === current.key
    ) {
      const field = node.path[2] ?? "";
      if (field) current.parts.push(`${field}:${node.value}`);
    }
  }

  flush();
  return groups;
}

function checkRuleGroup(group: RuleGroup): ValidationIssue[] {
  const rule = RULE_BY_KEY.get(group.key);
  if (!rule) return [];

  const parsed = parseRule(rule, group.value);
  const record = parsed.record;
  const issues: ValidationIssue[] = [];

  if (rule.key === "monitor_rule") {
    const hasMatcher = MONITOR_MATCHERS.some((key) => record[key] !== undefined);
    if (!hasMatcher) {
      issues.push(
        issue(
          group.line,
          group.value,
          "Monitor rule needs at least one of name, make, model, or serial.",
          "error",
          "missing-field",
        ),
      );
    }

    const hasWidth = typeof record.width === "number" && record.width > 0;
    const hasHeight = typeof record.height === "number" && record.height > 0;
    const hasRefresh = typeof record.refresh === "number" && record.refresh > 0;
    if (hasWidth !== hasHeight || hasWidth !== hasRefresh) {
      issues.push(
        issue(
          group.line,
          group.value,
          "Set width, height, and refresh together.",
          "error",
          "conflicting-fields",
        ),
      );
    }

    if (record.custom === true && !hasWidth) {
      issues.push(
        issue(
          group.line,
          group.value,
          "Custom mode needs width, height, and refresh.",
          "error",
          "missing-field",
        ),
      );
    }

    if ((record.x !== undefined) !== (record.y !== undefined)) {
      issues.push(
        issue(group.line, group.value, "Set x and y together.", "error", "conflicting-fields"),
      );
    }
  }

  if (rule.key === "device_rule" && record.type === "touchpad") {
    issues.push(
      issue(
        group.line,
        group.value,
        "touchpad is deprecated. Use trackpad.",
        "warning",
        "deprecated",
      ),
    );
  }

  if (
    (rule.key === "window_rule" || rule.key === "window_rule_once") &&
    typeof record.global_key_binding === "string"
  ) {
    if (!/^[A-Za-z0-9_+]+-\S+$/.test(record.global_key_binding)) {
      issues.push(
        issue(
          group.line,
          group.value,
          "Global key binding must use Modifier-Keysym format.",
          "error",
          "invalid-value",
        ),
      );
    }
  }

  return issues;
}

/** Validate config text and return structural, semantic, and normalization issues. */
export function validateText(text: string, format: ConfigFormat): ValidationIssue[] {
  const document = format === "toml" ? parseToml(text) : parseConf(text);
  const issues = format === "toml" ? checkTomlStructure(text) : checkConfStructure(text);
  const errorLines = new Set(
    issues.filter((candidate) => candidate.severity === "error").map((candidate) => candidate.line),
  );
  const texts = rawTexts(document);
  const keys = keyByLine(document);

  for (const node of document.nodes) {
    if (node.kind !== "raw" || errorLines.has(node.at.line)) continue;
    issues.push(
      issue(
        node.at.line,
        node.raw,
        format === "toml"
          ? "This line is not a section or setting. Use key = value."
          : "This line is not a setting. Use key = value.",
        "error",
        "syntax",
        keyFromLine(node.raw),
      ),
    );
    errorLines.add(node.at.line);
  }

  for (const group of collectRuleGroups(document)) {
    for (const ruleIssue of checkRuleGroup(group)) {
      issues.push(ruleIssue);
      if (ruleIssue.severity === "error") errorLines.add(ruleIssue.line);
    }
  }

  for (const warning of normalize(document).warnings) {
    const line = warning.at.line;
    if (errorLines.has(line)) continue;

    issues.push({
      line,
      text: texts.get(line) ?? "",
      message: warning.message,
      key: keys.get(line) ?? keyFromLine(texts.get(line) ?? ""),
      severity: warning.severity,
      code: warning.code,
    });
  }

  const seen = new Set<string>();
  return issues
    .filter((candidate) => {
      const id = `${candidate.line}:${candidate.code}:${candidate.message}`;
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    })
    .sort((left, right) => {
      if (left.severity !== right.severity) return left.severity === "error" ? -1 : 1;
      return left.line - right.line;
    });
}
