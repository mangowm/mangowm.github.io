import type { DispatcherUi } from "../types";
import { namedArg, oneArg } from "../helpers";
import { BOOL_FLAGS, SWITCHER_OPTS } from "../types";

export const SYSTEM_ENTRIES: DispatcherUi[] = [
  {
    name: "reload_config",
    args: [],
    description: "Hot-reload the configuration file at runtime",
  },
  { name: "quit", args: [], description: "Exit mangowm" },
  {
    name: "load_config_file",
    args: namedArg("path", "string", "Config Path", "Absolute path to the config file to load", {
      placeholder: "/home/user/.config/mango/alt.conf",
      required: true,
    }),
    description: "Load and apply a config file by absolute path",
  },
  {
    name: "toggleoverview",
    args: namedArg("tabmode", "bool-flag", "Tab Mode", "1 = tab overview, 0 = grid overview", {
      options: [...BOOL_FLAGS],
    }),
    description: "Toggle the overview/tab mode for window switching",
  },
  {
    name: "create_virtual_output",
    args: namedArg("name", "string", "Name", "Virtual output name", {
      placeholder: "e.g. HEADLESS-1",
      required: true,
    }),
    description: "Create a headless virtual monitor (for VNC or Sunshine streaming)",
  },
  {
    name: "destroy_all_virtual_output",
    args: [],
    description: "Destroy all headless virtual monitors",
  },
  {
    name: "toggle_trackpad_enable",
    args: [],
    description: "Toggle the trackpad on and off",
  },
  {
    name: "setkeymode",
    args: namedArg("mode", "string", "Mode Name", "Target keybinding mode (submap)", {
      placeholder: "resize",
      required: true,
    }),
    description: "Switch the active keybinding mode (submap)",
  },
  {
    name: "switch_keyboard_layout",
    args: namedArg("index", "uint", "Layout Index", "Keyboard layout index (0, 1, 2…)", {
      min: 0,
      max: 100,
      placeholder: "0",
    }),
    description: "Switch the keyboard layout. Optional index (0, 1, 2…) selects a specific layout",
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
    description: "Temporarily set a configuration option at runtime (key, value)",
  },
  {
    name: "chvt",
    args: namedArg("vt", "uint", "VT Number", "Virtual terminal number", {
      min: 1,
      max: 12,
      placeholder: "2",
      required: true,
    }),
    description: "Switch to a virtual terminal by number",
  },
  {
    name: "enteroverview",
    args: [],
    description: "Enter overview mode",
  },
  {
    name: "leaveoverview",
    args: [],
    description: "Leave overview mode",
  },
  {
    name: "switcher",
    args: oneArg("switcher", "Direction", "Switcher direction", {
      options: [...SWITCHER_OPTS],
    }),
    description: "Switch between windows using the switcher",
  },
];
