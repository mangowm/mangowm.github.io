import type { DispatcherUi } from "../types";
import { namedArg } from "../helpers";
import { BOOL_FLAGS, ON_OFF_OPTS } from "../types";

export const MONITOR_ENTRIES: DispatcherUi[] = [
  {
    name: "focusmon",
    args: [
      {
        name: "target",
        type: "string",
        label: "Monitor",
        description: "Direction (left/right/up/down) or monitor name (e.g. DP-1)",
        placeholder: "left or DP-1",
      },
    ],
    description: "Focus a monitor by direction or monitor name",
  },
  {
    name: "tagmon",
    args: [
      {
        name: "target",
        type: "string",
        label: "Target Monitor",
        description: "Direction (left/right/up/down) or monitor name (e.g. DP-1)",
        placeholder: "left or DP-1",
      },
      {
        name: "keeptag",
        type: "bool-flag",
        label: "Keep Tag",
        description: "Keep window's current tag (0/1)",
        options: [...BOOL_FLAGS],
      },
    ],
    description:
      "Move the focused window to a monitor by direction or monitor name. Optional keeptag flag (0/1)",
  },
  {
    name: "disable_monitor",
    args: namedArg("monitor", "monitor", "Monitor", "Monitor name (e.g. DP-1)", {
      placeholder: "e.g. DP-1",
      required: true,
    }),
    description: "Power off / shutdown a monitor by monitor spec",
  },
  {
    name: "enable_monitor",
    args: namedArg("monitor", "monitor", "Monitor", "Monitor name (e.g. DP-1)", {
      placeholder: "e.g. DP-1",
      required: true,
    }),
    description: "Power on a monitor by monitor spec",
  },
  {
    name: "toggle_monitor",
    args: namedArg("monitor", "monitor", "Monitor", "Monitor name (e.g. DP-1)", {
      placeholder: "e.g. DP-1",
      required: true,
    }),
    description: "Toggle a monitor's power state by monitor spec",
  },
  {
    name: "sleep_monitor",
    args: namedArg("monitor", "monitor", "Monitor", "Monitor name (e.g. DP-1)", {
      placeholder: "e.g. DP-1",
      required: true,
    }),
    description: "Put a monitor into sleep / standby by monitor spec",
  },
  {
    name: "wakeup_monitor",
    args: namedArg("monitor", "monitor", "Monitor", "Monitor name (e.g. DP-1)", {
      placeholder: "e.g. DP-1",
      required: true,
    }),
    description: "Wake up a sleeping monitor by monitor spec",
  },
  {
    name: "sleep_toggle_monitor",
    args: namedArg("monitor", "monitor", "Monitor", "Monitor name (e.g. DP-1)", {
      placeholder: "e.g. DP-1",
      required: true,
    }),
    description: "Toggle sleep / standby state on a monitor by monitor spec",
  },
  {
    name: "togglehdr",
    args: [
      {
        name: "state",
        type: "string",
        label: "State",
        description: "on, off, or toggle (default)",
        options: [...ON_OFF_OPTS],
        placeholder: "toggle",
      },
      {
        name: "monitor",
        type: "string",
        label: "Monitor",
        description: "Monitor name (e.g. DP-1). Applies to all monitors when empty",
        placeholder: "e.g. DP-1",
      },
    ],
    description: "Enable, disable, or toggle HDR on a monitor by monitor spec",
  },
];
