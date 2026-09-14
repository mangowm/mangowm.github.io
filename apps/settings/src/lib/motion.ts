import type { BezierValue } from "./curve";
import { findAnimationCurveAt } from "./animation";

export const STAGE_W = 320;
export const STAGE_H = 200;

const SLOT_A = { x: 12, y: 12, width: 165, height: 176 };
const SLOT_B = { x: 185, y: 12, width: 123, height: 176 };
const SLOT_A_BIG = { x: 12, y: 12, width: 195, height: 176 };
const SLOT_B_SMALL = { x: 215, y: 12, width: 93, height: 176 };

export interface MotionRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface MotionWin {
  id: number;
  label: string;
  rect: MotionRect;
  opacity: number;
  focused: boolean;
}

export type MotionEffect = "zoom" | "slide" | "fade" | "none";

export interface MotionCfg {
  openType: MotionEffect;
  closeType: MotionEffect;
  tagDir: 0 | 1;
  curves: Record<string, BezierValue>;
  zoomInitial: number;
  zoomEnd: number;
  fadeIn: number;
  fadeOut: number;
}

const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

const lerpRect = (a: MotionRect, b: MotionRect, p: number): MotionRect => ({
  x: lerp(a.x, b.x, p),
  y: lerp(a.y, b.y, p),
  width: lerp(a.width, b.width, p),
  height: lerp(a.height, b.height, p),
});

const shrinkRect = (r: MotionRect, s: number): MotionRect => ({
  x: r.x + (r.width * (1 - s)) / 2,
  y: r.y + (r.height * (1 - s)) / 2,
  width: r.width * s,
  height: r.height * s,
});

const mkWin = (
  id: number,
  label: string,
  rect: MotionRect,
  opacity: number,
  focused: boolean,
): MotionWin => ({ id, label, rect, opacity, focused });

/** Mango resolves open/close types: fade and zoom are explicit, everything else slides. */
export function resolveMotionType(type: string): MotionEffect {
  if (type === "none") return "none";
  if (type === "zoom") return "zoom";
  if (type === "fade") return "fade";
  return "slide";
}

function entryRect(type: MotionEffect, slot: MotionRect, cfg: MotionCfg): MotionRect {
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

function exitRect(type: MotionEffect, slot: MotionRect, cfg: MotionCfg): MotionRect {
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

function renderOpen(t: number, cfg: MotionCfg): MotionWin[] {
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

function renderMove(t: number, cfg: MotionCfg): MotionWin[] {
  const p = findAnimationCurveAt(t, cfg.curves.animation_curve_move);
  return [
    mkWin(1, "A", lerpRect(SLOT_A, SLOT_A_BIG, p), 1, true),
    mkWin(2, "B", lerpRect(SLOT_B, SLOT_B_SMALL, p), 1, false),
  ];
}

function renderFocus(t: number, cfg: MotionCfg): MotionWin[] {
  const p = findAnimationCurveAt(t, cfg.curves.animation_curve_focus);
  const bFocused = p >= 0.5;
  return [
    mkWin(1, "A", SLOT_A, 1, !bFocused),
    mkWin(2, "B", bFocused ? SLOT_B : shrinkRect(SLOT_B, 0.96), 1, bFocused),
  ];
}

function renderTag(t: number, cfg: MotionCfg): MotionWin[] {
  const span = cfg.tagDir === 1 ? STAGE_W : STAGE_H;
  const eased = (tt: number) =>
    findAnimationCurveAt(Math.min(1, Math.max(0, tt)), cfg.curves.animation_curve_tag);
  const offset = t < 0.5 ? -eased(t * 2) * span : -(1 - eased((t - 0.5) * 2)) * span;
  const shift = (r: MotionRect): MotionRect =>
    cfg.tagDir === 1 ? { ...r, x: r.x + offset } : { ...r, y: r.y + offset };
  return [mkWin(1, "A", shift(SLOT_A), 1, true), mkWin(2, "B", shift(SLOT_B), 1, false)];
}

function renderFadeOut(t: number, cfg: MotionCfg): MotionWin[] {
  const p = findAnimationCurveAt(t, cfg.curves.animation_curve_opafadeout);
  return [mkWin(1, "A", SLOT_A, lerp(1, cfg.fadeOut, p), true), mkWin(2, "B", SLOT_B, 1, false)];
}

function renderFadeIn(t: number, cfg: MotionCfg): MotionWin[] {
  const p = findAnimationCurveAt(t, cfg.curves.animation_curve_opafadein);
  return [mkWin(1, "A", SLOT_A, lerp(cfg.fadeIn, 1, p), true), mkWin(2, "B", SLOT_B, 1, false)];
}

function renderClose(t: number, cfg: MotionCfg): MotionWin[] {
  const wins: MotionWin[] = [mkWin(1, "A", SLOT_A, 1, true)];
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

/** Render the motion driven by a specific curve config key. */
export function renderMotion(key: string, t: number, cfg: MotionCfg): MotionWin[] {
  switch (key) {
    case "animation_curve_open":
      return renderOpen(t, cfg);
    case "animation_curve_move":
      return renderMove(t, cfg);
    case "animation_curve_focus":
      return renderFocus(t, cfg);
    case "animation_curve_tag":
      return renderTag(t, cfg);
    case "animation_curve_opafadein":
      return renderFadeIn(t, cfg);
    case "animation_curve_opafadeout":
      return renderFadeOut(t, cfg);
    case "animation_curve_close":
      return renderClose(t, cfg);
    default:
      return [];
  }
}

export const MOTION_LABELS: Record<string, string> = {
  animation_curve_open: "Open",
  animation_curve_move: "Move / Resize",
  animation_curve_focus: "Focus",
  animation_curve_tag: "Tag Switch",
  animation_curve_opafadein: "Fade In",
  animation_curve_opafadeout: "Fade Out",
  animation_curve_close: "Close",
};

export const MOTION_DURATION_KEYS: Record<string, string> = {
  animation_curve_move: "animation_duration_move",
  animation_curve_open: "animation_duration_open",
  animation_curve_close: "animation_duration_close",
  animation_curve_tag: "animation_duration_tag",
  animation_curve_focus: "animation_duration_focus",
  animation_curve_opafadein: "animation_duration_move",
  animation_curve_opafadeout: "animation_duration_move",
};
