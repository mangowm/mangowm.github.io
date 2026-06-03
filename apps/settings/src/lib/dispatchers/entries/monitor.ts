import type { DispatcherInfo } from "../types";
import { namedArg } from "../helpers";
import { BOOL_FLAGS } from "../types";

export const MONITOR_ENTRIES: DispatcherInfo[] = [
  {
    name: "focusmon",
    category: "monitor",
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
    category: "monitor",
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
    category: "monitor",
    args: namedArg("monitor", "monitor", "Monitor", "Monitor name (e.g. DP-1)", {
      placeholder: "e.g. DP-1",
      required: true,
    }),
    description: "Power off / shutdown a monitor by monitor spec",
  },
  {
    name: "enable_monitor",
    category: "monitor",
    args: namedArg("monitor", "monitor", "Monitor", "Monitor name (e.g. DP-1)", {
      placeholder: "e.g. DP-1",
      required: true,
    }),
    description: "Power on a monitor by monitor spec",
  },
  {
    name: "toggle_monitor",
    category: "monitor",
    args: namedArg("monitor", "monitor", "Monitor", "Monitor name (e.g. DP-1)", {
      placeholder: "e.g. DP-1",
      required: true,
    }),
    description: "Toggle a monitor's power state by monitor spec",
  },
];
