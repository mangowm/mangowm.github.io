import {
  formatConf,
  formatToml,
  parseConf,
  parseToml,
  type ConfigDocument,
} from "@mangowm.github.io/config";

import type { ConfigData, ConfigLine, FileFormat, ParsedConfig } from "./types";

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

/** Derive the line view used by the form UI. */
export function documentLines(document: ConfigDocument): ConfigLine[] {
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

export function dataFromLines(lines: ConfigLine[]): ConfigData {
  const data: ConfigData = {};
  for (const line of lines) {
    if (line.type === "entry") (data[line.key] ??= []).push(line.value);
  }
  return data;
}

/**
 * Parses the mango flat key=value config format.
 * Lines starting with # are comments. Blank lines are preserved.
 * Lines without = are preserved as comments to avoid data loss.
 */
export function parseConfig(text: string): ParsedConfig {
  const document = parseConf(text);
  const lines = documentLines(document);
  return { data: dataFromLines(lines), lines };
}

/** Serialize lines back to text (values live in `raw` on each line). */
export function serializeConfig(lines: ConfigLine[]): string {
  return lines.map((line) => line.raw).join("\n");
}

/** Create an entry line with `raw` in sync. */
export function makeEntryLine(key: string, value: string): ConfigLine {
  return { type: "entry", key, value, raw: `${key} = ${value}` };
}
