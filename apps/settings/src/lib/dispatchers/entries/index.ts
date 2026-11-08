import { DISPATCHERS, DISPATCHER_ARGS, type DispatcherArgKind } from "@mangowm.github.io/schema";

import {
  BOOL_FLAGS,
  CIRCLE_DIR_OPTS,
  DIRECTION_OPTS,
  FORCE_OPTS,
  LAYOUT_NAMES,
  MOUSE_ACTION_OPTS,
  ON_OFF_OPTS,
  OVERCIRCLE_OPTS,
  PREV_NEXT_OPTS,
  SWITCHER_OPTS,
  type ArgType,
  type DispatcherArg,
  type DispatcherInfo,
  type DispatcherUi,
} from "../types";
import { WINDOW_ENTRIES } from "./window";
import { SCRATCHPAD_ENTRIES } from "./scratchpad";
import { NAVIGATION_ENTRIES } from "./navigation";
import { VIEW_ENTRIES } from "./view";
import { TAG_ENTRIES } from "./tag";
import { MONITOR_ENTRIES } from "./monitor";
import { LAYOUT_ENTRIES } from "./layout";
import { FLOATING_ENTRIES } from "./floating";
import { SPAWN_ENTRIES } from "./spawn";
import { SYSTEM_ENTRIES } from "./system";

const UI_DISPATCHERS: DispatcherUi[] = [
  ...WINDOW_ENTRIES,
  ...SCRATCHPAD_ENTRIES,
  ...NAVIGATION_ENTRIES,
  ...VIEW_ENTRIES,
  ...TAG_ENTRIES,
  ...MONITOR_ENTRIES,
  ...LAYOUT_ENTRIES,
  ...FLOATING_ENTRIES,
  ...SPAWN_ENTRIES,
  ...SYSTEM_ENTRIES,
];

const UI_BY_NAME = new Map(UI_DISPATCHERS.map((dispatcher) => [dispatcher.name, dispatcher]));

const KIND_INFO: Record<
  DispatcherArgKind,
  {
    type: ArgType;
    name: string;
    label: string;
    options?: readonly string[];
    min?: number;
    max?: number;
    step?: number;
  }
> = {
  direction: { type: "direction", name: "direction", label: "Direction", options: DIRECTION_OPTS },
  circle: { type: "circle-dir", name: "direction", label: "Direction", options: CIRCLE_DIR_OPTS },
  overcircle: {
    type: "overcircle",
    name: "direction",
    label: "Direction",
    options: OVERCIRCLE_OPTS,
  },
  int: { type: "int", name: "value", label: "Value" },
  float: { type: "float", name: "value", label: "Value" },
  bool: { type: "bool-flag", name: "value", label: "Value", options: BOOL_FLAGS },
  "tag-mask": { type: "tag-mask", name: "tags", label: "Tags" },
  layout: { type: "layout", name: "layout", label: "Layout", options: LAYOUT_NAMES },
  monitor: { type: "monitor", name: "monitor", label: "Monitor" },
  option: { type: "string", name: "option", label: "Option" },
  string: { type: "string", name: "value", label: "Value" },
  free: { type: "command", name: "command", label: "Command" },
  "mouse-action": {
    type: "mouse-action",
    name: "action",
    label: "Action",
    options: MOUSE_ACTION_OPTS,
  },
  force: { type: "force", name: "force", label: "Force", options: FORCE_OPTS },
  switcher: { type: "switcher", name: "direction", label: "Direction", options: SWITCHER_OPTS },
  "on-off": { type: "on-off", name: "state", label: "State", options: ON_OFF_OPTS },
  "prev-next": {
    type: "prev-next",
    name: "direction",
    label: "Direction",
    options: PREV_NEXT_OPTS,
  },
  index100: { type: "int", name: "value", label: "Value", min: 0, max: 100 },
  "unit-float": { type: "float", name: "value", label: "Value", min: 0, max: 1, step: 0.01 },
};

function defaultArg(kind: DispatcherArgKind, index: number): DispatcherArg {
  const info = KIND_INFO[kind];
  const suffix = index === 0 ? "" : ` ${index + 1}`;
  return {
    name: `${info.name}${index === 0 ? "" : index + 1}`,
    type: info.type,
    label: `${info.label}${suffix}`,
    description: "",
    options: info.options ? [...info.options] : undefined,
    min: info.min,
    max: info.max,
    step: info.step,
    required: false,
  };
}

function mergeArg(
  kind: DispatcherArgKind,
  index: number,
  ui: Partial<DispatcherArg> | undefined,
): DispatcherArg {
  const base = defaultArg(kind, index);
  if (!ui) return base;

  return {
    ...base,
    ...ui,
    type: base.type,
    options: ui.options ?? base.options,
    min: ui.min ?? base.min,
    max: ui.max ?? base.max,
    step: ui.step ?? base.step,
  };
}

export const MANGO_DISPATCHERS: DispatcherInfo[] = DISPATCHERS.map((name) => {
  const ui = UI_BY_NAME.get(name);
  const kinds = DISPATCHER_ARGS[name];

  return {
    name,
    category: ui?.category ?? "system",
    description: ui?.description ?? "",
    args: kinds.map((kind, index) => mergeArg(kind, index, ui?.args?.[index])),
  };
});
