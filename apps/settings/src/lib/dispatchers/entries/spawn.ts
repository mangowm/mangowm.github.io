import type { DispatcherInfo } from "../types";
import { namedArg } from "../helpers";
import { TAG_NUMBERS } from "../types";

export const SPAWN_ENTRIES: DispatcherInfo[] = [
  {
    name: "spawn",
    category: "spawn",
    args: namedArg("command", "command", "Command", "Command to execute", {
      placeholder: "foot --class myclass",
      required: true,
    }),
    description: "Execute a command (args are joined with spaces)",
  },
  {
    name: "spawn_shell",
    category: "spawn",
    args: namedArg("command", "command", "Command", "Shell command", {
      placeholder: "sh -c 'notify-send Hello'",
      required: true,
    }),
    description: "Execute a shell command, supports pipes and shell operators (|, &&, ;)",
  },
  {
    name: "spawn_on_empty",
    category: "spawn",
    args: [
      {
        name: "command",
        type: "command",
        label: "Command",
        description: "Command to spawn",
        placeholder: "foot",
        required: true,
      },
      {
        name: "tag",
        type: "tag",
        label: "Target Tag",
        description: "Only spawn if tag is empty (1-9)",
        options: [...TAG_NUMBERS],
        required: true,
      },
    ],
    description: "Execute a command only if the specified tag (1-9) is empty",
  },
];
