import { LayersIcon } from "lucide-react";
import type { SectionMeta } from "@/lib/presentation/section-types";
import { ScratchpadPanel } from "./ScratchpadPanel";

export const scratchpadMeta: SectionMeta = {
  id: "scratchpad",
  label: "Scratchpad",
  icon: <LayersIcon />,
  panel: ScratchpadPanel,
  parentId: "behaviour",
  keywords: ["scratchpad", "monitor"],
  fields: [
    {
      configKey: "scratchpad_cross_monitor",
    },
    {
      configKey: "single_scratchpad",
    },
    {
      configKey: "scratchpad_width_ratio",
    },
    {
      configKey: "scratchpad_height_ratio",
    },
  ],
};
