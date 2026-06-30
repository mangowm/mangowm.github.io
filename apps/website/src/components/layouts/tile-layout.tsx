import { useEffect, useRef, useState } from "react";
import { cn } from "../../cn";
import { CARD_TRANSITION, TIMINGS, TOTAL_DURATION } from "./constants";

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface TileLayoutProps {
  orientation: "horizontal" | "vertical";
}

export function TileLayout({ orientation }: TileLayoutProps) {
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
      const halfW = (width - GAP) / 2;
      const halfH = (height - GAP) / 2;
      const rightX = halfW + GAP;
      const bottomY = halfH + GAP;
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

      let pos0: Rect, pos1: Rect, pos2: Rect;
      if (isVert) {
        if (activeWindows === 1) {
          pos0 = { x: 0, y: 0, w: width, h: height };
          pos1 = { x: 0, y: bottomY, w: width, h: halfH };
          pos2 = { x: rightX, y: bottomY, w: halfW, h: halfH };
        } else if (activeWindows === 2) {
          pos0 = { x: 0, y: 0, w: width, h: halfH };
          pos1 = { x: 0, y: bottomY, w: width, h: halfH };
          pos2 = { x: rightX, y: bottomY, w: halfW, h: halfH };
        } else {
          pos0 = { x: 0, y: 0, w: width, h: halfH };
          pos1 = { x: 0, y: bottomY, w: halfW, h: halfH };
          pos2 = { x: rightX, y: bottomY, w: halfW, h: halfH };
        }
      } else {
        if (activeWindows === 1) {
          pos0 = { x: 0, y: 0, w: width, h: height };
          pos1 = { x: rightX, y: 0, w: halfW, h: height };
          pos2 = { x: rightX, y: bottomY, w: halfW, h: halfH };
        } else if (activeWindows === 2) {
          pos0 = { x: 0, y: 0, w: halfW, h: height };
          pos1 = { x: rightX, y: 0, w: halfW, h: height };
          pos2 = { x: rightX, y: bottomY, w: halfW, h: halfH };
        } else {
          pos0 = { x: 0, y: 0, w: halfW, h: height };
          pos1 = { x: rightX, y: 0, w: halfW, h: halfH };
          pos2 = { x: rightX, y: bottomY, w: halfW, h: halfH };
        }
      }

      setCard(
        r1.current,
        isSwap && activeWindows === 3 ? pos2 : pos0,
        phase > 0 && phase < 8,
        focusedWindow === 1,
      );
      setCard(r2.current, pos1, phase >= 2 && phase < 7, focusedWindow === 2);
      setCard(
        r3.current,
        isSwap && activeWindows === 3 ? pos0 : pos2,
        phase >= 3 && phase < 6,
        focusedWindow === 3,
      );
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
