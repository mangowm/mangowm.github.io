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
    description:
      "Move the focused window to a tag (1-9). Optional synctag flag (0/1) syncs across monitors",
  },
  {
    name: "tagsilent",
    args: namedArg("tag", "tag", "Target Tag", "Tag number (1-9)", {
      options: [...TAG_NUMBERS],
      required: true,
    }),
    description: "Move the focused window to a tag (1-9) without switching focus to it",
  },
  {
    name: "tagtoleft",
    args: namedArg("synctag", "bool-flag", "Sync Across Monitors", "Apply to all monitors (0/1)", {
      options: [...BOOL_FLAGS],
    }),
    description: "Move the focused window to the previous tag. Optional synctag flag",
  },
  {
    name: "tagtoright",
    args: namedArg("synctag", "bool-flag", "Sync Across Monitors", "Apply to all monitors (0/1)", {
      options: [...BOOL_FLAGS],
    }),
    description: "Move the focused window to the next tag. Optional synctag flag",
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
    description: "Move the focused window to the specified tag on the specified monitor",
  },
  {
    name: "toggletag",
    args: namedArg("tag", "tag", "Toggle Tag", "Tag to toggle on the focused window (1-9)", {
      options: [...TAG_NUMBERS],
      required: true,
    }),
    description: "Toggle a tag (1-9) on the focused window",
  },
  {
    name: "tag_special_silent",
    args: [],
    description: "Move the focused window to or from the special tag without focusing it",
  },
  {
    name: "tag_special_tag",
    args: [],
    description: "Move the focused window to or from the special tag",
  },
  {
    name: "toggle_special_tag",
    args: [],
    description: "Toggle the special tag overlay",
  },
];
