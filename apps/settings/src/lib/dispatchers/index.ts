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
export { MANGO_DISPATCHERS } from "./entries";
export { parseArgValues, serializeArgValues } from "./serialize";
export { validateArgValue, validateAllArgs } from "./validate";

import type { DispatcherCategory, DispatcherInfo } from "./types";
import { MANGO_DISPATCHERS } from "./entries";

export const DISPATCHER_MAP: ReadonlyMap<string, DispatcherInfo> = new Map(
  MANGO_DISPATCHERS.map((d) => [d.name, d]),
);

const CATEGORY_ORDER: DispatcherCategory[] = [
  "window",
  "scratchpad",
  "navigation",
  "view",
  "tag",
  "monitor",
  "layout",
  "floating",
  "spawn",
  "system",
];

export function getDispatchersByCategory(): [DispatcherCategory, DispatcherInfo[]][] {
  return CATEGORY_ORDER.map(
    (cat) => [cat, MANGO_DISPATCHERS.filter((d) => d.category === cat)] as const,
  );
}
