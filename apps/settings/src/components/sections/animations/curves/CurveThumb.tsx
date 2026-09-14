import type { BezierValue } from "@/lib/curve";

interface CurveThumbProps {
  curve: BezierValue;
  className?: string;
}

/** Tiny SVG rendering of a cubic-bezier curve, themed via `currentColor`. */
export function CurveThumb({ curve, className }: CurveThumbProps) {
  const [x1, y1, x2, y2] = curve;
  const d = `M0 40 C ${x1 * 40} ${(1 - y1) * 40} ${x2 * 40} ${(1 - y2) * 40} 40 0`;
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
