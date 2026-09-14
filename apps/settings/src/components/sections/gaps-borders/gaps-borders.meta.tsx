import { Grid3x3 } from "lucide-react";
import type { SectionMeta } from "@/lib/section-types";
import { GapsBordersPanel } from "./GapsBordersPanel";

export const gapsBordersMeta: SectionMeta = {
  id: "gaps-borders",
  label: "Gaps & Borders",
  icon: <Grid3x3 />,
  panel: GapsBordersPanel,
  parentId: "appearance",
  keywords: ["spacing", "padding", "margin", "inner", "outer"],
  fields: [
    {
      configKey: "smartgaps",
      label: "Smart Gaps",
      description: "Only show gaps with multiple windows on the same tag",
    },
    {
      configKey: "gappih",
      label: "Inner Gap Horizontal",
      description: "Horizontal gap between tiled windows",
    },
    {
      configKey: "gappiv",
      label: "Inner Gap Vertical",
      description: "Vertical gap between tiled windows",
    },
    {
      configKey: "gappoh",
      label: "Outer Gap Horizontal",
      description: "Horizontal gap between windows and screen edges",
    },
    {
      configKey: "gappov",
      label: "Outer Gap Vertical",
      description: "Vertical gap between windows and screen edges",
    },
    {
      configKey: "borderpx",
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
