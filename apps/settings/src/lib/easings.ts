import type { BezierValue } from "./curve";

export interface EasingPreset {
  name: string;
  curve: BezierValue;
}

/**
 * CSS keywords plus the Penner / easings.net cubic-bezier presets.
 * Only curves with all four values non-negative are included: mango's parser
 * rejects negative curve components (the "back" family is therefore excluded).
 */
export const EASING_PRESETS: EasingPreset[] = [
  { name: "linear", curve: [0, 0, 1, 1] },
  { name: "ease", curve: [0.25, 0.1, 0.25, 1] },
  { name: "ease-in", curve: [0.42, 0, 1, 1] },
  { name: "ease-out", curve: [0, 0, 0.58, 1] },
  { name: "ease-in-out", curve: [0.42, 0, 0.58, 1] },
  { name: "easeInSine", curve: [0.12, 0, 0.39, 0] },
  { name: "easeOutSine", curve: [0.61, 1, 0.88, 1] },
  { name: "easeInOutSine", curve: [0.37, 0, 0.63, 1] },
  { name: "easeInQuad", curve: [0.11, 0, 0.5, 0] },
  { name: "easeOutQuad", curve: [0.5, 1, 0.89, 1] },
  { name: "easeInOutQuad", curve: [0.45, 0, 0.55, 1] },
  { name: "easeInCubic", curve: [0.32, 0, 0.67, 0] },
  { name: "easeOutCubic", curve: [0.33, 1, 0.68, 1] },
  { name: "easeInOutCubic", curve: [0.65, 0, 0.35, 1] },
  { name: "easeInQuart", curve: [0.5, 0, 0.75, 0] },
  { name: "easeOutQuart", curve: [0.25, 1, 0.5, 1] },
  { name: "easeInOutQuart", curve: [0.76, 0, 0.24, 1] },
  { name: "easeInQuint", curve: [0.64, 0, 0.78, 0] },
  { name: "easeOutQuint", curve: [0.22, 1, 0.36, 1] },
  { name: "easeInOutQuint", curve: [0.83, 0, 0.17, 1] },
  { name: "easeInExpo", curve: [0.7, 0, 0.84, 0] },
  { name: "easeOutExpo", curve: [0.16, 1, 0.3, 1] },
  { name: "easeInOutExpo", curve: [0.87, 0, 0.13, 1] },
  { name: "easeInCirc", curve: [0.55, 0, 1, 0.45] },
  { name: "easeOutCirc", curve: [0, 0.55, 0.45, 1] },
  { name: "easeInOutCirc", curve: [0.85, 0, 0.15, 1] },
];
