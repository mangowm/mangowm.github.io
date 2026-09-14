import { DEFAULTS } from "./defaults";
import type { ConfigData } from "./config-types";

function defaultStr(key: string): string {
  return DEFAULTS[key]?.[0] ?? "";
}

function defaultNum(key: string): number {
  const v = DEFAULTS[key]?.[0];
  return v !== undefined ? Number(v) : 0;
}

function defaultBool(key: string): boolean {
  return DEFAULTS[key]?.[0] === "1";
}

/** First value for `key`, or `fallback` if provided, or the compositor default. */
export function cfgStr(data: ConfigData, key: string, fallback?: string): string {
  return data[key]?.[0] ?? fallback ?? defaultStr(key);
}

/** Boolean from "0"/"1" — anything other than "1" is false. */
export function cfgBool(data: ConfigData, key: string, fallback?: boolean): boolean {
  const raw = data[key]?.[0];
  if (raw === undefined) return fallback ?? defaultBool(key);
  return raw === "1";
}

/** Integer scalar, clamped to [min, max]. */
export function cfgInt(
  data: ConfigData,
  key: string,
  fallback?: number,
  min?: number,
  max?: number,
): number {
  const raw = data[key]?.[0];
  const resolvedFallback = fallback ?? defaultNum(key);
  const lo = min ?? -Infinity;
  const hi = max ?? Infinity;
  if (raw === undefined) return clamp(resolvedFallback, lo, hi);
  const n = parseInt(raw, 10);
  return isNaN(n) ? clamp(resolvedFallback, lo, hi) : clamp(n, lo, hi);
}

/** Float scalar, clamped to [min, max]. */
export function cfgFloat(
  data: ConfigData,
  key: string,
  fallback?: number,
  min?: number,
  max?: number,
): number {
  const raw = data[key]?.[0];
  const resolvedFallback = fallback ?? defaultNum(key);
  const lo = min ?? -Infinity;
  const hi = max ?? Infinity;
  if (raw === undefined) return clamp(resolvedFallback, lo, hi);
  const n = parseFloat(raw);
  return isNaN(n) ? clamp(resolvedFallback, lo, hi) : clamp(n, lo, hi);
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}
