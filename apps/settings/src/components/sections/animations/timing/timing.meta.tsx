import { ClockIcon } from "lucide-react";
import type { SectionMeta } from "@/lib/presentation/section-types";
import { TimingPanel } from "./TimingPanel";

export const timingMeta: SectionMeta = {
  id: "animations-timing",
  label: "Timing",
  icon: <ClockIcon />,
  panel: TimingPanel,
  parentId: "animations",
  keywords: [
    "duration",
    "speed",
    "milliseconds",
    "move",
    "open",
    "close",
    "tag",
    "focus",
    "timing",
    "slow",
    "fast",
    "delay",
  ],
  fields: [
    {
      configKey: "animation_duration_move",
    },
    {
      configKey: "animation_duration_open",
    },
    {
      configKey: "animation_duration_close",
    },
    {
      configKey: "animation_duration_tag",
    },
    {
      configKey: "animation_duration_focus",
    },
  ],
};
