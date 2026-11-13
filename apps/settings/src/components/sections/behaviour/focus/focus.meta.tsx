import { FocusIcon } from "lucide-react";
import type { SectionMeta } from "@/lib/presentation/section-types";
import { FocusPanel } from "./FocusPanel";

export const focusMeta: SectionMeta = {
  id: "focus",
  label: "Focus",
  icon: <FocusIcon />,
  panel: FocusPanel,
  parentId: "behaviour",
  keywords: [
    "sloppy",
    "warp",
    "cursor",
    "activate",
    "urgency",
    "monitor",
    "tag",
    "cross",
    "exchange",
    "swap",
  ],
  fields: [
    {
      configKey: "sloppy_focus",
    },
    {
      configKey: "warp_cursor",
    },
    {
      configKey: "focus_on_activate",
    },
    {
      configKey: "focus_cross_monitor",
    },
    {
      configKey: "focus_cross_tag",
    },
    {
      configKey: "exchange_cross_monitor",
    },
  ],
};
