import { ALL_TAGS, DISPATCHER_ARG_OPTIONS, TAG_COUNT } from "@mangowm.github.io/schema";

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

export const DIRECTION_OPTS = DISPATCHER_ARG_OPTIONS.direction;
export const CIRCLE_DIR_OPTS = DISPATCHER_ARG_OPTIONS.circle;
export const OVERCIRCLE_OPTS = DISPATCHER_ARG_OPTIONS.overcircle;
export const SWITCHER_OPTS = DISPATCHER_ARG_OPTIONS.switcher;
export const PREV_NEXT_OPTS = DISPATCHER_ARG_OPTIONS["prev-next"];
export const LAYOUT_NAMES = DISPATCHER_ARG_OPTIONS.layout;
export const MOUSE_ACTION_OPTS = DISPATCHER_ARG_OPTIONS["mouse-action"];
export const FORCE_OPTS = DISPATCHER_ARG_OPTIONS.force;
export const ON_OFF_OPTS = DISPATCHER_ARG_OPTIONS["on-off"];
export const TAG_COUNT_MAX = TAG_COUNT;
export const TAG_NUMBERS: readonly string[] = ALL_TAGS.map(String);
export const BOOL_FLAGS = DISPATCHER_ARG_OPTIONS.bool;

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
