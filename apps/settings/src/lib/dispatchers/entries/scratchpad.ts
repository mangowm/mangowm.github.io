import type { DispatcherInfo } from "../types";

export const SCRATCHPAD_ENTRIES: DispatcherInfo[] = [
  {
    name: "minimized",
    category: "scratchpad",
    args: [],
    description: "Minimize window to scratchpad",
  },
  {
    name: "restore_minimized",
    category: "scratchpad",
    args: [],
    description: "Restore the most recently minimized window from scratchpad",
  },
  {
    name: "toggle_scratchpad",
    category: "scratchpad",
    args: [],
    description: "Toggle the global scratchpad window",
  },
  {
    name: "toggle_named_scratchpad",
    category: "scratchpad",
    args: [
      {
        name: "id",
        type: "string",
        label: "Identifier",
        description: "Unique scratchpad ID",
        placeholder: "e.g. term-scratch",
        required: true,
      },
      {
        name: "title",
        type: "string",
        label: "Window Title",
        description: "Match window by title (optional)",
        placeholder: "e.g. Terminal",
      },
      {
        name: "spawn",
        type: "command",
        label: "Command",
        description: "Launch this command if no window matches",
        placeholder: "e.g. foot",
      },
    ],
    description:
      "Toggle a named scratchpad — launches app if not running, otherwise shows/hides it",
  },
];
