export type BindingKind = "key" | "mouse" | "axis" | "gesture" | "switch";

export const BINDING_KINDS = ["key", "mouse", "axis", "gesture", "switch"] as const;

export const BINDING_KEYWORDS: Record<BindingKind, string> = {
  key: "bind",
  mouse: "mousebind",
  axis: "axisbind",
  gesture: "gesturebind",
  switch: "switchbind",
};

export const BINDING_FLAGS = ["sym", "lock", "release", "pass", "conflict"] as const;

export type BindingFlag = (typeof BINDING_FLAGS)[number];

export const BINDING_FLAG_LETTERS: Record<BindingFlag, string> = {
  sym: "s",
  lock: "l",
  release: "r",
  pass: "p",
  conflict: "c",
};

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

export const BINDING_DIRECTIONS = ["left", "right", "up", "down", "alldir"] as const;

export const BINDING_SWITCH_STATES = [
  "lid_on",
  "lid_off",
  "tablet_on",
  "tablet_off",
  "keypad_slide_on",
  "keypad_slide_off",
] as const;

export const REMOVED_SWITCH_STATES: Record<string, (typeof BINDING_SWITCH_STATES)[number]> = {
  fold: "lid_on",
  unfold: "lid_off",
};

export const MODIFIER_ORDER = ["super", "ctrl", "alt", "shift", "hyper"] as const;

export const BINDING_MODIFIERS = [
  "super",
  "super_l",
  "super_r",
  "ctrl",
  "ctrl_l",
  "ctrl_r",
  "shift",
  "shift_l",
  "shift_r",
  "alt",
  "alt_l",
  "alt_r",
  "hyper",
  "hyper_l",
  "hyper_r",
  "none",
] as const;

export const BINDING_BARE_MODIFIERS = ["super", "ctrl", "shift", "alt", "hyper", "none"] as const;

export const BINDING_MODIFIER_CODES = [133, 134, 37, 105, 50, 62, 64, 108] as const;
