// Keys may appear multiple times; every value is a plain string.
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
  data: ConfigData;
}
