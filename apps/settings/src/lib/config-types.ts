export type MangoConfigKey = "exec-once" | "exec" | (string & {});

export type ConfigData = Record<string, string[]>;

export type ConfigLine =
  | { type: "entry"; key: string; value: string; raw: string }
  | { type: "comment"; text: string; raw: string }
  | { type: "blank"; raw: string };

export interface ParsedConfig {
  data: ConfigData;
  lines: ConfigLine[];
}

/**
 * Represents a single config file (the main config.conf or any file
 * pulled in via a `source=` directive).
 */
export interface SourceFile {
  /** Resolved absolute path on disk. */
  absPath: string;
  /** The path as written in the `source=` directive (e.g. "colors.conf").
   *  For the main config.conf this is "config.conf". */
  refPath: string;
  /** Parsed lines — used as template during serialization. */
  lines: ConfigLine[];
  /** Entries belonging to this file only (not merged). */
  data: ConfigData;
}
