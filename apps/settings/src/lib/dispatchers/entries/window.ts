import type { DispatcherUi } from "../types";
import { namedArg } from "../helpers";

export const WINDOW_ENTRIES: DispatcherUi[] = [
  {
    name: "killclient",
    args: namedArg("force", "force", "Force", "Close the window even if it resists"),
    description: "Close the focused window",
  },
  {
    name: "togglefloating",
    args: [],
    description: "Toggle floating state of the focused window",
  },
  {
    name: "toggle_all_floating",
    args: [],
    description: "Toggle floating state for all visible clients",
  },
  { name: "togglefullscreen", args: [], description: "Toggle fullscreen mode" },
  {
    name: "togglefakefullscreen",
    args: [],
    description: "Toggle fake fullscreen (window stays constrained to monitor)",
  },
  {
    name: "togglemaximizescreen",
    args: [],
    description: "Maximize window while keeping decorations and status bar visible",
  },
  {
    name: "toggleglobal",
    args: [],
    description: "Pin window to all tags (stick across tag switches)",
  },
  {
    name: "toggle_render_border",
    args: [],
    description: "Toggle border rendering for the focused window",
  },
  {
    name: "centerwin",
    args: [],
    description: "Center the floating window on screen",
  },
  {
    name: "toggleoverlay",
    args: [],
    description: "Toggle the overlay state for the focused window (always-on-top layer)",
  },
  {
    name: "smartkillclient",
    args: [],
    description: "Remove the focused window from the current tags, or close it if it is only there",
  },
  {
    name: "togglegroupbar",
    args: [],
    description: "Toggle the group bar on every tiled window",
  },
];
