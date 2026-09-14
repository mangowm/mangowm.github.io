import type { BezierValue } from "./curve";

/** Sample density mango bakes curves into (mango.c BAKED_POINTS_COUNT). */
const BAKED_POINTS_COUNT = 256;

interface CurvePoint {
  x: number;
  y: number;
}

/**
 * Port of mango's calculate_animation_curve_at (animation/common.h):
 * a cubic bezier with control points (0,0)→(x1,y1)→(x2,y2)→(1,1), sampled
 * at t. `x` is the time-space coordinate, `y` the easing value.
 */
export function calculateCurvePoint(t: number, curve: BezierValue): CurvePoint {
  const mt = 1 - t;
  return {
    x: 3 * t * mt * mt * curve[0] + 3 * t * t * mt * curve[2] + t * t * t,
    y: 3 * t * mt * mt * curve[1] + 3 * t * t * mt * curve[3] + t * t * t,
  };
}

const bakedCache = new Map<string, CurvePoint[]>();

function bakedPoints(curve: BezierValue): CurvePoint[] {
  const key = curve.join(",");
  let points = bakedCache.get(key);
  if (!points) {
    points = Array.from({ length: BAKED_POINTS_COUNT }, (_, i) =>
      calculateCurvePoint(i / (BAKED_POINTS_COUNT - 1), curve),
    );
    bakedCache.set(key, points);
  }
  return points;
}

/**
 * Port of mango's find_animation_curve_at (animation/common.h): binary-search
 * the baked x table to map an elapsed fraction t in [0,1] to the easing
 * progress y. Mirrors mango's behavior of returning the upper table point.
 */
export function findAnimationCurveAt(t: number, curve: BezierValue): number {
  const points = bakedPoints(curve);
  const clamped = Math.min(1, Math.max(0, t));
  let down = 0;
  let up = BAKED_POINTS_COUNT - 1;
  while (up - down !== 1) {
    const middle = (up + down) >> 1;
    if (points[middle].x <= clamped) down = middle;
    else up = middle;
  }
  return points[up].y;
}
