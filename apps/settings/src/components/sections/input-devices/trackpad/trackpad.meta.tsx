import { HandIcon } from "lucide-react";
import type { SectionMeta } from "@/lib/section-types";
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
      label: "Natural Scrolling",
      description: "Reverse scroll direction for the trackpad",
    },
    {
      configKey: "trackpad_accel_profile",
      label: "Acceleration Profile",
      description: "Trackpad acceleration profile — Flat, Adaptive, or Custom",
    },
    {
      configKey: "trackpad_accel_speed",
      label: "Acceleration Speed",
      description: "Trackpad acceleration speed (-1.0 to 1.0)",
    },
    {
      configKey: "trackpad_scroll_factor",
      label: "Scroll Factor",
      description: "Multiplier for trackpad scroll speed (0.1–10.0)",
    },
    {
      configKey: "disable_trackpad",
      label: "Disable Trackpad",
      description: "Disable the built-in trackpad entirely",
    },
    {
      configKey: "tap_to_click",
      label: "Tap to Click",
      description: "Enable tap-to-click on the trackpad",
    },
    {
      configKey: "tap_and_drag",
      label: "Tap and Drag",
      description: "Enable tap-and-drag gesture",
    },
    {
      configKey: "drag_lock",
      label: "Drag Lock",
      description: "Lift finger without cancelling the drag",
    },
    {
      configKey: "button_map",
      label: "Button Map",
      description: "Tap gesture button mapping — LMR or LRM",
    },
    {
      configKey: "swipe_min_threshold",
      label: "Swipe Minimum Threshold",
      description: "Minimum distance in pixels to trigger a swipe gesture (1–1000)",
      aliases: ["swipe", "gesture threshold", "swipe sensitivity"],
    },
  ],
};
