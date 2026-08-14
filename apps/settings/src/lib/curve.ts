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
