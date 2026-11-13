import { Grid3x3Icon } from "lucide-react";
import type { SectionMeta } from "@/lib/presentation/section-types";
import { OverviewPanel } from "./OverviewPanel";

export const overviewMeta: SectionMeta = {
  id: "overview",
  label: "Overview",
  icon: <Grid3x3Icon />,
  panel: OverviewPanel,
  parentId: "layout",
  keywords: ["overview", "hotarea", "corner", "grid", "tab", "gap", "overview gap", "switcher"],
  fields: [
    {
      configKey: "enable_hotarea",
    },
    {
      configKey: "hotarea_size",
    },
    {
      configKey: "hotarea_corner",
    },
    {
      configKey: "overview_gap_inner",
    },
    {
      configKey: "overview_gap_outer",
    },
  ],
};
