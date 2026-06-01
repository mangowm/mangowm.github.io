import type { ConfigData } from "./config-types";

// Pure functions — they only transform ConfigData, never touch React/state.

/** First value for `key`, or `fallback` if absent. */
export function cfgStr(data: ConfigData, key: string, fallback: string): string {
  return data[key]?.[0] ?? fallback;
}

/** Boolean from "0"/"1" — anything other than "1" is false. */
export function cfgBool(data: ConfigData, key: string, fallback: boolean = false): boolean {
  const raw = data[key]?.[0];
  if (raw === undefined) return fallback;
  return raw === "1";
}

/** Integer scalar, clamped to [min, max]. */
export function cfgInt(
  data: ConfigData,
  key: string,
  fallback: number,
  min: number = -Infinity,
  max: number = Infinity,
): number {
  const raw = data[key]?.[0];
  if (raw === undefined) return clamp(fallback, min, max);
  const n = parseInt(raw, 10);
  return isNaN(n) ? clamp(fallback, min, max) : clamp(n, min, max);
}

/** Float scalar, clamped to [min, max]. */
export function cfgFloat(
  data: ConfigData,
  key: string,
  fallback: number,
  min: number = -Infinity,
  max: number = Infinity,
): number {
  const raw = data[key]?.[0];
  if (raw === undefined) return clamp(fallback, min, max);
  const n = parseFloat(raw);
  return isNaN(n) ? clamp(fallback, min, max) : clamp(n, min, max);
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}
