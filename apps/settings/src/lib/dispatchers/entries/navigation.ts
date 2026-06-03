import type { DispatcherInfo } from "../types";
import { oneArg } from "../helpers";
import { DIRECTION_OPTS, CIRCLE_DIR_OPTS } from "../types";

export const NAVIGATION_ENTRIES: DispatcherInfo[] = [
  {
    name: "focusdir",
    category: "navigation",
    args: oneArg("direction", "Direction", "Nearest window in this direction", {
      options: [...DIRECTION_OPTS],
    }),
    description: "Focus the nearest window in a direction (left/right/up/down)",
  },
  {
    name: "focusstack",
    category: "navigation",
    args: oneArg("circle-dir", "Direction", "Cycle focus in stacking order", {
      options: [...CIRCLE_DIR_OPTS],
    }),
    description: "Cycle focus within the stacking order (next/prev)",
  },
  {
    name: "focuslast",
    category: "navigation",
    args: [],
    description: "Focus the previously active window",
  },
  {
    name: "focusid",
    category: "navigation",
    args: [],
    description: "Focus a specific window by its client ID",
  },
  {
    name: "exchange_client",
    category: "navigation",
    args: oneArg("direction", "Direction", "Swap with neighbour in this direction", {
      options: [...DIRECTION_OPTS],
    }),
    description: "Swap the focused window with its neighbour in a direction (left/right/up/down)",
  },
  {
    name: "exchange_stack_client",
    category: "navigation",
    args: oneArg("circle-dir", "Direction", "Move in stacking order", {
      options: [...CIRCLE_DIR_OPTS],
    }),
    description: "Exchange the focused window's position in the stacking order (next/prev)",
  },
  {
    name: "zoom",
    category: "navigation",
    args: [],
    description: "Swap the focused window with the master window",
  },
];
