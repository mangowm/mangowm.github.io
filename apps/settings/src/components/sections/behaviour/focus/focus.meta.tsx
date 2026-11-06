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
      aliases: ["focus follows mouse", "mouse focus"],
    },
    {
      configKey: "warp_cursor",
      aliases: ["cursor warp", "jump cursor"],
    },
    {
      configKey: "focus_on_activate",
      aliases: ["urgency focus", "activate", "demand attention"],
    },
    {
      configKey: "focus_cross_monitor",
      aliases: ["multi-monitor focus", "across monitors"],
    },
    {
      configKey: "focus_cross_tag",
      aliases: ["across tags", "tag crossing"],
    },
    {
      configKey: "exchange_cross_monitor",
      aliases: ["swap across monitors", "exchange"],
    },
  ],
};
