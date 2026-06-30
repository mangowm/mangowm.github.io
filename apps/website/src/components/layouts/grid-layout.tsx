import { useEffect, useRef, useState } from "react";
import { cn } from "../../cn";
import { CARD_TRANSITION, TIMINGS, TOTAL_DURATION } from "./constants";

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface GridLayoutProps {
  orientation: "horizontal" | "vertical";
}

const GAP = 16;
const SINGLE_PAD_H = 0.1;
const SINGLE_PAD_V = 0.15;

export function GridLayout({ orientation }: GridLayoutProps) {
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
      const { clientWidth: width, clientHeight: height } = container;

      const buildGrid = (n: number): Rect[] => {
        if (n === 0) return [];
        if (n === 1) {
          const w = width * (1 - SINGLE_PAD_H * 2);
          const h = height * (1 - SINGLE_PAD_V * 2);
          return [{ x: (width - w) / 2, y: (height - h) / 2, w, h }];
        }
        if (n === 2) {
          if (orientation === "horizontal") {
            const rowH = height * (1 - SINGLE_PAD_V * 2);
            const startY = (height - rowH) / 2;
            const w = (width - GAP) / 2;
            return [
              { x: 0, y: startY, w, h: rowH },
              { x: w + GAP, y: startY, w, h: rowH },
            ];
          } else {
            const colW = width * (1 - SINGLE_PAD_H * 2);
            const startX = (width - colW) / 2;
            const h = (height - GAP) / 2;
            return [
              { x: startX, y: 0, w: colW, h },
              { x: startX, y: h + GAP, w: colW, h },
            ];
          }
        }
        const cols =
          orientation === "horizontal"
            ? Math.ceil(Math.sqrt(n))
            : Math.ceil(n / Math.ceil(Math.sqrt(n)));
        const rows = Math.ceil(n / cols);
        const cellW = (width - (cols - 1) * GAP) / cols;
        const cellH = (height - (rows - 1) * GAP) / rows;

        if (orientation === "horizontal") {
          const gridH = rows * cellH + (rows - 1) * GAP;
          const startY = (height - gridH) / 2;
          return Array.from({ length: n }, (_, i) => {
            const row = Math.floor(i / cols);
            const col = i % cols;
            const itemsInRow = row === rows - 1 ? n - row * cols : cols;
            const rowW = itemsInRow * cellW + (itemsInRow - 1) * GAP;
            const rowStartX = (width - rowW) / 2;
            return {
              x: rowStartX + col * (cellW + GAP),
              y: startY + row * (cellH + GAP),
              w: cellW,
              h: cellH,
            };
          });
        } else {
          const gridW = cols * cellW + (cols - 1) * GAP;
          const startX = (width - gridW) / 2;
          return Array.from({ length: n }, (_, i) => {
            const col = Math.floor(i / rows);
            const row = i % rows;
            const itemsInCol = col === cols - 1 ? n - col * rows : rows;
            const colH = itemsInCol * cellH + (itemsInCol - 1) * GAP;
            const colStartY = (height - colH) / 2;
            return {
              x: startX + col * (cellW + GAP),
              y: colStartY + row * (cellH + GAP),
              w: cellW,
              h: cellH,
            };
          });
        }
      };

      const activeWindows =
        phase >= 3 && phase <= 5
          ? 3
          : phase === 6 || phase === 2
            ? 2
            : phase >= 7 || phase === 1
              ? 1
              : 0;
      const isSwap = phase === 4;
      const focusedWindow = phase <= 1 ? 1 : phase === 2 ? 2 : phase <= 5 ? 3 : phase === 6 ? 2 : 1;
      const pos = buildGrid(activeWindows);
      const [prePos] = buildGrid(1);

      if (activeWindows >= 1) {
        setCard(r1.current, isSwap ? pos[2] : pos[0], phase > 0 && phase < 8, focusedWindow === 1);
      } else {
        setCard(r1.current, { x: 0, y: 0, w: width, h: height }, false, false);
      }
      if (activeWindows >= 2) {
        setCard(r2.current, pos[1], phase >= 2 && phase < 7, focusedWindow === 2);
      } else {
        setCard(r2.current, { x: width, y: height, w: prePos.w / 2, h: prePos.h }, false, false);
      }
      if (activeWindows >= 3) {
        setCard(r3.current, isSwap ? pos[0] : pos[2], phase >= 3 && phase < 6, focusedWindow === 3);
      } else {
        setCard(r3.current, { x: width, y: height, w: width / 2, h: height / 2 }, false, false);
      }
    };

    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [phase, orientation]);

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
