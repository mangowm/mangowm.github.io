export type ConfigData = Record<string, string[]>;

// Raw text preserved so serialization reproduces comments,
// blank lines, and whitespace exactly.
export type ConfigLine =
  | { type: "entry"; key: string; value: string; raw: string }
  | { type: "comment"; text: string; raw: string }
  | { type: "blank"; raw: string };

export interface ParsedConfig {
  data: ConfigData;
  lines: ConfigLine[];
}

export interface SourceFile {
  absPath: string;
  refPath: string;
  lines: ConfigLine[];
}

/** Count how many entry lines for a given key exist in `lines`. */
export function countLines(lines: ConfigLine[], key: string): number {
  let n = 0;
  for (const line of lines) {
    if (line.type === "entry" && line.key === key) n++;
  }
  return n;
}
