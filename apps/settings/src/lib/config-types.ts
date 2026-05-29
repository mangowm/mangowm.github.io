export interface MangoConfig {
  exec_once: string[];
}

export type RawValue = string[];
export type RawConfig = Record<string, RawValue>;

export type ConfigLine =
  | { type: "entry"; key: string; value: string; raw: string }
  | { type: "comment"; text: string; raw: string }
  | { type: "blank"; raw: string };

export interface ParsedConfig {
  typed: MangoConfig;
  raw: RawConfig;
  lines: ConfigLine[];
}
