import { EllipsisIcon } from "lucide-react";
import type { SectionMeta } from "@/lib/section-types";
import { MiscellaneousPanel } from "./MiscellaneousPanel";

export const miscellaneousMeta: SectionMeta = {
  id: "miscellaneous",
  label: "Miscellaneous",
  icon: <EllipsisIcon />,
  panel: MiscellaneousPanel,
  parentId: "window-behaviour",
  keywords: [
    "idle",
    "inhibit",
    "shortcuts",
    "lock",
    "transparent",
    "tearing",
    "tear",
    "vsync",
    "power",
    "security",
    "performance",
    "misc",
  ],
  fields: [
    {
      configKey: "idleinhibit_ignore_visible",
      label: "Idle Inhibit Ignore Visible",
      description: "Only fullscreen windows may inhibit the idle inhibitor",
      aliases: ["inhibit", "idle", "dpms", "screen blank"],
    },
    {
      configKey: "allow_shortcuts_inhibit",
      label: "Allow Shortcuts Inhibit",
      description: "Let apps suspend compositor keybindings",
      aliases: ["inhibit shortcuts", "grab", "keyboard grab"],
    },
    {
      configKey: "allow_lock_transparent",
      label: "Allow Lock Transparent",
      description: "Permit transparent/translucent lockscreens",
      aliases: ["transparent lock", "lockscreen transparency"],
    },
    {
      configKey: "allow_tearing",
      label: "Allow Tearing",
      description: "Permit screen tearing for lower latency",
      aliases: ["tearing", "tear", "vsync", "async"],
    },
  ],
};
