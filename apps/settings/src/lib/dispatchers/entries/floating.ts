import type { DispatcherInfo } from "../types";
import { oneArg, namedArg } from "../helpers";
import { DIRECTION_OPTS, MOUSE_ACTION_OPTS } from "../types";

export const FLOATING_ENTRIES: DispatcherInfo[] = [
  {
    name: "smartmovewin",
    category: "floating",
    args: oneArg("direction", "Direction", "Snap direction", { options: [...DIRECTION_OPTS] }),
    description:
      "Move the floating window by the snap distance in a direction (left/right/up/down)",
  },
  {
    name: "smartresizewin",
    category: "floating",
    args: oneArg("direction", "Direction", "Resize direction", { options: [...DIRECTION_OPTS] }),
    description:
      "Resize the floating window by the snap distance in a direction (left/right/up/down)",
  },
  {
    name: "movewin",
    category: "floating",
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
    description: "Move the floating window by absolute or relative offset (+/-x,+/-y)",
  },
  {
    name: "resizewin",
    category: "floating",
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
    description: "Resize the window by absolute or relative width/height (+/-w,+/-h)",
  },
  {
    name: "moveresize",
    category: "floating",
    args: namedArg("action", "mouse-action", "Action", "Mouse action (curmove/curresize)", {
      options: [...MOUSE_ACTION_OPTS],
    }),
    description:
      "Initiate interactive mouse-driven move or resize (curmove/curresize). Used with mousebind",
  },
];
