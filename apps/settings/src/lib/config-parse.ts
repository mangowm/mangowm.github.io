import { ConfigData, ConfigLine, ParsedConfig } from "./config-types";

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

    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) {
      // Treat lines without '=' as comments/invalid to preserve them
      lines.push({ type: "comment", text: trimmed, raw });
      continue;
    }

    const key = trimmed.substring(0, eqIdx).trim();
    const value = trimmed.substring(eqIdx + 1).trim();

    lines.push({ type: "entry", key, value, raw });

    if (!data[key]) {
      data[key] = [];
    }
    data[key].push(value);
  }

  return { data, lines };
}

export function serializeConfig(parsed: ParsedConfig): string {
  const { data, lines } = parsed;
  const buffer = new Map<string, string[]>();

  for (const [key, values] of Object.entries(data)) {
    buffer.set(key, [...values]);
  }

  const result: string[] = [];

  for (const line of lines) {
    if (line.type === "entry") {
      const arr = buffer.get(line.key);
      if (arr && arr.length > 0) {
        const val = arr.shift();
        result.push(`${line.key} = ${val}`);
      }
    } else {
      result.push(line.raw);
    }
  }

  // Append entries added via the UI that don't have a matching line yet
  for (const [key, values] of buffer.entries()) {
    for (const val of values) {
      result.push(`${key} = ${val}`);
    }
  }

  return result.join("\n");
}
