import { PowerIcon } from "lucide-react";
import type { SectionMeta } from "@/lib/presentation/section-types";
import { IdlePanel } from "./IdlePanel";

export const idleMeta: SectionMeta = {
  id: "idle",
  label: "Idle",
  icon: <PowerIcon />,
  panel: IdlePanel,
  parentId: "behaviour",
  keywords: [
    "idle",
    "inhibit",
    "dpms",
    "power",
    "screen",
    "blank",
    "cursor",
    "hide",
    "timeout",
    "keypress",
  ],
  fields: [
    {
      configKey: "idle_inhibit_ignore_visible",
      aliases: ["inhibit", "idle", "dpms", "screen blank", "power save"],
    },
    {
      configKey: "cursor_hide_timeout",
      aliases: ["hide cursor", "cursor auto-hide", "cursor timeout"],
    },
    {
      configKey: "cursor_hide_on_keypress",
      aliases: ["keypress hide", "hide on keypress", "typing hide"],
    },
  ],
};
