export {
  type ArgType,
  type DispatcherArg,
  type DispatcherCategory,
  type DispatcherInfo,
  DIRECTION_OPTS,
  CIRCLE_DIR_OPTS,
  OVERCIRCLE_OPTS,
  SWITCHER_OPTS,
  PREV_NEXT_OPTS,
  LAYOUT_NAMES,
  MOUSE_ACTION_OPTS,
  FORCE_OPTS,
  ON_OFF_OPTS,
  TAG_NUMBERS,
  BOOL_FLAGS,
} from "./types";
export { parseArgValues, serializeArgValues } from "./serialize";
export { validateArgValue, validateAllArgs } from "./validate";

import {
  CATEGORIES,
  DISPATCHER_ALIASES,
  DISPATCHER_ARG_META,
  DISPATCHER_ARG_OPTIONS,
  DISPATCHER_CATEGORIES,
  DISPATCHER_CATEGORY_ORDER,
  DISPATCHER_DESCRIPTIONS,
  DISPATCHER_EXAMPLES,
  DISPATCHERS,
  type DispatcherArgKind,
} from "@mangowm.github.io/config/catalog";

import type { ArgType, DispatcherArg, DispatcherCategory, DispatcherInfo } from "./types";

const CONTROL_BY_KIND: Record<DispatcherArgKind, ArgType> = {
  direction: "direction",
  circle: "circle-dir",
  overcircle: "overcircle",
  switcher: "switcher",
  "prev-next": "prev-next",
  int: "int",
  float: "float",
  bool: "bool-flag",
  "tag-mask": "tag-mask",
  layout: "layout",
  monitor: "monitor",
  option: "string",
  string: "string",
  free: "command",
  "mouse-action": "mouse-action",
  force: "force",
  "on-off": "on-off",
  index100: "int",
  "unit-float": "float",
};

const ARG_OPTIONS = DISPATCHER_ARG_OPTIONS as Partial<Record<DispatcherArgKind, readonly string[]>>;

function dispatcherArg(
  meta: (typeof DISPATCHER_ARG_META)[keyof typeof DISPATCHER_ARG_META][number],
): DispatcherArg {
  const options = ARG_OPTIONS[meta.kind];

  return {
    name: meta.name,
    type: CONTROL_BY_KIND[meta.kind],
    label: meta.label,
    description: meta.description,
    placeholder: meta.placeholder,
    options: options ? [...options] : undefined,
    min: meta.min,
    max: meta.max,
    step: meta.step,
    required: meta.required,
  };
}

export const MANGO_DISPATCHERS: DispatcherInfo[] = DISPATCHERS.map((name) => ({
  name,
  category: DISPATCHER_CATEGORIES[name],
  description: DISPATCHER_DESCRIPTIONS[name],
  aliases: DISPATCHER_ALIASES[name] ?? [],
  examples: DISPATCHER_EXAMPLES[name] ?? [],
  args: DISPATCHER_ARG_META[name].map(dispatcherArg),
}));

export const DISPATCHER_MAP: ReadonlyMap<string, DispatcherInfo> = new Map(
  MANGO_DISPATCHERS.map((dispatcher) => [dispatcher.name, dispatcher]),
);

export function categoryLabel(category: string): string {
  return CATEGORIES[category as DispatcherCategory]?.label ?? category;
}

export function getDispatchersByCategory(): [DispatcherCategory, DispatcherInfo[]][] {
  return DISPATCHER_CATEGORY_ORDER.map(
    (category) =>
      [
        category,
        MANGO_DISPATCHERS.filter((dispatcher) => dispatcher.category === category),
      ] as const,
  );
}
