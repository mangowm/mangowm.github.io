import type { DispatcherInfo } from "../types";
import { oneArg, namedArg } from "../helpers";
import { DIRECTION_OPTS, CIRCLE_DIR_OPTS, LAYOUT_NAMES } from "../types";

export const LAYOUT_ENTRIES: DispatcherInfo[] = [
  {
    name: "setlayout",
    category: "layout",
    args: namedArg("layout", "layout", "Layout", "Target layout name", {
      options: [...LAYOUT_NAMES],
      required: true,
    }),
    description:
      "Switch to a specific layout by name (tile, scroller, grid, deck, monocle, center_tile, vertical_tile, vertical_scroller)",
  },
  {
    name: "switch_layout",
    category: "layout",
    args: [],
    description:
      "Cycle through layouts. The circle_layout option (settable per-binding in the edit dialog) restricts which layouts are cycled.",
  },
  {
    name: "incnmaster",
    category: "layout",
    args: namedArg("delta", "int", "Delta", "Number of masters to add (+1) or remove (-1)", {
      placeholder: "+1",
      required: true,
    }),
    description: "Increase or decrease the number of master windows (+1/-1)",
  },
  {
    name: "setmfact",
    category: "layout",
    args: namedArg("ratio", "float", "Ratio", "Master area ratio change (±0.05)", {
      min: -0.9,
      max: 0.9,
      step: 0.01,
      placeholder: "+0.05",
      required: true,
    }),
    description: "Increase or decrease the master area size ratio (e.g. +0.05)",
  },
  {
    name: "set_proportion",
    category: "layout",
    args: namedArg("proportion", "float", "Proportion", "Window proportion (0.0–1.0)", {
      min: 0,
      max: 1,
      step: 0.01,
      placeholder: "0.5",
      required: true,
    }),
    description: "Set the scroller layout window proportion (0.0–1.0)",
  },
  {
    name: "switch_proportion_preset",
    category: "layout",
    args: oneArg("circle-dir", "Direction", "Cycle through presets", {
      options: [...CIRCLE_DIR_OPTS],
    }),
    description: "Cycle through scroller proportion presets (next/prev)",
  },
  {
    name: "scroller_stack",
    category: "layout",
    args: oneArg("direction", "Direction", "Move window in scroller stack", {
      options: [...DIRECTION_OPTS],
    }),
    description:
      "Move a window into or out of the scroller stack by direction (left/right/up/down)",
  },
  {
    name: "incgaps",
    category: "layout",
    args: namedArg("delta", "int", "Delta", "Gap size delta (±N)", {
      placeholder: "+5",
      required: true,
    }),
    description: "Adjust the gap size by a relative value (+/-N)",
  },
  { name: "togglegaps", category: "layout", args: [], description: "Toggle gaps on and off" },
  {
    name: "dwindle_toggle_split_direction",
    category: "layout",
    args: [],
    description: "Toggle the split direction in dwindle layout (manual split mode)",
  },
  {
    name: "dwindle_split_horizontal",
    category: "layout",
    args: [],
    description: "Set the split window direction to horizontal in dwindle layout",
  },
  {
    name: "dwindle_split_vertical",
    category: "layout",
    args: [],
    description: "Set the split window direction to vertical in dwindle layout",
  },
];
