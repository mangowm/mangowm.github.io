// ---------------------------------------------------------------------------
// config-types.ts
// Core data model for the mango config system.
//
// The mango config format is a flat list of key=value lines.
// The only structural rule: any key may appear multiple times
// (e.g. bind=, exec-once=, env=) and every occurrence is meaningful.
// All values are raw strings — no type coercion happens here.
// ---------------------------------------------------------------------------

/** Every key and every value is a plain string. No exceptions. */
export type ConfigData = Record<string, string[]>;

/**
 * A single parsed line from a config file.
 * We keep the original raw text for every line so that serialization
 * can reproduce comments, blank lines, and original whitespace exactly.
 */
export type ConfigLine =
  | { type: "entry"; key: string; value: string; raw: string }
  | { type: "comment"; text: string; raw: string }
  | { type: "blank"; raw: string };

/**
 * The result of parsing one config file.
 * `data`  — keyed lookup used by the UI.
 * `lines` — ordered line list used as the write template.
 */
export interface ParsedConfig {
  data: ConfigData;
  lines: ConfigLine[];
}

/**
 * One config file on disk (main config.conf or a sourced child).
 * Each file owns its own `data` and `lines`; they are never merged
 * at this level. Merging happens only in the store.
 */
export interface SourceFile {
  /** Resolved absolute path used for reading/writing. */
  absPath: string;
  /**
   * Path as written in the source= directive, or "config.conf" for
   * the root file. Used only for display and round-trip serialization.
   */
  refPath: string;
  /** Ordered lines — the write template for this file. */
  lines: ConfigLine[];
  /** Entries belonging to this file only (never merged). */
  data: ConfigData;
}
