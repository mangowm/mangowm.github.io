import { useEffect, useRef, useState } from "react";
import { CARD_TRANSITION, TIMINGS, TOTAL_DURATION, setCard } from "./constants";

interface Rect {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface FairLayoutProps {
  orientation: "horizontal" | "vertical";
}

const GAP = 12;

export function calculateFairLayout(
  n: number,
  containerW: number,
  containerH: number,
  gap: number,
  orientation: "horizontal" | "vertical",
): Rect[] {
  if (n <= 0) return [];
  const rects: Rect[] = [];

  if (orientation === "horizontal") {
    const cols = Math.ceil(Math.sqrt(n));
    const baseRows = Math.floor(n / cols);
    const remainder = n % cols;
    const firstGroupCols = cols - remainder;
    const firstGroupCount = firstGroupCols * baseRows;
    const maxRows = baseRows + (remainder > 0 ? 1 : 0);
    const availW = containerW - (cols - 1) * gap;
    const cw = availW / cols;

    for (let i = 0; i < n; i++) {
      const isFirstGroup = i < firstGroupCount;
      const colIdx = isFirstGroup
        ? Math.floor(i / baseRows)
        : firstGroupCols + Math.floor((i - firstGroupCount) / maxRows);
      const rowIdx = isFirstGroup ? i % baseRows : (i - firstGroupCount) % maxRows;
      const rowsInThisCol = isFirstGroup ? baseRows : maxRows;
      const cx = colIdx * (cw + gap);
      const availH = containerH - (rowsInThisCol - 1) * gap;
      const ch = availH / rowsInThisCol;
      const cy = rowIdx * (ch + gap);
      rects.push({ id: i, x: cx, y: cy, width: cw, height: ch });
    }
  } else {
    const rows = Math.ceil(Math.sqrt(n));
    const baseCols = Math.floor(n / rows);
    const remainder = n % rows;
    const firstGroupRows = rows - remainder;
    const firstGroupCount = firstGroupRows * baseCols;
    const maxCols = baseCols + (remainder > 0 ? 1 : 0);
    const availH = containerH - (rows - 1) * gap;
    const ch = availH / rows;

    for (let i = 0; i < n; i++) {
      const isFirstGroup = i < firstGroupCount;
      const rowIdx = isFirstGroup
        ? Math.floor(i / baseCols)
        : firstGroupRows + Math.floor((i - firstGroupCount) / maxCols);
      const colIdx = isFirstGroup ? i % baseCols : (i - firstGroupCount) % maxCols;
      const colsInThisRow = isFirstGroup ? baseCols : maxCols;
      const cy = rowIdx * (ch + gap);
      const availW = containerW - (colsInThisRow - 1) * gap;
      const cw = availW / colsInThisRow;
      const cx = colIdx * (cw + gap);
      rects.push({ id: i, x: cx, y: cy, width: cw, height: ch });
    }
  }
  return rects;
}

export function FairLayout({ orientation }: FairLayoutProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const r1 = useRef<HTMLDivElement>(null);
  const r2 = useRef<HTMLDivElement>(null);
  const r3 = useRef<HTMLDivElement>(null);
  const r4 = useRef<HTMLDivElement>(null);
  const r5 = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState(0);
  const [loopKey, setLoopKey] = useState(0);
  const [activeWindows, setActiveWindows] = useState(0);
  const [isSwap, setIsSwap] = useState(false);

  useEffect(() => {
    for (const ref of [r1, r2, r3, r4, r5]) {
      if (ref.current) ref.current.style.transition = CARD_TRANSITION;
    }
  }, []);

  useEffect(() => {
    let t1: ReturnType<typeof setTimeout>;
    switch (phase) {
      case 0:
        setActiveWindows(0);
        setIsSwap(false);
        break;
      case 1:
        setActiveWindows(1);
        break;
      case 2:
        setActiveWindows(2);
        t1 = setTimeout(() => setActiveWindows(3), 500);
        break;
      case 3:
        setActiveWindows(4);
        t1 = setTimeout(() => setActiveWindows(5), 600);
        break;
      case 4:
        setIsSwap(true);
        break;
      case 5:
        setIsSwap(false);
        break;
      case 6:
        setActiveWindows(5);
        t1 = setTimeout(() => setActiveWindows(4), 500);
        break;
      case 7:
        setActiveWindows(3);
        t1 = setTimeout(() => setActiveWindows(2), 500);
        break;
      case 8:
        setActiveWindows(1);
        break;
    }
    return () => {
      if (t1) clearTimeout(t1);
    };
  }, [phase]);

  useEffect(() => {
    const update = () => {
      const container = containerRef.current;
      if (!container) return;
      const { clientWidth: width, clientHeight: height } = container;

      const layouts = [
        [],
        calculateFairLayout(1, width, height, GAP, orientation),
        calculateFairLayout(2, width, height, GAP, orientation),
        calculateFairLayout(3, width, height, GAP, orientation),
        calculateFairLayout(4, width, height, GAP, orientation),
        calculateFairLayout(5, width, height, GAP, orientation),
      ];

      const getTarget = (index: number, active: number) => {
        const targetSize = Math.max(active, index + 1);
        const r = layouts[targetSize]?.[index] ?? layouts[1][0];
        return { x: r.x, y: r.y, w: r.width, h: r.height };
      };

      let pos0 = getTarget(0, activeWindows);
      let pos1 = getTarget(1, activeWindows);
      let pos2 = getTarget(2, activeWindows);
      let pos3 = getTarget(3, activeWindows);
      let pos4 = getTarget(4, activeWindows);

      if (isSwap && activeWindows >= 5) {
        const temp = pos3;
        pos3 = pos4;
        pos4 = temp;
      }

      const focusedWindow = Math.max(1, activeWindows);

      setCard(r1.current, pos0, activeWindows >= 1, focusedWindow === 1);
      setCard(r2.current, pos1, activeWindows >= 2, focusedWindow === 2);
      setCard(r3.current, pos2, activeWindows >= 3, focusedWindow === 3);
      setCard(r4.current, pos3, activeWindows >= 4, focusedWindow === 4);
      setCard(r5.current, pos4, activeWindows >= 5, focusedWindow === 5);
    };

    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [activeWindows, isSwap, orientation]);

  useEffect(() => {
    const timeouts = TIMINGS.map(({ phase: p, delay }) => setTimeout(() => setPhase(p), delay));
    const loop = setTimeout(() => setLoopKey((k) => k + 1), TOTAL_DURATION);
    return () => {
      timeouts.forEach(clearTimeout);
      clearTimeout(loop);
    };
  }, [loopKey]);

  const refs = [r1, r2, r3, r4, r5];

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        height: "100%",
        width: "100%",
        overflow: "hidden",
        padding: "1rem",
      }}
    >
      {refs.map((ref, i) => (
        <div key={i} ref={ref} className="card-base" style={{ opacity: 0 }}>
          {i + 1}
        </div>
      ))}
    </div>
  );
}
