import { ClockIcon } from "lucide-react";
import type { SectionMeta } from "@/lib/section-types";
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
      label: "Move Duration",
      description: "Duration of window move/resize animations in milliseconds (1–50000)",
      aliases: ["move speed", "move time", "move ms"],
    },
    {
      configKey: "animation_duration_open",
      label: "Open Duration",
      description: "Duration of window open animations in milliseconds (1–50000)",
      aliases: ["open speed", "open time", "open ms"],
    },
    {
      configKey: "animation_duration_close",
      label: "Close Duration",
      description: "Duration of window close animations in milliseconds (1–50000)",
      aliases: ["close speed", "close time", "close ms"],
    },
    {
      configKey: "animation_duration_tag",
      label: "Tag Switch Duration",
      description: "Duration of tag-switch (workspace) animations in milliseconds (1–50000)",
      aliases: ["tag speed", "tag time", "tag ms", "workspace switch"],
    },
    {
      configKey: "animation_duration_focus",
      label: "Focus Duration",
      description: "Duration of focus-change animations in milliseconds (1–50000)",
      aliases: ["focus speed", "focus time", "focus ms"],
    },
  ],
};
