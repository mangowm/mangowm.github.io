import { parseCurve as parseConfigCurve } from "@mangowm.github.io/config";

/** Parse a curve value, returning null instead of throwing on invalid input. */
export function parseCurve(value: string): number[] | null {
  try {
    return parseConfigCurve(value);
  } catch {
    return null;
  }
}

/** Cubic-bezier control points [x1, y1, x2, y2], each clamped to 0..1. */
export type BezierValue = [number, number, number, number];

/** Serialize four numbers back to a comma-separated mango curve string. */
export function serializeCurve(curve: BezierValue): string {
  return curve.map((n) => String(Number(n.toFixed(3)))).join(",");
}
