import type { ConfigData, ConfigLine, ParsedConfig } from "./config-types";

/**
 * Parses the mango flat key=value config format.
 * Lines starting with # are comments. Blank lines are preserved.
 * Lines without = are preserved as comments to avoid data loss.
 */
export function parseConfig(text: string): ParsedConfig {
  const data: ConfigData = {};
  const lines: ConfigLine[] = [];

  for (const raw of text.split(/\r?\n/)) {
    const trimmed = raw.trim();

    if (!trimmed) {
      lines.push({ type: "blank", raw });
      continue;
    }

    if (trimmed.startsWith("#")) {
      lines.push({ type: "comment", text: trimmed, raw });
      continue;
    }

    const eq = trimmed.indexOf("=");
    if (eq === -1) {
      lines.push({ type: "comment", text: trimmed, raw });
      continue;
    }

    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();

    lines.push({ type: "entry", key, value, raw });

    if (!data[key]) data[key] = [];
    data[key].push(value);
  }

  return { data, lines };
}

/** Serialize lines back to text (values live in `raw` on each line). */
export function serializeConfig(lines: ConfigLine[]): string {
  return lines.map((l) => l.raw).join("\n");
}

/** Create an entry line with `raw` in sync. */
export function makeEntryLine(key: string, value: string): ConfigLine {
  return { type: "entry", key, value, raw: `${key} = ${value}` };
}
