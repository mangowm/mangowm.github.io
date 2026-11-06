import { HandIcon } from "lucide-react";
import type { SectionMeta } from "@/lib/presentation/section-types";
import { TrackpadPanel } from "./TrackpadPanel";

export const trackpadMeta: SectionMeta = {
  id: "trackpad",
  label: "Trackpad",
  icon: <HandIcon />,
  panel: TrackpadPanel,
  parentId: "input-devices",
  keywords: ["touchpad", "scrolling", "tap", "click", "drag", "button map", "palm", "disable"],
  fields: [
    {
      configKey: "trackpad_natural_scrolling",
    },
    {
      configKey: "trackpad_accel_profile",
    },
    {
      configKey: "trackpad_accel_speed",
    },
    {
      configKey: "trackpad_scroll_factor",
    },
    {
      configKey: "disable_trackpad",
    },
    {
      configKey: "tap_to_click",
    },
    {
      configKey: "tap_and_drag",
    },
    {
      configKey: "drag_lock",
    },
    {
      configKey: "button_map",
    },
    {
      configKey: "swipe_min_threshold",
      aliases: ["swipe", "gesture threshold", "swipe sensitivity"],
    },
  ],
};
