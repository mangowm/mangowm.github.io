import { cn } from "../../cn";

export const TIMINGS = [
  { phase: 0, delay: 0 },
  { phase: 1, delay: 500 },
  { phase: 2, delay: 1500 },
  { phase: 3, delay: 2500 },
  { phase: 4, delay: 4000 },
  { phase: 5, delay: 5000 },
  { phase: 6, delay: 6000 },
  { phase: 7, delay: 7000 },
  { phase: 8, delay: 8000 },
] as const;

export const TOTAL_DURATION = 9500;

export const CARD_TRANSITION = "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)";

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function setCard(
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

export function setCardWithZIndex(
  el: HTMLDivElement | null,
  { x, y, w, h }: Rect,
  visible: boolean,
  active: boolean,
  zIndex: number,
) {
  if (!el) return;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  el.style.width = `${w}px`;
  el.style.height = `${h}px`;
  el.style.zIndex = String(zIndex);
  el.style.opacity = visible ? "1" : "0";
  el.style.transform = visible ? "scale(1)" : "scale(0.9)";
  el.className = cn("card-base", active ? "card-active" : "card-inactive");
}

export function applyCardVisibility(el: HTMLDivElement | null, visible: boolean, active: boolean) {
  if (!el) return;
  el.style.opacity = visible ? "1" : "0";
  el.style.transform = visible ? "scale(1)" : "scale(0.9)";
  el.className = cn("card-base", active ? "card-active" : "card-inactive");
}
