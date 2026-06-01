// ---------------------------------------------------------------------------
// config-parse.ts
// Parses and serializes the mango flat key=value config format.
//
// Format rules:
//   - Lines starting with # are comments.
//   - Blank lines are preserved.
//   - All other lines must match:  key = value  (whitespace around = is optional)
//   - Any key may appear multiple times; each occurrence is a separate entry.
//   - Lines without an = are treated as unparseable and preserved as comments.
// ---------------------------------------------------------------------------

import type { ConfigData, ConfigLine, ParsedConfig } from "./config-types";

export function parseConfig(text: string): ParsedConfig {
  const data: ConfigData = {};
  const lines: ConfigLine[] = [];

  for (const raw of text.split("\n")) {
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
      // Preserve unparseable lines verbatim as comments so nothing is lost.
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

/**
 * Serializes a ParsedConfig back to text.
 *
 * Strategy:
 *   1. Walk the original line list in order.
 *   2. For every "entry" line, consume the next value for that key from
 *      a working buffer (FIFO per key). This preserves original line
 *      positions for values that existed before.
 *   3. Any values left in the buffer after the walk (newly added entries
 *      that have no existing line slot) are appended at the end.
 *   4. If an entry line's key no longer exists in data (i.e. all values
 *      were removed), that line is dropped.
 */
export function serializeConfig({ data, lines }: ParsedConfig): string {
  // Build a per-key FIFO queue from the current data.
  const buffer = new Map<string, string[]>();
  for (const [key, values] of Object.entries(data)) {
    buffer.set(key, [...values]);
  }

  const out: string[] = [];

  for (const line of lines) {
    if (line.type !== "entry") {
      out.push(line.raw);
      continue;
    }

    const queue = buffer.get(line.key);
    if (!queue || queue.length === 0) {
      // This key was fully removed — drop the line.
      continue;
    }

    // Take the next value for this key and emit the canonical form.
    out.push(`${line.key} = ${queue.shift()}`);
  }

  // Append values that were added and have no existing line slot.
  for (const [key, remaining] of buffer) {
    for (const value of remaining) {
      out.push(`${key} = ${value}`);
    }
  }

  return out.join("\n");
}
