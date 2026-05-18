"use client";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  CARD_ACTIVE,
  CARD_BASE,
  CARD_INACTIVE,
  CARD_TRANSITION,
  TIMINGS,
  TOTAL_DURATION,
} from "./constants";

// ─── Algorithm ────────────────────────────────────────────────────────────────

interface Rect {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

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
    // Vertical Logic
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

// ─── Animation helpers ────────────────────────────────────────────────────────

interface CardRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface FairLayoutProps {
  orientation: "horizontal" | "vertical";
}

const GAP = 12;

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * FairLayout — evenly distributes windows using an approximately-square grid
 * that balances rows and columns.
 *
 * Orientation controls whether the grid is row-major (horizontal) or
 * column-major (vertical).
 *
 * Phase guide (total duration matches other layouts — 9500ms):
 *  0  – init
 *  1  – 1 window
 *  2  – 2 windows → 3 windows (sub-timeout)
 *  3  – 4 windows → 5 windows (sub-timeout)
 *  4  – swap: window 4 ↔ window 5
 *  5  – return swap
 *  6  – 5 windows → 4 windows (sub-timeout)
 *  7  – 3 windows → 2 windows (sub-timeout)
 *  8  – 1 window
 */
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

  // Apply CSS transition once on mount
  useEffect(() => {
    for (const ref of [r1, r2, r3, r4, r5]) {
      if (ref.current) ref.current.style.transition = CARD_TRANSITION;
    }
  }, []);

  // Sub-phase timing logic — cascades through window counts
  // like DwindleLayout to stay within the shared TIMINGS duration.
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

  // Position cards whenever active count or swap state changes
  useEffect(() => {
    const update = () => {
      const container = containerRef.current;
      if (!container) return;

      const { clientWidth: width, clientHeight: height } = container;

      // Pre-compute layouts for 1-5 windows using the fair algorithm
      const layouts = [
        [],
        calculateFairLayout(1, width, height, GAP, orientation),
        calculateFairLayout(2, width, height, GAP, orientation),
        calculateFairLayout(3, width, height, GAP, orientation),
        calculateFairLayout(4, width, height, GAP, orientation),
        calculateFairLayout(5, width, height, GAP, orientation),
      ];

      const getTarget = (index: number, active: number): CardRect => {
        const targetSize = Math.max(active, index + 1);
        const r = layouts[targetSize]?.[index] ?? layouts[1][0];
        return { x: r.x, y: r.y, w: r.width, h: r.height };
      };

      let pos0 = getTarget(0, activeWindows);
      let pos1 = getTarget(1, activeWindows);
      let pos2 = getTarget(2, activeWindows);
      let pos3 = getTarget(3, activeWindows);
      let pos4 = getTarget(4, activeWindows);

      // Swap last two windows (4 ↔ 5)
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

  // Animation loop
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
    <div ref={containerRef} className="relative h-full w-full overflow-hidden p-4">
      {refs.map((ref, i) => (
        <div key={i} ref={ref} className="absolute opacity-0">
          {i + 1}
        </div>
      ))}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function setCard(
  el: HTMLDivElement | null,
  { x, y, w, h }: CardRect,
  visible: boolean,
  active: boolean,
) {
  if (!el) return;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  el.style.width = `${w}px`;
  el.style.height = `${h}px`;
  el.style.opacity = visible ? "1" : "0";
  el.style.transform = visible ? "scale(1)" : "scale(0.9)";
  el.className = cn(CARD_BASE, active ? CARD_ACTIVE : CARD_INACTIVE);
}
