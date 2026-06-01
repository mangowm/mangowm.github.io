import { PanelLeftIcon } from "lucide-react";
import type { SectionMeta } from "@/lib/section-types";
import { TilingPanel } from "./TilingPanel";

export const tilingMeta: SectionMeta = {
  id: "tiling",
  label: "Tiling",
  icon: <PanelLeftIcon />,
  panel: TilingPanel,
  parentId: "layout",
  keywords: ["master", "stack", "factor", "placement"],
  fields: [
    { configKey: "new_is_master",               label: "New Windows as Master",    description: "New windows open in the master area instead of the stack" },
    { configKey: "default_mfact",               label: "Master Area Factor",       description: "Proportion of screen width allocated to the master area" },
    { configKey: "default_nmaster",              label: "Number of Masters",        description: "How many windows are kept in the master area" },
    { configKey: "center_master_overspread",     label: "Center Master Overspread", description: "Center the master window when it overspreads" },
    { configKey: "center_when_single_stack",     label: "Center Single Stack",      description: "Center the single window in the stack area" },
  ],
};
