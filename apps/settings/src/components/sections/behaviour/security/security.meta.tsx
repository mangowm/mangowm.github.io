import { ShieldCheckIcon } from "lucide-react";
import type { SectionMeta } from "@/lib/presentation/section-types";
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
    },
    {
      configKey: "allow_lock_transparent",
    },
  ],
};
