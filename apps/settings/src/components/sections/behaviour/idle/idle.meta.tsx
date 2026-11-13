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
    },
    {
      configKey: "cursor_hide_timeout",
    },
    {
      configKey: "cursor_hide_on_keypress",
    },
  ],
};
