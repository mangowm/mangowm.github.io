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

// ─── Types ────────────────────────────────────────────────────────────────────

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface CenterTileLayoutProps {
  /** Reserved for future vertical variant; currently only affects gap math. */
  orientation: "horizontal" | "vertical";
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * CenterTileLayout — the master window sits in the centre column (2 units wide),
 * flanked by narrow side columns (1 unit each).
 *
 * Phase guide:
 *  0  – init
 *  1  – 1 window (centre only)
 *  2  – 2 windows (centre + right side)
 *  3  – 3 windows (centre + both sides)
 *  4  – swap: window 1 (centre) ↔ window 3 (right side)
 *  5  – return swap
 *  6  – 2 windows (window 3 gone)
 *  7  – 1 window  (window 2 gone)
 *  8  – hidden
 */
export function CenterTileLayout({ orientation: _orientation }: CenterTileLayoutProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const r1 = useRef<HTMLDivElement>(null);
  const r2 = useRef<HTMLDivElement>(null);
  const r3 = useRef<HTMLDivElement>(null);

  const [phase, setPhase] = useState(0);
  const [loopKey, setLoopKey] = useState(0);

  // Apply CSS transition once on mount
  useEffect(() => {
    for (const ref of [r1, r2, r3]) {
      if (ref.current) ref.current.style.transition = CARD_TRANSITION;
    }
  }, []);

  // Position cards whenever phase changes
  useEffect(() => {
    const update = () => {
      const container = containerRef.current;
      if (!container) return;

      const { clientWidth: width, clientHeight: height } = container;
      const GAP = 16;

      // Column geometry: [side | gap | centre×2 | gap | side]
      const availW = width - 2 * GAP;
      const unit = availW / 4;
      const sideW = unit;
      const centreW = unit * 2;

      const xLeft = 0;
      const xCentre = sideW + GAP;
      const xRight = sideW + centreW + 2 * GAP;

      // Returns [centre, left/right-2, right-3] positions for n active windows
      const getLayout = (n: number): [Rect, Rect, Rect] => {
        const centre: Rect = { x: xCentre, y: 0, w: centreW, h: height };
        const rightSlot: Rect = { x: xRight, y: 0, w: sideW, h: height };
        const leftSlot: Rect = { x: xLeft, y: 0, w: sideW, h: height };

        if (n === 1) return [centre, rightSlot, rightSlot];
        if (n === 2) return [centre, rightSlot, rightSlot];
        return [centre, leftSlot, rightSlot];
      };

      const activeWindows =
        phase >= 1 && phase < 7
          ? phase >= 3 && phase <= 5
            ? 3
            : phase >= 2
              ? 2
              : 1
          : phase >= 7
            ? 1
            : 0;

      const isSwap = phase === 4;

      const focusedWindow = phase <= 1 ? 1 : phase === 2 ? 2 : phase <= 5 ? 3 : phase === 6 ? 2 : 1;

      const [centrePos, w2Pos, w3Pos] = getLayout(activeWindows);

      // Off-screen fallback for hidden windows
      const offRight: Rect = { x: width, y: 0, w: sideW, h: height };

      // ── Window 1 (centre / master) ─────────────────────────────────────
      if (activeWindows >= 1) {
        setCard(
          r1.current,
          isSwap ? w3Pos : centrePos,
          phase > 0 && phase < 8,
          focusedWindow === 1,
        );
      } else {
        setCard(r1.current, { x: xCentre, y: 0, w: centreW, h: height }, false, false);
      }

      // ── Window 2 (left side when 3-up, right side when 2-up) ──────────
      if (activeWindows >= 2) {
        setCard(r2.current, w2Pos, phase >= 2 && phase < 7, focusedWindow === 2);
      } else {
        setCard(r2.current, offRight, false, false);
      }

      // ── Window 3 (right side) ──────────────────────────────────────────
      if (activeWindows >= 3) {
        setCard(
          r3.current,
          isSwap ? centrePos : w3Pos,
          phase >= 3 && phase < 6,
          focusedWindow === 3,
        );
      } else {
        setCard(r3.current, offRight, false, false);
      }
    };

    update();

    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [phase]);

  // Animation loop
  useEffect(() => {
    const timeouts = TIMINGS.map(({ phase: p, delay }) => setTimeout(() => setPhase(p), delay));
    const loop = setTimeout(() => setLoopKey((k) => k + 1), TOTAL_DURATION);
    return () => {
      timeouts.forEach(clearTimeout);
      clearTimeout(loop);
    };
  }, [loopKey]);

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden p-4">
      <div ref={r1} className="absolute opacity-0">
        1
      </div>
      <div ref={r2} className="absolute opacity-0">
        2
      </div>
      <div ref={r3} className="absolute opacity-0">
        3
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function setCard(
  el: HTMLDivElement | null,
  { x, y, w, h }: Rect,
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
