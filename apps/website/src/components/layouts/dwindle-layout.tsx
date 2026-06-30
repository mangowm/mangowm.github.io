import { useEffect, useRef, useState } from "react";
import { cn } from "../../cn";
import { CARD_TRANSITION, TIMINGS, TOTAL_DURATION } from "./constants";

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function DwindleLayout() {
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
        t1 = setTimeout(() => setActiveWindows(5), 750);
        break;
      case 4:
        setIsSwap(true);
        break;
      case 5:
        setIsSwap(false);
        break;
      case 6:
        setActiveWindows(4);
        t1 = setTimeout(() => setActiveWindows(3), 500);
        break;
      case 7:
        setActiveWindows(2);
        t1 = setTimeout(() => setActiveWindows(1), 500);
        break;
      case 8:
        setActiveWindows(0);
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
      const GAP = 16;

      const L1 = getDwindleRects(1, width, height, GAP);
      const L2 = getDwindleRects(2, width, height, GAP);
      const L3 = getDwindleRects(3, width, height, GAP);
      const L4 = getDwindleRects(4, width, height, GAP);
      const L5 = getDwindleRects(5, width, height, GAP);
      const layouts = [[], L1, L2, L3, L4, L5];

      const getTarget = (index: number, active: number) => {
        const targetLayoutSize = Math.max(active, index + 1);
        if (targetLayoutSize === 0) return L1[0];
        return layouts[targetLayoutSize][index];
      };

      let pos0 = getTarget(0, activeWindows);
      let pos1 = getTarget(1, activeWindows);
      let pos2 = getTarget(2, activeWindows);
      let pos3 = getTarget(3, activeWindows);
      let pos4 = getTarget(4, activeWindows);

      if (isSwap && activeWindows === 5) {
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
  }, [activeWindows, isSwap]);

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
      <div ref={r4} className="card-base" style={{ opacity: 0 }}>
        4
      </div>
      <div ref={r5} className="card-base" style={{ opacity: 0 }}>
        5
      </div>
    </div>
  );
}

function getDwindleRects(count: number, width: number, height: number, gap: number): Rect[] {
  const rects: Rect[] = [];
  if (count === 0) return rects;
  rects.push({ x: 0, y: 0, w: width, h: height });
  if (count > 1) {
    for (let i = 1; i < count; i++) {
      const parent = rects[i - 1];
      const splitH = parent.w >= parent.h;
      if (splitH) {
        const w1 = (parent.w - gap) / 2;
        const w2 = parent.w - gap - w1;
        rects[i - 1] = { ...parent, w: w1 };
        rects.push({ x: parent.x + w1 + gap, y: parent.y, w: w2, h: parent.h });
      } else {
        const h1 = (parent.h - gap) / 2;
        const h2 = parent.h - gap - h1;
        rects[i - 1] = { ...parent, h: h1 };
        rects.push({ x: parent.x, y: parent.y + h1 + gap, w: parent.w, h: h2 });
      }
    }
  }
  return rects;
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
