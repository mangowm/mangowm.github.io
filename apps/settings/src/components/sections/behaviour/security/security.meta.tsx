import { ShieldCheckIcon } from "lucide-react";
import type { SectionMeta } from "@/lib/section-types";
import { SecurityPanel } from "./SecurityPanel";

export const securityMeta: SectionMeta = {
  id: "security",
  label: "Security",
  icon: <ShieldCheckIcon />,
  panel: SecurityPanel,
  parentId: "behaviour",
  keywords: ["shortcuts", "inhibit", "lock", "transparent", "keyboard", "grab", "security"],
  fields: [
    {
      configKey: "allow_shortcuts_inhibit",
      label: "Allow Shortcuts Inhibit",
      description: "Let apps suspend compositor keybindings",
      aliases: ["inhibit shortcuts", "grab", "keyboard grab", "protocol"],
    },
    {
      configKey: "allow_lock_transparent",
      label: "Allow Lock Transparent",
      description: "Permit transparent/translucent lockscreens",
      aliases: ["transparent lock", "lockscreen transparency", "lockscreen"],
    },
  ],
};
