import { useEffect, useRef, useState } from "react";
import { cn } from "../../cn";
import { TIMINGS, TOTAL_DURATION } from "./constants";

interface WindowOptions {
  primaryOffset: number;
  primarySize: number;
  secondaryOffset?: number;
  secondarySize?: number;
  visible?: boolean;
  active?: boolean;
}

interface ScrollerLayoutProps {
  orientation: "horizontal" | "vertical";
}

const HALF = 50;

export function ScrollerLayout({ orientation }: ScrollerLayoutProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState(0);
  const [loopKey, setLoopKey] = useState(0);

  useEffect(() => {
    for (const ref of [leftRef, centerRef, rightRef]) {
      if (ref.current) ref.current.style.transition = "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)";
    }
    if (trackRef.current) {
      trackRef.current.style.transition = "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)";
      trackRef.current.style.willChange = "width, height, transform";
    }
  }, []);

  useEffect(() => {
    const update = () => {
      const container = containerRef.current;
      const track = trackRef.current;
      if (!container || !track) return;

      const { clientWidth: width, clientHeight: height } = container;
      const isVert = orientation === "vertical";
      const dim = isVert ? height : width;
      const GAP = Math.min(20, dim * 0.05);

      const isExpandedTrack = phase === 3;
      const trackMult = isExpandedTrack ? 1.5 : 1.0;

      track.style.width = "";
      track.style.height = "";
      track.style.transform = "";
      track.style.position = "absolute";
      track.style.top = "0";
      track.style.left = "0";

      if (isVert) {
        track.style.width = "100%";
        track.style.height = `${height * trackMult}px`;
      } else {
        track.style.width = `${width * trackMult}px`;
        track.style.height = "100%";
      }

      const scrollPct = phase === 3 ? HALF : 0;
      const scrollPx = (dim * scrollPct) / 100;
      track.style.transform = isVert ? `translateY(-${scrollPx}px)` : `translateX(-${scrollPx}px)`;

      const setWindow = (el: HTMLDivElement | null, opts: WindowOptions) => {
        if (!el) return;
        const {
          primaryOffset,
          primarySize,
          secondaryOffset = 0,
          secondarySize = 100,
          visible = true,
          active = false,
        } = opts;

        const isFirst = primaryOffset === scrollPct;
        const isLast = primaryOffset + primarySize === scrollPct + 100;
        const rawPos = (dim * primaryOffset) / 100;
        const rawSize = (dim * primarySize) / 100;
        const pos = isFirst ? rawPos : rawPos + GAP / 2;
        let size = rawSize;
        if (!isFirst) size -= GAP / 2;
        if (!isLast) size -= GAP / 2;
        size = Math.max(size, 0);

        const secDim = isVert ? width : height;
        let secPos: number, secSize: number;
        if (secondarySize < 100) {
          const half = (secDim - GAP) / 2;
          secPos = secondaryOffset === 0 ? 0 : half + GAP;
          secSize = half;
        } else {
          secPos = 0;
          secSize = secDim;
        }

        el.style.position = "absolute";
        el.style.opacity = visible ? "1" : "0";
        el.style.transform = visible ? "scale(1)" : "scale(0.9)";
        el.className = cn("card-base", active ? "card-active" : "card-inactive");

        if (isVert) {
          el.style.left = `${secPos}px`;
          el.style.width = `${secSize}px`;
          el.style.top = `${pos}px`;
          el.style.height = `${size}px`;
        } else {
          el.style.top = `${secPos}px`;
          el.style.height = `${secSize}px`;
          el.style.left = `${pos}px`;
          el.style.width = `${size}px`;
        }
      };

      if (phase === 0) {
        setWindow(leftRef.current, { primaryOffset: 0, primarySize: HALF, visible: false });
        setWindow(centerRef.current, { primaryOffset: 100, primarySize: HALF, visible: false });
        setWindow(rightRef.current, { primaryOffset: 200, primarySize: HALF, visible: false });
      } else if (phase === 1) {
        setWindow(leftRef.current, {
          primaryOffset: 25,
          primarySize: HALF,
          visible: true,
          active: true,
        });
        setWindow(centerRef.current, { primaryOffset: 100, primarySize: HALF, visible: false });
        setWindow(rightRef.current, { primaryOffset: 200, primarySize: HALF, visible: false });
      } else if (phase === 2) {
        setWindow(leftRef.current, { primaryOffset: 0, primarySize: HALF, visible: true });
        setWindow(centerRef.current, {
          primaryOffset: HALF,
          primarySize: HALF,
          visible: true,
          active: true,
        });
        setWindow(rightRef.current, { primaryOffset: 200, primarySize: HALF, visible: false });
      } else if (phase === 3) {
        setWindow(leftRef.current, { primaryOffset: 0, primarySize: HALF, visible: true });
        setWindow(centerRef.current, { primaryOffset: HALF, primarySize: HALF, visible: true });
        setWindow(rightRef.current, {
          primaryOffset: 100,
          primarySize: HALF,
          visible: true,
          active: true,
        });
      } else if (phase === 4) {
        setWindow(leftRef.current, { primaryOffset: 0, primarySize: HALF, visible: true });
        setWindow(centerRef.current, {
          primaryOffset: HALF,
          primarySize: HALF,
          secondaryOffset: 0,
          secondarySize: HALF,
          visible: true,
        });
        setWindow(rightRef.current, {
          primaryOffset: HALF,
          primarySize: HALF,
          secondaryOffset: HALF,
          secondarySize: HALF,
          visible: true,
          active: true,
        });
      } else if (phase === 5) {
        setWindow(leftRef.current, { primaryOffset: 0, primarySize: HALF, visible: true });
        setWindow(rightRef.current, {
          primaryOffset: HALF,
          primarySize: HALF,
          visible: true,
          active: true,
        });
        setWindow(centerRef.current, { primaryOffset: 100, primarySize: HALF, visible: false });
      } else if (phase === 6) {
        setWindow(rightRef.current, { primaryOffset: HALF, primarySize: HALF, visible: false });
        setWindow(leftRef.current, { primaryOffset: 0, primarySize: HALF, visible: true });
        setWindow(centerRef.current, {
          primaryOffset: HALF,
          primarySize: HALF,
          visible: true,
          active: true,
        });
      } else if (phase === 7) {
        setWindow(leftRef.current, {
          primaryOffset: 25,
          primarySize: HALF,
          visible: true,
          active: true,
        });
        setWindow(centerRef.current, { primaryOffset: HALF, primarySize: HALF, visible: false });
        setWindow(rightRef.current, { primaryOffset: HALF, primarySize: HALF, visible: false });
      } else if (phase === 8) {
        setWindow(leftRef.current, { primaryOffset: 25, primarySize: HALF, visible: false });
        setWindow(centerRef.current, { primaryOffset: HALF, primarySize: HALF, visible: false });
        setWindow(rightRef.current, { primaryOffset: HALF, primarySize: HALF, visible: false });
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
      style={{ position: "relative", height: "100%", width: "100%", overflow: "hidden" }}
    >
      <div
        ref={trackRef}
        style={{ position: "absolute", top: 0, left: 0, height: "100%", width: "100%" }}
      >
        <div ref={leftRef} className="card-base" style={{ opacity: 0 }}>
          1
        </div>
        <div ref={centerRef} className="card-base" style={{ opacity: 0 }}>
          2
        </div>
        <div ref={rightRef} className="card-base" style={{ opacity: 0 }}>
          3
        </div>
      </div>
    </div>
  );
}
