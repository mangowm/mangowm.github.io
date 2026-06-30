import { useEffect, useRef, useState } from "react";
import { cn } from "../../cn";
import { CARD_TRANSITION } from "./constants";

type Phase = 0 | 1 | 2 | 7 | 8;

const TIMINGS: { phase: Phase; delay: number }[] = [
  { phase: 0, delay: 0 },
  { phase: 1, delay: 500 },
  { phase: 2, delay: 1500 },
  { phase: 7, delay: 2500 },
  { phase: 8, delay: 3500 },
];

const TOTAL_DURATION = 6500;

export function MonocleLayout() {
  const containerRef = useRef<HTMLDivElement>(null);
  const r1 = useRef<HTMLDivElement>(null);
  const r2 = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>(0);
  const [loopKey, setLoopKey] = useState(0);

  useEffect(() => {
    for (const ref of [r1, r2]) {
      if (ref.current) ref.current.style.transition = CARD_TRANSITION;
    }
  }, []);

  useEffect(() => {
    const update = () => {
      const container = containerRef.current;
      if (!container) return;
      const { clientWidth: w, clientHeight: h } = container;

      for (const ref of [r1, r2]) {
        const el = ref.current;
        if (!el) continue;
        el.style.left = "0px";
        el.style.top = "0px";
        el.style.width = `${w}px`;
        el.style.height = `${h}px`;
      }

      const r1Visible = phase >= 1 && phase < 8;
      const r1Active = phase === 1 || phase === 7;
      applyVisibility(r1.current, r1Visible, r1Active);
      const r2Visible = phase >= 2 && phase < 7;
      applyVisibility(r2.current, r2Visible, r2Visible);
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
    </div>
  );
}

function applyVisibility(el: HTMLDivElement | null, visible: boolean, active: boolean) {
  if (!el) return;
  el.style.opacity = visible ? "1" : "0";
  el.style.transform = visible ? "scale(1)" : "scale(0.9)";
  el.className = cn("card-base", active ? "card-active" : "card-inactive");
}
