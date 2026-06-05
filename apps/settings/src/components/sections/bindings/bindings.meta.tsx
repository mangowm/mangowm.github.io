import { Workflow } from "lucide-react";
import type { SectionMeta } from "@/lib/section-types";
import { BindingsPanel } from "./BindingsPanel";

export const bindingsMeta: SectionMeta = {
  id: "bindings",
  label: "Bindings",
  icon: <Workflow />,
  panel: BindingsPanel,
  keywords: [
    "keybind",
    "shortcut",
    "binding",
    "bind",
    "mousebind",
    "axisbind",
    "switchbind",
    "gesturebind",
    "keysym",
    "keycode",
    "submap",
    "keymode",
    "dispatch",
    "hotkey",
  ],
  fields: [],
};
