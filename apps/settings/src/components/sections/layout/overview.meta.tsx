import { Grid3x3Icon } from "lucide-react";
import type { SectionMeta } from "@/lib/section-types";
import { OverviewPanel } from "./OverviewPanel";

export const overviewMeta: SectionMeta = {
  id: "overview",
  label: "Overview",
  icon: <Grid3x3Icon />,
  panel: OverviewPanel,
  parentId: "layout",
  keywords: [
    "overview",
    "hotarea",
    "corner",
    "grid",
    "tab",
    "gap",
    "overview gap",
    "switcher",
  ],
  fields: [
    {
      configKey: "enable_hotarea",
      label: "Enable Hotarea",
      description: "Activate overview by moving the cursor to a screen corner",
      aliases: ["hot corner", "corner action", "overview hot corner"],
    },
    {
      configKey: "hotarea_size",
      label: "Hotarea Size",
      description: "Size of the corner activation zone in pixels (1–1000)",
      aliases: ["corner size", "activation zone", "hot corner size"],
    },
    {
      configKey: "hotarea_corner",
      label: "Hotarea Corner",
      description: "Which screen corner triggers the overview (0–3)",
      aliases: ["corner", "hot corner position", "activation corner"],
    },
    {
      configKey: "ov_tab_mode",
      label: "Tab Mode",
      description: "Show window tabs in the overview grid",
      aliases: ["overview tabs", "window tabs", "tab overview"],
    },
    {
      configKey: "overviewgappi",
      label: "Inner Gap",
      description: "Gap between windows inside the overview grid (0–1000)",
      aliases: ["overview inner gap", "grid gap", "overview spacing"],
    },
    {
      configKey: "overviewgappo",
      label: "Outer Gap",
      description: "Gap between the overview grid and screen edges (0–1000)",
      aliases: ["overview outer gap", "grid margin", "overview margin"],
    },
  ],
};
