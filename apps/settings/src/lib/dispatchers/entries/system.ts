import type { DispatcherUi } from "../types";
import { namedArg, oneArg } from "../helpers";
import { BOOL_FLAGS, SWITCHER_OPTS } from "../types";

export const SYSTEM_ENTRIES: DispatcherUi[] = [
  {
    name: "reload_config",
    args: [],
  },
  { name: "quit", args: [] },
  {
    name: "load_config_file",
    args: namedArg("path", "string", "Config Path", "Absolute path to the config file to load", {
      placeholder: "/home/user/.config/mango/alt.conf",
      required: true,
    }),
  },
  {
    name: "toggleoverview",
    args: namedArg("tabmode", "bool-flag", "Tab Mode", "1 = tab overview, 0 = grid overview", {
      options: [...BOOL_FLAGS],
    }),
  },
  {
    name: "create_virtual_output",
    args: namedArg("name", "string", "Name", "Virtual output name", {
      placeholder: "e.g. HEADLESS-1",
      required: true,
    }),
  },
  {
    name: "destroy_all_virtual_output",
    args: [],
  },
  {
    name: "toggle_trackpad_enable",
    args: [],
  },
  {
    name: "setkeymode",
    args: namedArg("mode", "string", "Mode Name", "Target keybinding mode (submap)", {
      placeholder: "resize",
      required: true,
    }),
  },
  {
    name: "switch_keyboard_layout",
    args: namedArg("index", "uint", "Layout Index", "Keyboard layout index (0, 1, 2…)", {
      min: 0,
      max: 100,
      placeholder: "0",
    }),
  },
  {
    name: "setoption",
    args: [
      {
        name: "key",
        type: "string",
        label: "Option Key",
        description: "Config key to change",
        placeholder: "gappih",
        required: true,
      },
      {
        name: "value",
        type: "string",
        label: "Value",
        description: "New value",
        placeholder: "10",
        required: true,
      },
    ],
  },
  {
    name: "chvt",
    args: namedArg("vt", "uint", "VT Number", "Virtual terminal number", {
      min: 1,
      max: 12,
      placeholder: "2",
      required: true,
    }),
  },
  {
    name: "enteroverview",
    args: [],
  },
  {
    name: "leaveoverview",
    args: [],
  },
  {
    name: "switcher",
    args: oneArg("switcher", "Direction", "Switcher direction", {
      options: [...SWITCHER_OPTS],
    }),
  },
];
