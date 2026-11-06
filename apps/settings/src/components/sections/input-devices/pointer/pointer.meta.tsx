import { MousePointer2Icon } from "lucide-react";

import type { SectionMeta } from "@/lib/presentation/section-types";
import { PointerPanel } from "./PointerPanel";

const mouseFields = [
  ["mouse_natural_scrolling", "Mouse Natural Scrolling"],
  ["mouse_accel_profile", "Mouse Acceleration Profile"],
  ["mouse_accel_speed", "Mouse Acceleration Speed"],
  ["mouse_scroll_method", "Mouse Scroll Method"],
  ["mouse_scroll_button", "Mouse Scroll Button"],
  ["mouse_click_method", "Mouse Click Method"],
  ["mouse_send_events_mode", "Mouse Send Events Mode"],
  ["mouse_left_handed", "Mouse Left Handed"],
  ["mouse_middle_button_emulation", "Mouse Middle Button Emulation"],
] as const;

const trackpadFields = [
  ["trackpad_natural_scrolling", "Trackpad Natural Scrolling"],
  ["trackpad_accel_profile", "Trackpad Acceleration Profile"],
  ["trackpad_accel_speed", "Trackpad Acceleration Speed"],
  ["trackpad_scroll_method", "Trackpad Scroll Method"],
  ["trackpad_scroll_button", "Trackpad Scroll Button"],
  ["trackpad_click_method", "Trackpad Click Method"],
  ["trackpad_send_events_mode", "Trackpad Send Events Mode"],
  ["trackpad_left_handed", "Trackpad Left Handed"],
  ["trackpad_middle_button_emulation", "Trackpad Middle Button Emulation"],
  ["trackpad_disable_while_typing", "Trackpad Disable While Typing"],
] as const;

export const pointerMeta: SectionMeta = {
  id: "pointer",
  label: "Pointer",
  icon: <MousePointer2Icon />,
  panel: PointerPanel,
  parentId: "input-devices",
  keywords: [
    "mouse",
    "trackpad",
    "pointer",
    "acceleration",
    "scrolling",
    "left-handed",
    "click",
    "scroll method",
    "scroll button",
    "click method",
    "send events",
  ],
  fields: [
    ...mouseFields.map(([configKey, label]) => ({ configKey, label, description: "" })),
    ...trackpadFields.map(([configKey, label]) => ({ configKey, label, description: "" })),
    {
      configKey: "axis_scroll_factor",
    },
    {
      configKey: "axis_bind_apply_timeout",
      aliases: ["scroll bind", "axis bind", "scroll timeout"],
    },
  ],
};
