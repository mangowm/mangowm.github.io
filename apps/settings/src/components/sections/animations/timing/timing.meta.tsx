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
      aliases: ["move speed", "move time", "move ms"],
    },
    {
      configKey: "animation_duration_open",
      aliases: ["open speed", "open time", "open ms"],
    },
    {
      configKey: "animation_duration_close",
      aliases: ["close speed", "close time", "close ms"],
    },
    {
      configKey: "animation_duration_tag",
      aliases: ["tag speed", "tag time", "tag ms", "workspace switch"],
    },
    {
      configKey: "animation_duration_focus",
      aliases: ["focus speed", "focus time", "focus ms"],
    },
  ],
};
