import type { DispatcherUi } from "../types";

export const SCRATCHPAD_ENTRIES: DispatcherUi[] = [
  {
    name: "minimized",
    args: [],
  },
  {
    name: "restore_minimized",
    args: [],
  },
  {
    name: "toggle_scratchpad",
    args: [],
  },
  {
    name: "toggle_named_scratchpad",
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
  },
];
