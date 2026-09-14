export type ArgType =
  | "none"
  | "direction"
  | "circle-dir"
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
  | "mouse-action";

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
export const LAYOUT_NAMES = [
  "tile",
  "scroller",
  "grid",
  "deck",
  "monocle",
  "center_tile",
  "vertical_tile",
  "vertical_scroller",
] as const;
export const MOUSE_ACTION_OPTS = ["curmove", "curresize"] as const;
export const TAG_COUNT_MAX = 31;
export const TAG_NUMBERS: readonly string[] = Array.from({ length: TAG_COUNT_MAX }, (_, i) =>
  String(i + 1),
);
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
