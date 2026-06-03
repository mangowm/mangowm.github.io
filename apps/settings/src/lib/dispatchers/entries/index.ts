import type { DispatcherInfo } from "../types";
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

export const MANGO_DISPATCHERS: DispatcherInfo[] = [
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
