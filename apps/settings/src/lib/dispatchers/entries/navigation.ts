import type { DispatcherUi } from "../types";
import { oneArg, namedArg } from "../helpers";
import { DIRECTION_OPTS, CIRCLE_DIR_OPTS, OVERCIRCLE_OPTS, BOOL_FLAGS } from "../types";

export const NAVIGATION_ENTRIES: DispatcherUi[] = [
  {
    name: "focusdir",
    args: oneArg("direction", "Direction", "Nearest window in this direction", {
      options: [...DIRECTION_OPTS],
    }),
    description: "Focus the nearest window in a direction (left/right/up/down)",
  },
  {
    name: "focusstack",
    args: oneArg("circle-dir", "Direction", "Cycle focus in stacking order", {
      options: [...CIRCLE_DIR_OPTS],
    }),
    description: "Cycle focus within the stacking order (next/prev)",
  },
  {
    name: "focuslast",
    args: [],
    description: "Focus the previously active window",
  },
  {
    name: "focusid",
    args: [],
    description: "Focus a specific window by its client ID",
  },
  {
    name: "exchange_client",
    args: oneArg("direction", "Direction", "Swap with neighbour in this direction", {
      options: [...DIRECTION_OPTS],
    }),
    description: "Swap the focused window with its neighbour in a direction (left/right/up/down)",
  },
  {
    name: "exchange_stack_client",
    args: oneArg("circle-dir", "Direction", "Move in stacking order", {
      options: [...CIRCLE_DIR_OPTS],
    }),
    description: "Exchange the focused window's position in the stacking order (next/prev)",
  },
  {
    name: "zoom",
    args: [],
    description: "Swap the focused window with the master window",
  },
  {
    name: "focus_window_or_workspace",
    args: oneArg("direction", "Direction", "Focus the window in this direction", {
      options: [...DIRECTION_OPTS],
    }),
    description: "Focus the window in a direction, falling back to the tag",
  },
  {
    name: "groupfocus",
    args: oneArg("circle-dir", "Direction", "Cycle focus within the window group", {
      options: [...CIRCLE_DIR_OPTS],
    }),
    description: "Cycle focus within a window group (next/prev)",
  },
  {
    name: "groupjoin",
    args: oneArg("direction", "Direction", "Join the window group in this direction", {
      options: [...DIRECTION_OPTS],
    }),
    description: "Join the adjacent window's group in a direction (left/right/up/down)",
  },
  {
    name: "groupleave",
    args: [],
    description: "Leave the current window group",
  },
  {
    name: "togglejump",
    args: namedArg("flag", "bool-flag", "Flag", "Show jump labels when set to 1", {
      options: [...BOOL_FLAGS],
    }),
    description: "Toggle the jump-label overlay for quick window selection",
  },
  {
    name: "move_client",
    args: oneArg("direction", "Direction", "Move the focused window in this direction", {
      options: [...DIRECTION_OPTS],
    }),
    description: "Move the focused window in a direction",
  },
  {
    name: "overcircle",
    args: oneArg("overcircle", "Direction", "Cycle focus in the overview grid", {
      options: [...OVERCIRCLE_OPTS],
    }),
    description: "Cycle focus in the overview grid",
  },
];
