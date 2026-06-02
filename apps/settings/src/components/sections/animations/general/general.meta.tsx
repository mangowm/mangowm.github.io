import { ListIcon } from "lucide-react";
import type { SectionMeta } from "@/lib/section-types";
import { GeneralPanel } from "./GeneralPanel";

export const generalMeta: SectionMeta = {
  id: "animations-general",
  label: "General",
  icon: <ListIcon />,
  panel: GeneralPanel,
  parentId: "animations",
  keywords: [
    "master toggle",
    "animation type",
    "open",
    "close",
    "layer",
    "fade in",
    "fade out",
    "zoom ratio",
    "opacity",
    "tag direction",
    "horizontal",
    "vertical",
  ],
  fields: [
    {
      configKey: "animations",
      label: "Enable Animations",
      description: "Master toggle for all window animations",
      aliases: ["animate", "animation master", "toggle animations"],
    },
    {
      configKey: "layer_animations",
      label: "Layer Animations",
      description: "Enable animations for layer-shell surfaces (panels, notifications)",
      aliases: ["layer animate", "panel animations", "notification animations"],
    },
    {
      configKey: "animation_fade_in",
      label: "Fade In",
      description: "Fade windows in when they appear",
      aliases: ["fade on open", "fade appear"],
    },
    {
      configKey: "animation_fade_out",
      label: "Fade Out",
      description: "Fade windows out when they close",
      aliases: ["fade on close", "fade disappear"],
    },
    {
      configKey: "animation_type_open",
      label: "Open Animation Type",
      description: "Animation style when a window opens",
      aliases: ["open animation", "window open", "appear animation"],
    },
    {
      configKey: "animation_type_close",
      label: "Close Animation Type",
      description: "Animation style when a window closes",
      aliases: ["close animation", "window close", "disappear animation"],
    },
    {
      configKey: "layer_animation_type_open",
      label: "Layer Open Animation Type",
      description: "Animation style when a layer-surface opens",
      aliases: ["layer open", "panel appear", "notification open"],
    },
    {
      configKey: "layer_animation_type_close",
      label: "Layer Close Animation Type",
      description: "Animation style when a layer-surface closes",
      aliases: ["layer close", "panel disappear", "notification close"],
    },
    {
      configKey: "tag_animation_direction",
      label: "Tag Animation Direction",
      description: "Direction of tag-switch animation (horizontal or vertical)",
      aliases: ["tag switch", "tag direction", "workspace switch"],
    },
    {
      configKey: "zoom_initial_ratio",
      label: "Zoom Initial Ratio",
      description: "Starting scale for zoom animations (0.1–1.0)",
      aliases: ["zoom start", "zoom begin", "initial zoom"],
    },
    {
      configKey: "zoom_end_ratio",
      label: "Zoom End Ratio",
      description: "Ending scale for zoom animations (0.1–1.0)",
      aliases: ["zoom finish", "zoom target", "final zoom"],
    },
    {
      configKey: "fadein_begin_opacity",
      label: "Fade In Start Opacity",
      description: "Starting opacity for fade-in animations (0.0–1.0)",
      aliases: ["fade in begin", "fade start", "opacity start"],
    },
    {
      configKey: "fadeout_begin_opacity",
      label: "Fade Out Start Opacity",
      description: "Starting opacity for fade-out animations (0.0–1.0)",
      aliases: ["fade out begin", "fade end", "opacity end"],
    },
  ],
};
