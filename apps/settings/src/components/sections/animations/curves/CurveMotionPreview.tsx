import { useEffect, useState } from "react";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useConfigBool, useConfigStr, useConfigInt, useConfigFloat } from "@/lib/config-store";
import { parseCurve } from "@/lib/curve";
import type { BezierValue } from "@/lib/curve";
import { toCss } from "@/lib/color-utils";
import {
  STAGE_W,
  STAGE_H,
  renderMotion,
  resolveMotionType,
  MOTION_LABELS,
  MOTION_DURATION_KEYS,
} from "@/lib/motion";
import type { MotionCfg } from "@/lib/motion";

const DEFAULT_CURVE: BezierValue = [0.25, 0.1, 0.25, 1];

const parseStoredCurve = (raw: string): BezierValue => {
  const parsed = parseCurve(raw);
  return parsed && parsed.length === 4
    ? [parsed[0], parsed[1], parsed[2], parsed[3]]
    : DEFAULT_CURVE;
};

/**
 * Plays the motion that the given curve drives (e.g. the open motion for
 * `animation_curve_open`), looping with the curve's duration. Meant to sit
 * inline next to the curve editor.
 */
export function CurveMotionPreview({ curveKey, curve }: { curveKey: string; curve: BezierValue }) {
  const animationsOn = useConfigBool("animations");
  const openType = resolveMotionType(useConfigStr("animation_type_open"));
  const closeType = resolveMotionType(useConfigStr("animation_type_close"));
  const tagDir = useConfigInt("tag_animation_direction", undefined, 0, 1) === 1 ? 1 : 0;
  const zoomInitial = useConfigFloat("zoom_initial_ratio", undefined, 0.1, 1.0);
  const zoomEnd = useConfigFloat("zoom_end_ratio", undefined, 0.1, 1.0);
  const fadeIn = useConfigFloat("fadein_begin_opacity", undefined, 0.0, 1.0);
  const fadeOut = useConfigFloat("fadeout_begin_opacity", undefined, 0.0, 1.0);
  const rootColor = useConfigStr("rootcolor");
  const focusColor = useConfigStr("focuscolor");
  const borderColor = useConfigStr("bordercolor");

  const durMove = useConfigInt("animation_duration_move", undefined, 1, 50000);
  const durOpen = useConfigInt("animation_duration_open", undefined, 1, 50000);
  const durTag = useConfigInt("animation_duration_tag", undefined, 1, 50000);
  const durClose = useConfigInt("animation_duration_close", undefined, 1, 50000);
  const durFocus = useConfigInt("animation_duration_focus", undefined, 1, 50000);

  const rawMove = useConfigStr("animation_curve_move");
  const rawOpen = useConfigStr("animation_curve_open");
  const rawTag = useConfigStr("animation_curve_tag");
  const rawClose = useConfigStr("animation_curve_close");
  const rawFocus = useConfigStr("animation_curve_focus");
  const rawFadeIn = useConfigStr("animation_curve_opafadein");
  const rawFadeOut = useConfigStr("animation_curve_opafadeout");

  const curves: Record<string, BezierValue> = {
    animation_curve_move: parseStoredCurve(rawMove),
    animation_curve_open: parseStoredCurve(rawOpen),
    animation_curve_tag: parseStoredCurve(rawTag),
    animation_curve_close: parseStoredCurve(rawClose),
    animation_curve_focus: parseStoredCurve(rawFocus),
    animation_curve_opafadein: parseStoredCurve(rawFadeIn),
    animation_curve_opafadeout: parseStoredCurve(rawFadeOut),
  };
  curves[curveKey] = curve;

  const durations: Record<string, number> = {
    animation_duration_move: durMove,
    animation_duration_open: durOpen,
    animation_duration_tag: durTag,
    animation_duration_close: durClose,
    animation_duration_focus: durFocus,
  };

  const cfg: MotionCfg = {
    openType,
    closeType,
    tagDir,
    curves,
    zoomInitial,
    zoomEnd,
    fadeIn,
    fadeOut,
  };

  const duration = Math.max(1, durations[MOTION_DURATION_KEYS[curveKey]] ?? 400);

  const [t, setT] = useState(0);
  const [replayKey, setReplayKey] = useState(0);

  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      setT(((now - start) % duration) / duration);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [duration, curveKey, replayKey, curve]);

  const wins = animationsOn ? renderMotion(curveKey, t, cfg) : [];
  const label = MOTION_LABELS[curveKey] ?? curveKey;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Motion — {label}
        </span>
        <span className="font-mono text-[10px] text-muted-foreground/70">
          {animationsOn ? `${duration} ms` : "animations off"}
        </span>
      </div>

      <div
        className="relative overflow-hidden rounded-lg"
        style={{ width: STAGE_W, height: STAGE_H, backgroundColor: toCss(rootColor) }}
      >
        {wins.map((w) => (
          <div
            key={w.id}
            className="absolute"
            style={{
              left: w.rect.x,
              top: w.rect.y,
              width: w.rect.width,
              height: w.rect.height,
              opacity: w.opacity,
            }}
          >
            <div
              className="relative h-full w-full rounded-sm border-2"
              style={{ borderColor: toCss(w.focused ? focusColor : borderColor) }}
            >
              <div className="absolute inset-[2px] bg-black/35" />
              <span className="absolute bottom-1 left-1.5 font-mono text-[10px] uppercase tracking-widest text-white/40">
                {w.label}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-2 flex justify-end">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setReplayKey((k) => k + 1)}
          className="gap-1.5"
        >
          <Play className="size-3.5" />
          Replay
        </Button>
      </div>
    </div>
  );
}
