import { Grid3x3 } from "lucide-react";

import type { SectionMeta } from "@/lib/presentation/section-types";
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
    },
    {
      configKey: "gap_inner_horizontal",
    },
    {
      configKey: "gap_inner_vertical",
    },
    {
      configKey: "gap_outer_horizontal",
    },
    {
      configKey: "gap_outer_vertical",
    },
    {
      configKey: "border_px",
    },
    {
      configKey: "no_border_when_single",
    },
    {
      configKey: "no_radius_when_single",
    },
  ],
};
