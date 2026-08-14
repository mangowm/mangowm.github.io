import { useEffect, useRef, useState } from "react";
import type { BezierValue } from "@/lib/curve";

interface BezierEditorProps {
  value: BezierValue;
  onChange: (value: BezierValue) => void;
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const sx = (v: number) => v * 100;
const sy = (v: number) => (1 - v) * 100;

/**
 * Interactive cubic-bezier plot. Dragging the two control handles edits the
 * curve; changes commit on pointer release so undo history stays clean.
 * Handles are clamped to the 0..1 box (mango rejects negative values).
 */
export function BezierEditor({ value, onChange }: BezierEditorProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [drag, setDrag] = useState<{ index: 0 | 1; value: BezierValue } | null>(null);

  const displayed = drag ? drag.value : value;
  const [x1, y1, x2, y2] = displayed;

  const toCurvePoint = (clientX: number, clientY: number): [number, number] | null => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return null;
    return [
      clamp01((clientX - rect.left) / rect.width),
      clamp01(1 - (clientY - rect.top) / rect.height),
    ];
  };

  const handlePointerDown = (index: 0 | 1) => (e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as Element).setPointerCapture(e.pointerId);
    setDrag({ index, value: [...value] as BezierValue });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!drag) return;
    const pt = toCurvePoint(e.clientX, e.clientY);
    if (!pt) return;
    const next = [...drag.value] as BezierValue;
    next[drag.index * 2] = pt[0];
    next[drag.index * 2 + 1] = pt[1];
    setDrag({ index: drag.index, value: next });
  };

  const handlePointerUp = () => {
    if (drag) onChange(drag.value);
    setDrag(null);
  };

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 100 100"
      className="aspect-square w-full touch-none select-none"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {[0.25, 0.5, 0.75].map((g) => (
        <g key={g} stroke="hsl(var(--muted-foreground) / 0.3)" strokeWidth="0.6">
          <line x1={sx(g)} y1="0" x2={sx(g)} y2="100" />
          <line x1="0" y1={sy(g)} x2="100" y2={sy(g)} />
        </g>
      ))}

      <line
        x1="0"
        y1="100"
        x2={sx(x1)}
        y2={sy(y1)}
        stroke="hsl(var(--muted-foreground) / 0.6)"
        strokeWidth="1"
        strokeDasharray="3 3"
      />
      <line
        x1="100"
        y1="0"
        x2={sx(x2)}
        y2={sy(y2)}
        stroke="hsl(var(--muted-foreground) / 0.6)"
        strokeWidth="1"
        strokeDasharray="3 3"
      />

      <path
        d={`M0 100 C ${sx(x1)} ${sy(y1)} ${sx(x2)} ${sy(y2)} 100 0`}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
        strokeLinecap="round"
      />

      <circle
        cx="0"
        cy="100"
        r="2.2"
        fill="hsl(var(--background))"
        stroke="hsl(var(--muted-foreground))"
        strokeWidth="1.2"
      />
      <circle
        cx="100"
        cy="0"
        r="2.2"
        fill="hsl(var(--background))"
        stroke="hsl(var(--muted-foreground))"
        strokeWidth="1.2"
      />

      <circle
        cx={sx(x1)}
        cy={sy(y1)}
        r="4"
        fill="hsl(var(--background))"
        stroke="hsl(var(--primary))"
        strokeWidth="1.5"
        className="cursor-grab active:cursor-grabbing"
        onPointerDown={handlePointerDown(0)}
      />
      <circle
        cx={sx(x2)}
        cy={sy(y2)}
        r="4"
        fill="hsl(var(--background))"
        stroke="hsl(var(--primary))"
        strokeWidth="1.5"
        className="cursor-grab active:cursor-grabbing"
        onPointerDown={handlePointerDown(1)}
      />

      <PreviewDot value={displayed} />
    </svg>
  );
}

function PreviewDot({ value }: { value: BezierValue }) {
  const [t, setT] = useState(0);
  const [x1, y1, x2, y2] = value;

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      setT(((now - start) / 4000) % 1);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const mt = 1 - t;
  const px = sx(3 * mt * mt * t * x1 + 3 * mt * t * t * x2 + t * t * t);
  const py = 100 * (mt * mt * mt + 3 * mt * mt * t * (1 - y1) + 3 * mt * t * t * (1 - y2));

  return <circle cx={px} cy={py} r="1.6" fill="hsl(var(--primary))" opacity="0.85" />;
}
