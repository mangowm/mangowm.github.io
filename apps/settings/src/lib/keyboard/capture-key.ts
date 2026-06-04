import { jsKeyToXkb } from "./js-to-xkb";

export interface CapturedCombo {
  key: string;
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
  super: boolean;
}

export type CaptureResult =
  | { kind: "captured"; combo: CapturedCombo }
  | { kind: "cancel" }
  | { kind: "skip" };

export function captureKey(event: KeyboardEvent): CaptureResult {
  if (event.key === "Escape") return { kind: "cancel" };

  if (event.repeat) return { kind: "skip" };

  const key = jsKeyToXkb(event.key);
  if (!key) return { kind: "skip" };

  return {
    kind: "captured",
    combo: {
      key,
      ctrl: event.ctrlKey,
      alt: event.altKey,
      shift: event.shiftKey,
      super: event.metaKey,
    },
  };
}
