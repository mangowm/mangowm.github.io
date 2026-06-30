import { useEffect, useRef, useState } from "react";
import { cn } from "../../cn";
import { CARD_TRANSITION, TIMINGS, TOTAL_DURATION } from "./constants";

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface DeckLayoutProps {
  orientation?: "horizontal" | "vertical";
}

export function DeckLayout({ orientation = "horizontal" }: DeckLayoutProps) {
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
      const GAP = 16;
      const isVert = orientation === "vertical";

      const masterRect: Rect = isVert
        ? { x: 0, y: 0, w: width, h: (height - GAP) / 2 }
        : { x: 0, y: 0, w: (width - GAP) / 2, h: height };

      const stackRect: Rect = isVert
        ? { x: 0, y: (height - GAP) / 2 + GAP, w: width, h: (height - GAP) / 2 }
        : { x: (width - GAP) / 2 + GAP, y: 0, w: (width - GAP) / 2, h: height };

      const exitRect: Rect = isVert
        ? { x: 0, y: height, w: width, h: (height - GAP) / 2 }
        : { x: width, y: 0, w: (width - GAP) / 2, h: height };

      const activeWindows = phase <= 1 ? 1 : phase === 2 ? 2 : phase <= 5 ? 3 : phase === 6 ? 2 : 1;
      const isSwap = phase === 4;
      const focusedWindow = phase <= 1 ? 1 : phase === 2 ? 2 : phase <= 5 ? 3 : phase === 6 ? 2 : 1;

      const getZ = (id: number) => {
        let z = id;
        if (id === 1 && isSwap) z = 10;
        if (focusedWindow === id) z += 20;
        return z;
      };

      if (phase < 8) {
        const fullScreen: Rect = { x: 0, y: 0, w: width, h: height };
        const base = activeWindows === 1 ? fullScreen : masterRect;
        const target = isSwap ? stackRect : base;
        setCard(r1.current, target, phase >= 1, focusedWindow === 1, getZ(1));
      } else {
        setCard(r1.current, { x: 0, y: 0, w: width, h: height }, false, false, 1);
      }

      if (phase < 7) {
        setCard(r2.current, stackRect, phase >= 2, focusedWindow === 2, getZ(2));
      } else {
        setCard(r2.current, exitRect, false, false, 2);
      }

      if (phase < 6) {
        const target = isSwap ? masterRect : stackRect;
        setCard(r3.current, target, phase >= 3, focusedWindow === 3, getZ(3));
      } else {
        setCard(r3.current, exitRect, false, false, 3);
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
  zIndex: number,
) {
  if (!el) return;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  el.style.width = `${w}px`;
  el.style.height = `${h}px`;
  el.style.zIndex = String(zIndex);
  el.style.opacity = visible ? "1" : "0";
  el.style.transform = visible ? "scale(1)" : "scale(0.9)";
  el.className = cn("card-base", active ? "card-active" : "card-inactive");
}
