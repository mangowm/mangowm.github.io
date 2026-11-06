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
      aliases: ["scratchpad across monitors"],
    },
    {
      configKey: "single_scratchpad",
      aliases: ["scratchpad single"],
    },
    {
      configKey: "scratchpad_width_ratio",
      aliases: ["scratchpad width", "scratchpad size"],
    },
    {
      configKey: "scratchpad_height_ratio",
      aliases: ["scratchpad height", "scratchpad size"],
    },
  ],
};
