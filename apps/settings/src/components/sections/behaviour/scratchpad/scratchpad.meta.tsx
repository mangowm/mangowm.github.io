import { LayersIcon } from "lucide-react";
import type { SectionMeta } from "@/lib/section-types";
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
      label: "Scratchpad Cross-Monitor",
      description: "Show scratchpad windows on any monitor",
      aliases: ["scratchpad across monitors"],
    },
    {
      configKey: "single_scratchpad",
      label: "Single Scratchpad",
      description: "Only one scratchpad window at a time",
      aliases: ["scratchpad single"],
    },
    {
      configKey: "scratchpad_width_ratio",
      label: "Scratchpad Width Ratio",
      description: "Width of the scratchpad window relative to the monitor (0.1–1.0)",
      aliases: ["scratchpad width", "scratchpad size"],
    },
    {
      configKey: "scratchpad_height_ratio",
      label: "Scratchpad Height Ratio",
      description: "Height of the scratchpad window relative to the monitor (0.1–1.0)",
      aliases: ["scratchpad height", "scratchpad size"],
    },
  ],
};
