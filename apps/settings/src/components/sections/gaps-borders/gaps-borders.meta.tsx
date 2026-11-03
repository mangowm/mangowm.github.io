import { Grid3x3 } from "lucide-react";

import type { SectionMeta } from "@/lib/section-types";
import { GapsBordersPanel } from "./GapsBordersPanel";

export const gapsBordersMeta: SectionMeta = {
  id: "gaps-borders",
  label: "Gaps & Borders",
  icon: <Grid3x3 />,
  panel: GapsBordersPanel,
  parentId: "appearance",
  keywords: ["spacing", "padding", "margin", "inner", "outer", "border"],
  fields: [
    {
      configKey: "smart_gaps",
      label: "Smart Gaps",
      description: "Only show gaps with multiple windows on the same tag",
    },
    {
      configKey: "gap_inner_horizontal",
      label: "Inner Gap Horizontal",
      description: "Horizontal gap between tiled windows",
    },
    {
      configKey: "gap_inner_vertical",
      label: "Inner Gap Vertical",
      description: "Vertical gap between tiled windows",
    },
    {
      configKey: "gap_outer_horizontal",
      label: "Outer Gap Horizontal",
      description: "Horizontal gap between windows and screen edges",
    },
    {
      configKey: "gap_outer_vertical",
      label: "Outer Gap Vertical",
      description: "Vertical gap between windows and screen edges",
    },
    {
      configKey: "border_px",
      label: "Border Width",
      description: "Thickness of window borders in pixels",
    },
    {
      configKey: "no_border_when_single",
      label: "Hide Border When Solo",
      description: "Remove borders when only one window is visible",
    },
    {
      configKey: "no_radius_when_single",
      label: "Hide Radius When Solo",
      description: "Remove corner radius when only one window is visible",
    },
  ],
};
