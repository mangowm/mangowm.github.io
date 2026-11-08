import { BINDING_DIRECTIONS, BINDING_FOLD_STATES, MOUSE_BUTTONS } from "@mangowm.github.io/schema";

/** `s` forces keysym matching, `l` works while locked, `r` fires on release, `p` passes through, `c` allows conflicts */
export interface KeybindFlags {
  symOnly: boolean;
  onLock: boolean;
  onRelease: boolean;
  pass: boolean;
  allowConflict: boolean;
}

export type BindingType = "keyboard" | "mouse" | "axis" | "switch" | "gesture";

export { BINDING_DIRECTIONS, BINDING_FOLD_STATES, MOUSE_BUTTONS };

export type NamedMouseButton = (typeof MOUSE_BUTTONS)[number];

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

export const BINDING_MOTIONS = BINDING_DIRECTIONS;

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
