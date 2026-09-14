import type { DispatcherInfo } from "../types";
import { namedArg } from "../helpers";
import { TAG_NUMBERS, BOOL_FLAGS } from "../types";

export const VIEW_ENTRIES: DispatcherInfo[] = [
  {
    name: "view",
    category: "view",
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
    description:
      "Switch to a tag by number (1-9), mask (e.g. 1|3|5), or special values (-1=previous, 0=all). Optional synctag flag",
  },
  {
    name: "viewtoleft",
    category: "view",
    args: namedArg("synctag", "bool-flag", "Sync Across Monitors", "Apply to all monitors (0/1)", {
      options: [...BOOL_FLAGS],
    }),
    description: "View the previous tag. Optional synctag flag (0/1) syncs across monitors",
  },
  {
    name: "viewtoright",
    category: "view",
    args: namedArg("synctag", "bool-flag", "Sync Across Monitors", "Apply to all monitors (0/1)", {
      options: [...BOOL_FLAGS],
    }),
    description: "View the next tag. Optional synctag flag (0/1) syncs across monitors",
  },
  {
    name: "viewtoleft_have_client",
    category: "view",
    args: namedArg("synctag", "bool-flag", "Sync Across Monitors", "Apply to all monitors (0/1)", {
      options: [...BOOL_FLAGS],
    }),
    description:
      "View the previous tag and focus a client if one is present. Optional synctag flag",
  },
  {
    name: "viewtoright_have_client",
    category: "view",
    args: namedArg("synctag", "bool-flag", "Sync Across Monitors", "Apply to all monitors (0/1)", {
      options: [...BOOL_FLAGS],
    }),
    description: "View the next tag and focus a client if one is present. Optional synctag flag",
  },
  {
    name: "viewcrossmon",
    category: "view",
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
    description: "View the specified tag on the specified monitor",
  },
  {
    name: "toggleview",
    category: "view",
    args: namedArg("tag", "tag", "Toggle Tag", "Tag whose visibility to toggle (1-9)", {
      options: [...TAG_NUMBERS],
      required: true,
    }),
    description: "Toggle a tag's visibility (1-9) in the current view",
  },
  {
    name: "comboview",
    category: "view",
    args: namedArg("tag", "tag", "Combo Tag", "Tag number (1-9) for combo-key navigation", {
      options: [...TAG_NUMBERS],
      required: true,
    }),
    description: "View multiple tags pressed simultaneously (combo-key style navigation)",
  },
];
