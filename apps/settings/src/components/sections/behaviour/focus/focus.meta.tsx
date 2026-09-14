import { FocusIcon } from "lucide-react";
import type { SectionMeta } from "@/lib/section-types";
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
      configKey: "sloppyfocus",
      label: "Sloppy Focus",
      description: "Focus follows the mouse pointer",
      aliases: ["focus follows mouse", "mouse focus"],
    },
    {
      configKey: "warpcursor",
      label: "Warp Cursor",
      description: "Auto-move cursor to center of focused window",
      aliases: ["cursor warp", "jump cursor"],
    },
    {
      configKey: "focus_on_activate",
      label: "Focus on Activate",
      description: "Focus windows immediately when they request activation",
      aliases: ["urgency focus", "activate", "demand attention"],
    },
    {
      configKey: "focus_cross_monitor",
      label: "Cross-Monitor Focus",
      description: "Allow focus operations to move between monitors",
      aliases: ["multi-monitor focus", "across monitors"],
    },
    {
      configKey: "focus_cross_tag",
      label: "Cross-Tag Focus",
      description: "Allow focus to move between windows on different tags",
      aliases: ["across tags", "tag crossing"],
    },
    {
      configKey: "exchange_cross_monitor",
      label: "Cross-Monitor Exchange",
      description: "Allow swapping windows between monitors",
      aliases: ["swap across monitors", "exchange"],
    },
  ],
};
