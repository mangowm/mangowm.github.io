import { PanelLeftIcon } from "lucide-react";
import type { SectionMeta } from "@/lib/presentation/section-types";
import { TilingPanel } from "./TilingPanel";

export const tilingMeta: SectionMeta = {
  id: "tiling",
  label: "Tiling",
  icon: <PanelLeftIcon />,
  panel: TilingPanel,
  parentId: "layout",
  keywords: ["master", "stack", "factor", "placement"],
  fields: [
    {
      configKey: "new_is_master",
    },
    {
      configKey: "default_master_factor",
    },
    {
      configKey: "default_master_count",
    },
    {
      configKey: "center_master_overspread",
    },
    {
      configKey: "center_when_single_stack",
    },
  ],
};
