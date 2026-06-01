// ---------------------------------------------------------------------------
// config-helpers.ts
// Pure utility functions for reading values out of ConfigData in panel code.
//
// These replace the copy-pasted val/readVal/enabled/isEnabled/readInt/
// clampInt/clampFloat/readFloat functions that previously lived inline
// in every panel file.
//
// None of these functions touch React state or the store.
// They only transform the `data: ConfigData` snapshot that a panel
// already has from `useConfigStore((s) => s.data)`.
// ---------------------------------------------------------------------------

import type { ConfigData } from "./config-types";

// ---------------------------------------------------------------------------
// Raw string access
// ---------------------------------------------------------------------------

/**
 * Return the first value for `key`, or `fallback` if absent.
 * Use this for scalar keys (blur_radius, borderpx, focused_opacity, …).
 */
export function cfgStr(data: ConfigData, key: string, fallback: string): string {
  return data[key]?.[0] ?? fallback;
}

/**
 * Return all values for `key`.
 * Use this for multi-value keys (bind=, exec-once=, env=, …).
 * Returns an empty array when the key is absent — never undefined.
 */
export function cfgList(data: ConfigData, key: string): string[] {
  return data[key] ?? [];
}

// ---------------------------------------------------------------------------
// Typed scalar readers
// ---------------------------------------------------------------------------

/**
 * Read a boolean from a "0" / "1" scalar key.
 * Anything other than "1" is considered false.
 */
export function cfgBool(data: ConfigData, key: string, fallback: boolean = false): boolean {
  const raw = data[key]?.[0];
  if (raw === undefined) return fallback;
  return raw === "1";
}

/**
 * Read an integer scalar, clamped to [min, max].
 * Returns `min` if the value is absent or cannot be parsed.
 */
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

/**
 * Read a float scalar, clamped to [min, max].
 * Returns `min` if the value is absent or cannot be parsed.
 */
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

// ---------------------------------------------------------------------------
// Internal
// ---------------------------------------------------------------------------

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}
