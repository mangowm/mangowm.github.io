import type { DispatcherUi } from "../types";
import { namedArg, oneArg } from "../helpers";
import { TAG_NUMBERS, BOOL_FLAGS, PREV_NEXT_OPTS } from "../types";

export const VIEW_ENTRIES: DispatcherUi[] = [
  {
    name: "view",
    args: [
      {
        name: "tag",
        type: "tag-mask",
        label: "Tag(s)",
        description: "Tag number (1-9), mask (1|3|5), -1 = previous, 0 = all",
        placeholder: "e.g. 1 or 1|3|5",
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
    name: "viewtoleft",
    args: namedArg("synctag", "bool-flag", "Sync Across Monitors", "Apply to all monitors (0/1)", {
      options: [...BOOL_FLAGS],
    }),
  },
  {
    name: "viewtoright",
    args: namedArg("synctag", "bool-flag", "Sync Across Monitors", "Apply to all monitors (0/1)", {
      options: [...BOOL_FLAGS],
    }),
  },
  {
    name: "viewtoleft_have_client",
    args: namedArg("synctag", "bool-flag", "Sync Across Monitors", "Apply to all monitors (0/1)", {
      options: [...BOOL_FLAGS],
    }),
  },
  {
    name: "viewtoright_have_client",
    args: namedArg("synctag", "bool-flag", "Sync Across Monitors", "Apply to all monitors (0/1)", {
      options: [...BOOL_FLAGS],
    }),
  },
  {
    name: "viewcrossmon",
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
    name: "toggleview",
    args: namedArg("tag", "tag", "Toggle Tag", "Tag whose visibility to toggle (1-9)", {
      options: [...TAG_NUMBERS],
      required: true,
    }),
  },
  {
    name: "comboview",
    args: namedArg("tag", "tag", "Combo Tag", "Tag number (1-9) for combo-key navigation", {
      options: [...TAG_NUMBERS],
      required: true,
    }),
  },
  {
    name: "view_insert",
    args: oneArg("prev-next", "Direction", "Insert before or after the current tag", {
      options: [...PREV_NEXT_OPTS],
    }),
  },
  {
    name: "viewnext_have_client",
    args: namedArg("synctag", "bool-flag", "Sync Across Monitors", "Apply to all monitors (0/1)", {
      options: [...BOOL_FLAGS],
    }),
  },
  {
    name: "viewprev_have_client",
    args: namedArg("synctag", "bool-flag", "Sync Across Monitors", "Apply to all monitors (0/1)", {
      options: [...BOOL_FLAGS],
    }),
  },
];
