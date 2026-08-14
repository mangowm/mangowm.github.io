import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useConfigBool, useConfigStr, useConfigInt, useConfigFloat } from "@/lib/config-store";
import { parseCurve } from "@/lib/curve";
import type { BezierValue } from "@/lib/curve";
import { findAnimationCurveAt } from "@/lib/animation";
import { toCss } from "@/lib/color-utils";
import { SectionCard } from "@/components/sections/section-ui";
import { cn } from "@/lib/utils";

const DEFAULT_CURVE: BezierValue = [0.25, 0.1, 0.25, 1];

const STAGE_W = 320;
const STAGE_H = 200;

const SLOT_A = { x: 12, y: 12, width: 165, height: 176 };
const SLOT_B = { x: 185, y: 12, width: 123, height: 176 };
const SLOT_A_BIG = { x: 12, y: 12, width: 195, height: 176 };
const SLOT_B_SMALL = { x: 215, y: 12, width: 93, height: 176 };

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Win {
  id: number;
  label: string;
  rect: Rect;
  opacity: number;
  focused: boolean;
}

type Effect = "zoom" | "slide" | "fade" | "none";

interface MotionCfg {
  openType: Effect;
  closeType: Effect;
  tagDir: 0 | 1;
  curves: Record<string, BezierValue>;
  durations: number[];
  zoomInitial: number;
  zoomEnd: number;
  fadeIn: number;
  fadeOut: number;
}

const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

const lerpRect = (a: Rect, b: Rect, p: number): Rect => ({
  x: lerp(a.x, b.x, p),
  y: lerp(a.y, b.y, p),
  width: lerp(a.width, b.width, p),
  height: lerp(a.height, b.height, p),
});

const shrinkRect = (r: Rect, s: number): Rect => ({
  x: r.x + (r.width * (1 - s)) / 2,
  y: r.y + (r.height * (1 - s)) / 2,
  width: r.width * s,
  height: r.height * s,
});

const mkWin = (id: number, label: string, rect: Rect, opacity: number, focused: boolean): Win => ({
  id,
  label,
  rect,
  opacity,
  focused,
});

/** Mango resolves open/close types: fade and zoom are explicit, everything else slides. */
function resolveType(type: string): Effect {
  if (type === "none") return "none";
  if (type === "zoom") return "zoom";
  if (type === "fade") return "fade";
  return "slide";
}

function entryRect(type: Effect, slot: Rect, cfg: MotionCfg): Rect {
  switch (type) {
    case "zoom": {
      const w = slot.width * cfg.zoomInitial;
      const h = slot.height * cfg.zoomInitial;
      return {
        x: slot.x + (slot.width - w) / 2,
        y: slot.y + (slot.height - h) / 2,
        width: w,
        height: h,
      };
    }
    case "slide":
      return { ...slot, y: slot.y + STAGE_H };
    default:
      return slot;
  }
}

function exitRect(type: Effect, slot: Rect, cfg: MotionCfg): Rect {
  switch (type) {
    case "zoom": {
      const w = slot.width * cfg.zoomEnd;
      const h = slot.height * cfg.zoomEnd;
      return {
        x: slot.x + (slot.width - w) / 2,
        y: slot.y + (slot.height - h) / 2,
        width: w,
        height: h,
      };
    }
    case "slide":
      return { ...slot, y: slot.y + STAGE_H };
    default:
      return slot;
  }
}

function renderOpenA(t: number, cfg: MotionCfg): Win[] {
  if (cfg.openType === "none") return [mkWin(1, "A", SLOT_A, 1, true)];
  const p = findAnimationCurveAt(t, cfg.curves.animation_curve_open);
  const o = findAnimationCurveAt(t, cfg.curves.animation_curve_opafadein);
  return [
    mkWin(
      1,
      "A",
      lerpRect(entryRect(cfg.openType, SLOT_A, cfg), SLOT_A, p),
      lerp(cfg.fadeIn, 1, o),
      true,
    ),
  ];
}

function renderOpenB(t: number, cfg: MotionCfg): Win[] {
  if (cfg.openType === "none")
    return [mkWin(1, "A", SLOT_A, 1, true), mkWin(2, "B", SLOT_B, 1, false)];
  const p = findAnimationCurveAt(t, cfg.curves.animation_curve_open);
  const o = findAnimationCurveAt(t, cfg.curves.animation_curve_opafadein);
  return [
    mkWin(1, "A", SLOT_A, 1, true),
    mkWin(
      2,
      "B",
      lerpRect(entryRect(cfg.openType, SLOT_B, cfg), SLOT_B, p),
      lerp(cfg.fadeIn, 1, o),
      false,
    ),
  ];
}

function renderMove(t: number, cfg: MotionCfg): Win[] {
  const p = findAnimationCurveAt(t, cfg.curves.animation_curve_move);
  return [
    mkWin(1, "A", lerpRect(SLOT_A, SLOT_A_BIG, p), 1, true),
    mkWin(2, "B", lerpRect(SLOT_B, SLOT_B_SMALL, p), 1, false),
  ];
}

function renderFocus(t: number, cfg: MotionCfg): Win[] {
  const p = findAnimationCurveAt(t, cfg.curves.animation_curve_focus);
  const bFocused = p >= 0.5;
  return [
    mkWin(1, "A", SLOT_A, 1, !bFocused),
    mkWin(2, "B", bFocused ? SLOT_B : shrinkRect(SLOT_B, 0.96), 1, bFocused),
  ];
}

function renderTag(t: number, cfg: MotionCfg): Win[] {
  const span = cfg.tagDir === 1 ? STAGE_W : STAGE_H;
  const eased = (tt: number) =>
    findAnimationCurveAt(Math.min(1, Math.max(0, tt)), cfg.curves.animation_curve_tag);
  const offset = t < 0.5 ? -eased(t * 2) * span : -(1 - eased((t - 0.5) * 2)) * span;
  const shift = (r: Rect): Rect =>
    cfg.tagDir === 1 ? { ...r, x: r.x + offset } : { ...r, y: r.y + offset };
  return [mkWin(1, "A", shift(SLOT_A), 1, true), mkWin(2, "B", shift(SLOT_B), 1, false)];
}

function renderOpacity(t: number, cfg: MotionCfg): Win[] {
  if (t < 0.5) {
    const p = findAnimationCurveAt(t * 2, cfg.curves.animation_curve_opafadeout);
    return [mkWin(1, "A", SLOT_A, lerp(1, cfg.fadeOut, p), true), mkWin(2, "B", SLOT_B, 1, false)];
  }
  const p = findAnimationCurveAt((t - 0.5) * 2, cfg.curves.animation_curve_opafadein);
  return [mkWin(1, "A", SLOT_A, lerp(cfg.fadeOut, 1, p), true), mkWin(2, "B", SLOT_B, 1, false)];
}

function renderClose(t: number, cfg: MotionCfg): Win[] {
  const wins: Win[] = [mkWin(1, "A", SLOT_A, 1, true)];
  if (t < 1) {
    const p = findAnimationCurveAt(t, cfg.curves.animation_curve_close);
    const o = findAnimationCurveAt(t, cfg.curves.animation_curve_opafadeout);
    const rect =
      cfg.closeType === "none" ? SLOT_B : lerpRect(SLOT_B, exitRect(cfg.closeType, SLOT_B, cfg), p);
    const opacity = cfg.closeType === "none" ? 1 : lerp(1, cfg.fadeOut, o);
    wins.push(mkWin(2, "B", rect, opacity, false));
  }
  return wins;
}

function renderPhase(idx: number, t: number, cfg: MotionCfg): Win[] {
  switch (idx) {
    case 0:
      return renderOpenA(t, cfg);
    case 1:
      return renderOpenB(t, cfg);
    case 2:
      return renderMove(t, cfg);
    case 3:
      return renderFocus(t, cfg);
    case 4:
      return renderTag(t, cfg);
    case 5:
      return renderOpacity(t, cfg);
    default:
      return renderClose(t, cfg);
  }
}

const PHASES: { label: string; curveKeys: string[]; durationKey: string }[] = [
  {
    label: "Open",
    curveKeys: ["animation_curve_open", "animation_curve_opafadein"],
    durationKey: "animation_duration_open",
  },
  {
    label: "Move / Resize",
    curveKeys: ["animation_curve_move"],
    durationKey: "animation_duration_move",
  },
  { label: "Focus", curveKeys: ["animation_curve_focus"], durationKey: "animation_duration_focus" },
  {
    label: "Tag Switch",
    curveKeys: ["animation_curve_tag"],
    durationKey: "animation_duration_tag",
  },
  {
    label: "Opacity Fade",
    curveKeys: ["animation_curve_opafadeout", "animation_curve_opafadein"],
    durationKey: "animation_duration_move",
  },
  {
    label: "Close",
    curveKeys: ["animation_curve_close", "animation_curve_opafadeout"],
    durationKey: "animation_duration_close",
  },
];

export function MotionPreview({
  override,
}: {
  /** Override a specific curve (e.g. the one being edited in the Curves panel). */
  override?: { key: string; curve: BezierValue };
}) {
  const animationsOn = useConfigBool("animations");
  const openType = resolveType(useConfigStr("animation_type_open"));
  const closeType = resolveType(useConfigStr("animation_type_close"));
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

  const rawCurveMove = useConfigStr("animation_curve_move");
  const rawCurveOpen = useConfigStr("animation_curve_open");
  const rawCurveTag = useConfigStr("animation_curve_tag");
  const rawCurveClose = useConfigStr("animation_curve_close");
  const rawCurveFocus = useConfigStr("animation_curve_focus");
  const rawCurveOpafadein = useConfigStr("animation_curve_opafadein");
  const rawCurveOpafadeout = useConfigStr("animation_curve_opafadeout");

  const parseStoredCurve = (raw: string): BezierValue => {
    const parsed = parseCurve(raw);
    return parsed && parsed.length === 4
      ? [parsed[0], parsed[1], parsed[2], parsed[3]]
      : DEFAULT_CURVE;
  };

  const curveMove = parseStoredCurve(rawCurveMove);
  const curveOpen = parseStoredCurve(rawCurveOpen);
  const curveTag = parseStoredCurve(rawCurveTag);
  const curveClose = parseStoredCurve(rawCurveClose);
  const curveFocus = parseStoredCurve(rawCurveFocus);
  const curveOpafadein = parseStoredCurve(rawCurveOpafadein);
  const curveOpafadeout = parseStoredCurve(rawCurveOpafadeout);

  const applyOverride = (key: string, base: BezierValue): BezierValue =>
    override && override.key === key ? override.curve : base;

  const cfg: MotionCfg = {
    openType,
    closeType,
    tagDir,
    curves: {
      animation_curve_move: applyOverride("animation_curve_move", curveMove),
      animation_curve_open: applyOverride("animation_curve_open", curveOpen),
      animation_curve_tag: applyOverride("animation_curve_tag", curveTag),
      animation_curve_close: applyOverride("animation_curve_close", curveClose),
      animation_curve_focus: applyOverride("animation_curve_focus", curveFocus),
      animation_curve_opafadein: applyOverride("animation_curve_opafadein", curveOpafadein),
      animation_curve_opafadeout: applyOverride("animation_curve_opafadeout", curveOpafadeout),
    },
    durations: [durOpen, durOpen, durMove, durFocus, durTag, durMove, durClose],
    zoomInitial,
    zoomEnd,
    fadeIn,
    fadeOut,
  };

  const signature =
    PHASES.map((ph, i) => {
      const curveSig = ph.curveKeys.map((k) => cfg.curves[k].join(",")).join("|");
      return `${ph.label}:${cfg.durations[i]}:${curveSig}`;
    }).join(";") + `:${openType}${closeType}${tagDir}${zoomInitial}${zoomEnd}${fadeIn}${fadeOut}`;

  const [phaseIdx, setPhaseIdx] = useState(0);
  const [t, setT] = useState(0);
  const [replayKey, setReplayKey] = useState(0);
  const cursorRef = useRef({ phaseIdx: 0, start: 0 });

  useEffect(() => {
    cursorRef.current = { phaseIdx: 0, start: performance.now() };
    setPhaseIdx(0);
    setT(0);
    let raf = 0;
    const tick = (now: number) => {
      const cursor = cursorRef.current;
      const duration = Math.max(1, cfg.durations[cursor.phaseIdx]);
      const next = Math.min(1, (now - cursor.start) / duration);
      setT(next);
      setPhaseIdx(cursor.phaseIdx);
      if (next >= 1) {
        cursor.phaseIdx = (cursor.phaseIdx + 1) % PHASES.length;
        cursor.start = now;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [signature, replayKey]);

  const handleReplay = () => {
    setReplayKey((k) => k + 1);
  };

  const wins = animationsOn ? renderPhase(phaseIdx, t, cfg) : [];
  const activePhase = PHASES[phaseIdx];
  const previewingOverride = override && activePhase.curveKeys.includes(override.key);

  return (
    <SectionCard title="Motion Preview">
      <div className="px-4 py-3">
        <div
          className="relative h-50 overflow-hidden rounded-lg"
          style={{ width: STAGE_W, backgroundColor: toCss(rootColor) }}
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

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {PHASES.map((ph, i) => {
            const isActive = i === phaseIdx;
            const usesOverride = override && ph.curveKeys.includes(override.key);
            return (
              <span
                key={ph.label}
                className={cn(
                  "rounded-md px-2 py-0.5 font-mono text-[10px] transition-colors",
                  isActive ? "bg-primary/15 text-primary" : "bg-muted/40 text-muted-foreground/60",
                )}
              >
                {ph.label}
                {usesOverride && isActive && (
                  <span className="ml-1 text-primary/70">· selected curve</span>
                )}
              </span>
            );
          })}
        </div>

        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="text-[11px] text-muted-foreground">
            {animationsOn
              ? `${activePhase.label} · ${cfg.durations[phaseIdx]} ms${
                  previewingOverride ? " · previewing selected curve" : ""
                }`
              : "Animations are disabled."}
          </span>
          <Button size="sm" variant="secondary" onClick={handleReplay} className="gap-1.5">
            <Play className="size-3.5" />
            Replay
          </Button>
        </div>
      </div>
    </SectionCard>
  );
}
