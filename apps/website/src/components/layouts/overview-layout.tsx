import { useEffect, useRef, useState } from "react";
import { cn } from "../../cn";
import { CARD_TRANSITION, TIMINGS, TOTAL_DURATION } from "./constants";

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

const GAP = 10;
const PADDING_RATIO = 0.15;
const MAX_ASPECT_RATIO = 0.65;

export function OverviewLayout() {
  const containerRef = useRef<HTMLDivElement>(null);
  const r1 = useRef<HTMLDivElement>(null);
  const r2 = useRef<HTMLDivElement>(null);
  const r3 = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState(0);
  const [loopKey, setLoopKey] = useState(0);

  useEffect(() => {
    for (const ref of [r1, r2, r3]) {
      if (ref.current) ref.current.style.transition = CARD_TRANSITION;
    }
  }, []);

  useEffect(() => {
    const update = () => {
      const container = containerRef.current;
      if (!container) return;
      const { clientWidth: fullW, clientHeight: fullH } = container;
      const availW = fullW * (1 - PADDING_RATIO * 2);
      const availH = fullH * (1 - PADDING_RATIO * 2);
      const startX = fullW * PADDING_RATIO;
      const startY = fullH * PADDING_RATIO;

      const buildGrid = (n: number): Rect[] => {
        if (n === 0) return [];
        const cols = Math.ceil(Math.sqrt(n));
        const rows = Math.ceil(n / cols);
        const totalGapW = Math.max(0, cols - 1) * GAP;
        const totalGapH = Math.max(0, rows - 1) * GAP;
        const cellW = (availW - totalGapW) / cols;
        let cellH = (availH - totalGapH) / rows;
        if (cellH > cellW * MAX_ASPECT_RATIO) cellH = cellW * MAX_ASPECT_RATIO;
        const gridH = rows * cellH + (rows - 1) * GAP;
        const gridOffsetY = startY + (availH - gridH) / 2;

        return Array.from({ length: n }, (_, i) => {
          const row = Math.floor(i / cols);
          const col = i % cols;
          const itemsInRow = row === rows - 1 ? n - row * cols : cols;
          const rowW = itemsInRow * cellW + (itemsInRow - 1) * GAP;
          const rowOffsetX = startX + (availW - rowW) / 2;
          return {
            x: rowOffsetX + col * (cellW + GAP),
            y: gridOffsetY + row * (cellH + GAP),
            w: cellW,
            h: cellH,
          };
        });
      };

      const activeWindows = phase <= 1 ? 1 : phase === 2 ? 2 : phase <= 6 ? 3 : phase === 7 ? 2 : 1;
      const isSwap = phase === 4;
      const focusedWindow = phase <= 1 ? 1 : phase === 2 ? 2 : phase <= 5 ? 3 : phase === 6 ? 2 : 1;
      const pos = buildGrid(activeWindows);
      const [prePos] = buildGrid(1);

      if (activeWindows >= 1) {
        setCard(r1.current, isSwap ? pos[2] : pos[0], phase > 0 && phase < 8, focusedWindow === 1);
      } else {
        setCard(r1.current, { x: 0, y: 0, w: fullW, h: fullH }, false, false);
      }
      if (activeWindows >= 2) {
        setCard(r2.current, pos[1], phase >= 2 && phase < 7, focusedWindow === 2);
      } else {
        setCard(r2.current, { x: fullW, y: 0, w: prePos.w, h: prePos.h }, false, false);
      }
      if (activeWindows >= 3) {
        setCard(r3.current, isSwap ? pos[0] : pos[2], phase >= 3 && phase < 6, focusedWindow === 3);
      } else {
        setCard(r3.current, { x: fullW / 2, y: fullH, w: prePos.w, h: prePos.h }, false, false);
      }
    };

    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [phase]);

  useEffect(() => {
    const timeouts = TIMINGS.map(({ phase: p, delay }) => setTimeout(() => setPhase(p), delay));
    const loop = setTimeout(() => setLoopKey((k) => k + 1), TOTAL_DURATION);
    return () => {
      timeouts.forEach(clearTimeout);
      clearTimeout(loop);
    };
  }, [loopKey]);

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
      <div ref={r1} className="card-base" style={{ opacity: 0 }}>
        1
      </div>
      <div ref={r2} className="card-base" style={{ opacity: 0 }}>
        2
      </div>
      <div ref={r3} className="card-base" style={{ opacity: 0 }}>
        3
      </div>
    </div>
  );
}

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
  el.className = cn("card-base", active ? "card-active" : "card-inactive");
}
