/** `s` forces keysym matching, `l` works while locked, `r` fires on release, `p` passes through */
export interface KeybindFlags {
  symOnly: boolean;
  onLock: boolean;
  onRelease: boolean;
  pass: boolean;
}

export type BindingType = "keyboard" | "mouse" | "axis" | "switch" | "gesture";

/**
 * All 8 named mouse buttons mango's C parser supports,
 * plus raw `code:<N>` handled as a string fallback.
 */
export const MOUSE_BUTTONS = [
  "btn_left",
  "btn_right",
  "btn_middle",
  "btn_side",
  "btn_extra",
  "btn_forward",
  "btn_back",
  "btn_task",
] as const;

export type NamedMouseButton = (typeof MOUSE_BUTTONS)[number];

/** Suffix → human label for mouse buttons */
export const MOUSE_BUTTON_LABELS: Record<string, string> = {
  btn_left: "Left",
  btn_right: "Right",
  btn_middle: "Middle / Scroll",
  btn_side: "Side",
  btn_extra: "Extra",
  btn_forward: "Forward",
  btn_back: "Back",
  btn_task: "Task",
};

/** C-level directions for axis and gesture bindings */
export const BINDING_DIRECTIONS = ["up", "down", "left", "right"] as const;

/** Fold states for switch bindings */
export const BINDING_FOLD_STATES = ["fold", "unfold"] as const;

/** Gesture motions (same as directions, different semantics for UI label) */
export const BINDING_MOTIONS = ["up", "down", "left", "right"] as const;

export interface Keybinding {
  readonly id: string;
  readonly keyword: string;
  readonly ordinal: number;
  readonly type: BindingType;

  readonly mods: string;
  readonly key: string;
  readonly func: string;
  readonly args: string;

  readonly mode: string;
  readonly flags: KeybindFlags;
  readonly fingers: string;
}
