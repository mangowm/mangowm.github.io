import { useEffect, useState } from "react";
import { useReducedMotion } from "@mangowm/ui/hooks/use-reduced-motion";
import { DEFAULT_TIMELINE, timelineAt, type TimelineState } from "./timeline";
import type { Timeline } from "./types";

export interface TimelineStep extends TimelineState {
  previous: TimelineState;
}

/**
 * Drives the shared animation timeline with a single `requestAnimationFrame`
 * loop. State only updates when the phase (or a sub-step milestone) changes, and
 * carries the previous step so callers can classify each change.
 */
export function useTimeline(timeline: Timeline = DEFAULT_TIMELINE): TimelineStep {
  const reducedMotion = useReducedMotion();
  const [state, setState] = useState<TimelineStep>(() => {
    const initial = timelineAt(0, timeline);
    return { ...initial, previous: initial };
  });

  useEffect(() => {
    if (reducedMotion) {
      const at = timelineAt(timeline.total / 2, timeline);
      setState({ ...at, previous: at });
      return;
    }

    let frame = 0;
    let last = timelineAt(0, timeline);
    const start = performance.now();

    const tick = (now: number) => {
      const next = timelineAt(now - start, timeline);
      if (next.phase !== last.phase || next.phaseElapsed !== last.phaseElapsed) {
        setState({ ...next, previous: last });
        last = next;
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [timeline, reducedMotion]);

  return state;
}
