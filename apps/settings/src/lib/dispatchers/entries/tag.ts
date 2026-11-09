import type { DispatcherUi } from "../types";
import { namedArg } from "../helpers";
import { TAG_NUMBERS, BOOL_FLAGS } from "../types";

export const TAG_ENTRIES: DispatcherUi[] = [
  {
    name: "tag",
    args: [
      {
        name: "tag",
        type: "tag",
        label: "Target Tag",
        description: "Tag number (1-9)",
        options: [...TAG_NUMBERS],
        required: true,
      },
      {
        name: "synctag",
        type: "bool-flag",
        label: "Sync Across Monitors",
        description: "Apply to all monitors",
        options: [...BOOL_FLAGS],
      },
    ],
  },
  {
    name: "tagsilent",
    args: namedArg("tag", "tag", "Target Tag", "Tag number (1-9)", {
      options: [...TAG_NUMBERS],
      required: true,
    }),
  },
  {
    name: "tagtoleft",
    args: namedArg("synctag", "bool-flag", "Sync Across Monitors", "Apply to all monitors (0/1)", {
      options: [...BOOL_FLAGS],
    }),
  },
  {
    name: "tagtoright",
    args: namedArg("synctag", "bool-flag", "Sync Across Monitors", "Apply to all monitors (0/1)", {
      options: [...BOOL_FLAGS],
    }),
  },
  {
    name: "tagcrossmon",
    args: [
      {
        name: "tag",
        type: "tag",
        label: "Target Tag",
        description: "Tag number (1-9)",
        options: [...TAG_NUMBERS],
        required: true,
      },
      {
        name: "monitor",
        type: "monitor",
        label: "Monitor",
        description: "Monitor name (e.g. DP-1)",
        placeholder: "Monitor name",
      },
    ],
  },
  {
    name: "toggletag",
    args: namedArg("tag", "tag", "Toggle Tag", "Tag to toggle on the focused window (1-9)", {
      options: [...TAG_NUMBERS],
      required: true,
    }),
  },
  {
    name: "tag_special_silent",
    args: [],
  },
  {
    name: "tag_special_tag",
    args: [],
  },
  {
    name: "toggle_special_tag",
    args: [],
  },
];
