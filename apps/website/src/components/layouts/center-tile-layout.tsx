import { useEffect, useRef, useState } from "react";
import { CARD_TRANSITION, TIMINGS, TOTAL_DURATION, setCard } from "./constants";

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function CenterTileLayout() {
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
      const availW = width - 2 * GAP;
      const unit = availW / 4;
      const sideW = unit;
      const centreW = unit * 2;
      const xCentre = sideW + GAP;
      const xRight = sideW + centreW + 2 * GAP;

      const getLayout = (n: number): [Rect, Rect, Rect] => {
        const centre: Rect = { x: xCentre, y: 0, w: centreW, h: height };
        const rightSlot: Rect = { x: xRight, y: 0, w: sideW, h: height };
        const leftSlot: Rect = { x: 0, y: 0, w: sideW, h: height };
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
      const offRight: Rect = { x: width, y: 0, w: sideW, h: height };

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
      if (activeWindows >= 2) {
        setCard(r2.current, w2Pos, phase >= 2 && phase < 7, focusedWindow === 2);
      } else {
        setCard(r2.current, offRight, false, false);
      }
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
