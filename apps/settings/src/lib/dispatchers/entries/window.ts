import type { DispatcherUi } from "../types";
import { namedArg } from "../helpers";

export const WINDOW_ENTRIES: DispatcherUi[] = [
  {
    name: "killclient",
    args: namedArg("force", "force", "Force", "Close the window even if it resists"),
  },
  {
    name: "togglefloating",
    args: [],
  },
  {
    name: "toggle_all_floating",
    args: [],
  },
  { name: "togglefullscreen", args: [] },
  {
    name: "togglefakefullscreen",
    args: [],
  },
  {
    name: "togglemaximizescreen",
    args: [],
  },
  {
    name: "toggleglobal",
    args: [],
  },
  {
    name: "toggle_render_border",
    args: [],
  },
  {
    name: "centerwin",
    args: [],
  },
  {
    name: "toggleoverlay",
    args: [],
  },
  {
    name: "smartkillclient",
    args: [],
  },
  {
    name: "togglegroupbar",
    args: [],
  },
];
