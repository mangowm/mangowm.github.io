import type { DispatcherUi } from "../types";
import { oneArg, namedArg } from "../helpers";
import { DIRECTION_OPTS, CIRCLE_DIR_OPTS, OVERCIRCLE_OPTS, BOOL_FLAGS } from "../types";

export const NAVIGATION_ENTRIES: DispatcherUi[] = [
  {
    name: "focusdir",
    args: oneArg("direction", "Direction", "Nearest window in this direction", {
      options: [...DIRECTION_OPTS],
    }),
  },
  {
    name: "focusstack",
    args: oneArg("circle-dir", "Direction", "Cycle focus in stacking order", {
      options: [...CIRCLE_DIR_OPTS],
    }),
  },
  {
    name: "focuslast",
    args: [],
  },
  {
    name: "focusid",
    args: [],
  },
  {
    name: "exchange_client",
    args: oneArg("direction", "Direction", "Swap with neighbour in this direction", {
      options: [...DIRECTION_OPTS],
    }),
  },
  {
    name: "exchange_stack_client",
    args: oneArg("circle-dir", "Direction", "Move in stacking order", {
      options: [...CIRCLE_DIR_OPTS],
    }),
  },
  {
    name: "zoom",
    args: [],
  },
  {
    name: "focus_window_or_workspace",
    args: oneArg("direction", "Direction", "Focus the window in this direction", {
      options: [...DIRECTION_OPTS],
    }),
  },
  {
    name: "groupfocus",
    args: oneArg("circle-dir", "Direction", "Cycle focus within the window group", {
      options: [...CIRCLE_DIR_OPTS],
    }),
  },
  {
    name: "groupjoin",
    args: oneArg("direction", "Direction", "Join the window group in this direction", {
      options: [...DIRECTION_OPTS],
    }),
  },
  {
    name: "groupleave",
    args: [],
  },
  {
    name: "togglejump",
    args: namedArg("flag", "bool-flag", "Flag", "Show jump labels when set to 1", {
      options: [...BOOL_FLAGS],
    }),
  },
  {
    name: "move_client",
    args: oneArg("direction", "Direction", "Move the focused window in this direction", {
      options: [...DIRECTION_OPTS],
    }),
  },
  {
    name: "overcircle",
    args: oneArg("overcircle", "Direction", "Cycle focus in the overview grid", {
      options: [...OVERCIRCLE_OPTS],
    }),
  },
];
