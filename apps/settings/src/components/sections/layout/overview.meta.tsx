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
      aliases: ["hot corner", "corner action", "overview hot corner"],
    },
    {
      configKey: "hotarea_size",
      aliases: ["corner size", "activation zone", "hot corner size"],
    },
    {
      configKey: "hotarea_corner",
      aliases: ["corner", "hot corner position", "activation corner"],
    },
    {
      configKey: "overview_gap_inner",
      aliases: ["overview inner gap", "grid gap", "overview spacing"],
    },
    {
      configKey: "overview_gap_outer",
      aliases: ["overview outer gap", "grid margin", "overview margin"],
    },
  ],
};
