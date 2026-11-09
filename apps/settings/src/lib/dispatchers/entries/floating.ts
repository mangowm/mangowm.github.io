import type { DispatcherUi } from "../types";
import { oneArg, namedArg } from "../helpers";
import { DIRECTION_OPTS, MOUSE_ACTION_OPTS } from "../types";

export const FLOATING_ENTRIES: DispatcherUi[] = [
  {
    name: "smartmovewin",
    args: oneArg("direction", "Direction", "Snap direction", { options: [...DIRECTION_OPTS] }),
  },
  {
    name: "smartresizewin",
    args: oneArg("direction", "Direction", "Resize direction", { options: [...DIRECTION_OPTS] }),
  },
  {
    name: "movewin",
    args: [
      {
        name: "x",
        type: "string",
        label: "X Offset",
        description: "Absolute (100) or relative (+50/-25)",
        placeholder: "+50",
        required: true,
      },
      {
        name: "y",
        type: "string",
        label: "Y Offset",
        description: "Absolute (100) or relative (+50/-25)",
        placeholder: "+100",
        required: true,
      },
    ],
  },
  {
    name: "resizewin",
    args: [
      {
        name: "w",
        type: "string",
        label: "Width",
        description: "Absolute (200) or relative (+50/-25)",
        placeholder: "+50",
        required: true,
      },
      {
        name: "h",
        type: "string",
        label: "Height",
        description: "Absolute (200) or relative (+50/-25)",
        placeholder: "+100",
        required: true,
      },
    ],
  },
  {
    name: "moveresize",
    args: namedArg("action", "mouse-action", "Action", "Mouse action (curmove/curresize)", {
      options: [...MOUSE_ACTION_OPTS],
    }),
  },
];
