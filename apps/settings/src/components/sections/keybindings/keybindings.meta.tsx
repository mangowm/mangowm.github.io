import { KeyboardIcon } from "lucide-react";
import type { SectionMeta } from "@/lib/section-types";
import { KeybindingsPanel } from "./KeybindingsPanel";

export const keybindingsMeta: SectionMeta = {
  id: "keybindings",
  label: "Keybindings",
  icon: <KeyboardIcon />,
  panel: KeybindingsPanel,
  keywords: [
    "keybind",
    "shortcut",
    "binding",
    "bind",
    "keysym",
    "keycode",
    "submap",
    "keymode",
    "dispatch",
    "hotkey",
  ],
  fields: [],
};
