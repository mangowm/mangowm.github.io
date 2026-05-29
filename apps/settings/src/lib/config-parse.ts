import type { ConfigLine, ParsedConfig, MangoConfig, RawConfig } from "./config-types";

export function parseConfig(text: string): ParsedConfig {
  const typed: MangoConfig = { exec_once: [] };
  const raw: RawConfig = {};
  const lines: ConfigLine[] = [];

  for (const rawLine of text.split("\n")) {
    const trimmed = rawLine.trim();

    if (trimmed === "") {
      lines.push({ type: "blank", raw: rawLine });
      continue;
    }

    if (trimmed.startsWith("#")) {
      lines.push({ type: "comment", text: trimmed, raw: rawLine });
      continue;
    }

    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) {
      lines.push({ type: "comment", text: trimmed, raw: rawLine });
      continue;
    }

    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();

    lines.push({ type: "entry", key, value, raw: rawLine });

    if (key === "exec-once") {
      typed.exec_once.push(value);
    } else {
      if (!raw[key]) raw[key] = [];
      raw[key].push(value);
    }
  }

  return { typed, raw, lines };
}

export function serializeConfig(parsed: ParsedConfig): string {
  const { typed, raw, lines } = parsed;

  const buffer = new Map<string, string[]>();

  for (const cmd of typed.exec_once) {
    const arr = buffer.get("exec-once") ?? [];
    arr.push(cmd);
    buffer.set("exec-once", arr);
  }

  for (const [key, values] of Object.entries(raw)) {
    if (!buffer.has(key)) {
      buffer.set(key, [...values]);
    }
  }

  function consume(key: string): string | null {
    const arr = buffer.get(key);
    if (!arr || arr.length === 0) return null;
    return arr.shift()!;
  }

  const result: string[] = [];

  for (const line of lines) {
    if (line.type === "entry") {
      const val = consume(line.key);
      if (val !== null) {
        result.push(`${line.key}=${val}`);
      }
    } else {
      result.push(line.raw);
    }
  }

  for (const [key, values] of buffer) {
    for (const val of values) {
      result.push(`${key}=${val}`);
    }
  }

  return result.join("\n");
}
