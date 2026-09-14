/**
 * Parse a mango animation-curve value into exactly four non-negative numbers,
 * mirroring parse_double_array (parse_config.h): mango rejects malformed or
 * negative values at config load, and each curve option requires all 4
 * components.
 */
export function parseCurve(value: string): number[] | null {
  const parts = value.split(",").map((p) => p.trim());
  if (parts.length !== 4 || parts.some((p) => p === "")) return null;
  const nums = parts.map(Number);
  if (nums.some((n) => !Number.isFinite(n) || n < 0)) return null;
  return nums;
}

/** Cubic-bezier control points [x1, y1, x2, y2], each clamped to 0..1. */
export type BezierValue = [number, number, number, number];

/** Serialize four numbers back to a comma-separated mango curve string. */
export function serializeCurve(curve: BezierValue): string {
  return curve.map((n) => String(Number(n.toFixed(3)))).join(",");
}
