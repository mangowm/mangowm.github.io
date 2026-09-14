import type { DispatcherInfo } from "../types";

export const WINDOW_ENTRIES: DispatcherInfo[] = [
  { name: "killclient", category: "window", args: [], description: "Close the focused window" },
  {
    name: "togglefloating",
    category: "window",
    args: [],
    description: "Toggle floating state of the focused window",
  },
  {
    name: "toggle_all_floating",
    category: "window",
    args: [],
    description: "Toggle floating state for all visible clients",
  },
  { name: "togglefullscreen", category: "window", args: [], description: "Toggle fullscreen mode" },
  {
    name: "togglefakefullscreen",
    category: "window",
    args: [],
    description: "Toggle fake fullscreen (window stays constrained to monitor)",
  },
  {
    name: "togglemaximizescreen",
    category: "window",
    args: [],
    description: "Maximize window while keeping decorations and status bar visible",
  },
  {
    name: "toggleglobal",
    category: "window",
    args: [],
    description: "Pin window to all tags (stick across tag switches)",
  },
  {
    name: "toggle_render_border",
    category: "window",
    args: [],
    description: "Toggle border rendering for the focused window",
  },
  {
    name: "centerwin",
    category: "window",
    args: [],
    description: "Center the floating window on screen",
  },
  {
    name: "toggleoverlay",
    category: "window",
    args: [],
    description: "Toggle the overlay state for the focused window (always-on-top layer)",
  },
];
