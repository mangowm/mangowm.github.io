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
