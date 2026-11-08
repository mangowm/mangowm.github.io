import { ALL_TAGS, LAYOUTS, TAG_COUNT } from "@mangowm.github.io/schema";

export type ArgType =
  | "none"
  | "direction"
  | "circle-dir"
  | "overcircle"
  | "switcher"
  | "prev-next"
  | "int"
  | "uint"
  | "float"
  | "string"
  | "command"
  | "layout"
  | "monitor"
  | "tag"
  | "tag-mask"
  | "bool-flag"
  | "mouse-action"
  | "force"
  | "on-off";

export interface DispatcherArg {
  name: string;
  type: ArgType;
  label: string;
  description: string;
  placeholder?: string;
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
}

export const DIRECTION_OPTS = ["left", "right", "up", "down"] as const;
export const CIRCLE_DIR_OPTS = ["next", "prev"] as const;
export const OVERCIRCLE_OPTS = ["next", "prev", "current_next", "current_prev"] as const;
export const SWITCHER_OPTS = [
  "next",
  "prev",
  "all_next",
  "all_prev",
  "all_tag_next",
  "all_tag_prev",
] as const;
export const PREV_NEXT_OPTS = ["prev", "next"] as const;
export const LAYOUT_NAMES = LAYOUTS;
export const MOUSE_ACTION_OPTS = ["curmove", "curresize", "curnormal", "curpressed"] as const;
export const TAG_COUNT_MAX = TAG_COUNT;
export const TAG_NUMBERS: readonly string[] = ALL_TAGS.map(String);
export const BOOL_FLAGS = ["0", "1"] as const;

export type DispatcherCategory =
  | "window"
  | "scratchpad"
  | "navigation"
  | "view"
  | "tag"
  | "monitor"
  | "layout"
  | "floating"
  | "spawn"
  | "system";

export interface DispatcherInfo {
  name: string;
  category: DispatcherCategory;
  description: string;
  args: DispatcherArg[];
}

/** UI-only metadata keyed by dispatcher name. Argument signatures come from schema. */
export interface DispatcherUi {
  name: string;
  category: DispatcherCategory;
  description: string;
  args?: Partial<DispatcherArg>[];
}
