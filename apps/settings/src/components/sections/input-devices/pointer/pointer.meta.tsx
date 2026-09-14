import { MousePointer2Icon } from "lucide-react";
import type { SectionMeta } from "@/lib/section-types";
import { PointerPanel } from "./PointerPanel";

export const pointerMeta: SectionMeta = {
  id: "pointer",
  label: "Pointer / Mouse",
  icon: <MousePointer2Icon />,
  panel: PointerPanel,
  parentId: "input-devices",
  keywords: [
    "mouse",
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
    {
      configKey: "mouse_natural_scrolling",
      label: "Natural Scrolling",
      description: "Reverse scroll direction for mouse",
    },
    {
      configKey: "axis_scroll_factor",
      label: "Axis Scroll Factor",
      description: "Multiplier for axis (wheel) scroll speed (0.1–10.0)",
    },
    {
      configKey: "scroll_method",
      label: "Scroll Method",
      description: "Trackpad scroll method — Two-Finger, Edge, or On-Button-Down (0–4)",
    },
    {
      configKey: "scroll_button",
      label: "Scroll Button",
      description: "Button used for on-button-down scrolling (272–279)",
    },
    {
      configKey: "mouse_accel_profile",
      label: "Acceleration Profile",
      description: "Mouse acceleration profile — Flat, Adaptive, or Custom",
    },
    {
      configKey: "mouse_accel_speed",
      label: "Acceleration Speed",
      description: "Mouse acceleration speed (-1.0 to 1.0)",
    },
    {
      configKey: "click_method",
      label: "Click Method",
      description: "How clicks are detected — None, Clickfinger, or Button Areas",
    },
    {
      configKey: "send_events_mode",
      label: "Send Events Mode",
      description: "When to send pointer events to the compositor (0–2)",
    },
    {
      configKey: "disable_while_typing",
      label: "Disable While Typing",
      description: "Temporarily disable the touchpad while typing",
    },
    {
      configKey: "left_handed",
      label: "Left Handed",
      description: "Swap left and right mouse buttons",
    },
    {
      configKey: "middle_button_emulation",
      label: "Middle Button Emulation",
      description: "Emulate middle-click by pressing left+right simultaneously",
    },
    {
      configKey: "axis_bind_apply_timeout",
      label: "Axis Bind Apply Timeout",
      description: "Milliseconds before a scroll axis binding fires (0–1000)",
      aliases: ["scroll bind", "axis bind", "scroll timeout"],
    },
  ],
};
