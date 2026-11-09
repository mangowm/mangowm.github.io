import type { DispatcherUi } from "../types";
import { oneArg, namedArg } from "../helpers";
import { DIRECTION_OPTS, CIRCLE_DIR_OPTS, LAYOUT_NAMES } from "../types";

export const LAYOUT_ENTRIES: DispatcherUi[] = [
  {
    name: "setlayout",
    args: namedArg("layout", "layout", "Layout", "Target layout name", {
      options: [...LAYOUT_NAMES],
      required: true,
    }),
  },
  {
    name: "switch_layout",
    args: [],
  },
  {
    name: "incnmaster",
    args: namedArg("delta", "int", "Delta", "Number of masters to add (+1) or remove (-1)", {
      placeholder: "+1",
      required: true,
    }),
  },
  {
    name: "setmfact",
    args: namedArg("ratio", "float", "Ratio", "Master area ratio change (±0.05)", {
      min: -0.9,
      max: 0.9,
      step: 0.01,
      placeholder: "+0.05",
      required: true,
    }),
  },
  {
    name: "set_proportion",
    args: namedArg("proportion", "float", "Proportion", "Window proportion (0.0–1.0)", {
      min: 0,
      max: 1,
      step: 0.01,
      placeholder: "0.5",
      required: true,
    }),
  },
  {
    name: "switch_proportion_preset",
    args: oneArg("circle-dir", "Direction", "Cycle through presets", {
      options: [...CIRCLE_DIR_OPTS],
    }),
  },
  {
    name: "scroller_stack",
    args: oneArg("direction", "Direction", "Move window in scroller stack", {
      options: [...DIRECTION_OPTS],
    }),
  },
  {
    name: "incgaps",
    args: namedArg("delta", "int", "Delta", "Gap size delta (±N)", {
      placeholder: "+5",
      required: true,
    }),
  },
  { name: "togglegaps", args: [] },
  {
    name: "dwindle_toggle_split_direction",
    args: [],
  },
  {
    name: "dwindle_split_horizontal",
    args: [],
  },
  {
    name: "dwindle_split_vertical",
    args: [],
  },
  {
    name: "dwindle_toggle_current_split",
    args: [],
  },
];
