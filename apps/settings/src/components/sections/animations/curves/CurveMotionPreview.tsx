import { useEffect, useState } from "react";
import { useConfigBool, useConfigStr, useConfigInt, useConfigFloat } from "@/lib/config-store";
import { parseCurve } from "@/lib/curve";
import type { BezierValue } from "@/lib/curve";
import { toCss } from "@/lib/color-utils";
import { cn } from "@/lib/utils";
import {
  STAGE_W,
  STAGE_H,
  renderMotion,
  resolveMotionType,
  MOTION_DURATION_KEYS,
} from "@/lib/motion";
import type { MotionCfg } from "@/lib/motion";

const DEFAULT_CURVE: BezierValue = [0.25, 0.1, 0.25, 1];

const SPEED_OPTIONS: { speed: number; label: string }[] = [
  { speed: 0.25, label: "¼×" },
  { speed: 0.5, label: "½×" },
  { speed: 1, label: "1×" },
];

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

  const [speed, setSpeed] = useState(0.5);
  const [t, setT] = useState(0);

  const playbackDuration = Math.max(1, duration / speed);

  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      setT(((now - start) % playbackDuration) / playbackDuration);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playbackDuration, curveKey, curve]);

  const wins = animationsOn ? renderMotion(curveKey, t, cfg) : [];

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${STAGE_W} ${STAGE_H}`}
        className="mx-auto block w-full max-w-[420px] rounded-lg"
        style={{ backgroundColor: toCss(rootColor) }}
        role="img"
        aria-label="Animation motion preview"
      >
        {wins.map((w) => (
          <g key={w.id} opacity={w.opacity}>
            <rect
              x={w.rect.x + 1}
              y={w.rect.y + 1}
              width={w.rect.width - 2}
              height={w.rect.height - 2}
              rx={4}
              fill="none"
              stroke={toCss(w.focused ? focusColor : borderColor)}
              strokeWidth={2}
            />
            <rect
              x={w.rect.x + 3}
              y={w.rect.y + 3}
              width={w.rect.width - 6}
              height={w.rect.height - 6}
              rx={2}
              fill="rgba(0, 0, 0, 0.35)"
            />
            <text
              x={w.rect.x + 8}
              y={w.rect.y + w.rect.height - 8}
              fontSize={10}
              fontFamily="monospace"
              letterSpacing={1}
              fill="rgba(255, 255, 255, 0.4)"
            >
              {w.label}
            </text>
          </g>
        ))}
      </svg>

      <div className="mt-2 flex items-center justify-center gap-1">
        {SPEED_OPTIONS.map(({ speed: s, label }) => (
          <button
            key={s}
            type="button"
            onClick={() => setSpeed(s)}
            aria-pressed={speed === s}
            className={cn(
              "rounded-md px-2.5 py-1 font-mono text-[11px] transition-colors",
              speed === s
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground/60 hover:text-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
