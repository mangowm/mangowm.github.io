import type { ConfigData, ConfigLine, ParsedConfig } from "./config-types";

/**
 * Parses the mango flat key=value config format.
 * Lines starting with # are comments. Blank lines are preserved.
 * Lines without = are preserved as comments to avoid data loss.
 */
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
 * Serializes back to text, preserving original line order.
 * Walks the original lines; for each entry line consumes the next value
 * from a per-key FIFO buffer. Remaining values (new additions) are
 * appended at the end. Dropped keys cause their lines to be removed.
 */
export function serializeConfig({ data, lines }: ParsedConfig): string {
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
    if (!queue || queue.length === 0) continue;

    out.push(`${line.key} = ${queue.shift()}`);
  }

  for (const [key, remaining] of buffer) {
    for (const value of remaining) {
      out.push(`${key} = ${value}`);
    }
  }

  return out.join("\n");
}
