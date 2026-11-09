import { ListIcon } from "lucide-react";
import type { SectionMeta } from "@/lib/presentation/section-types";
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
      aliases: ["animate", "animation master", "toggle animations"],
    },
    {
      configKey: "layer_animations",
      aliases: ["layer animate", "panel animations", "notification animations"],
    },
    {
      configKey: "animation_fade_in",
      aliases: ["fade on open", "fade appear"],
    },
    {
      configKey: "animation_fade_out",
      aliases: ["fade on close", "fade disappear"],
    },
    {
      configKey: "animation_type_open",
      aliases: ["open animation", "window open", "appear animation"],
    },
    {
      configKey: "animation_type_close",
      aliases: ["close animation", "window close", "disappear animation"],
    },
    {
      configKey: "layer_animation_type_open",
      aliases: ["layer open", "panel appear", "notification open"],
    },
    {
      configKey: "layer_animation_type_close",
      aliases: ["layer close", "panel disappear", "notification close"],
    },
    {
      configKey: "tag_animation_direction",
      aliases: ["tag switch", "tag direction", "tag switch"],
    },
    {
      configKey: "zoom_initial_ratio",
      aliases: ["zoom start", "zoom begin", "initial zoom"],
    },
    {
      configKey: "zoom_end_ratio",
      aliases: ["zoom finish", "zoom target", "final zoom"],
    },
    {
      configKey: "fade_in_begin_opacity",
      aliases: ["fade in begin", "fade start", "opacity start"],
    },
    {
      configKey: "fade_out_begin_opacity",
      aliases: ["fade out begin", "fade end", "opacity end"],
    },
  ],
};
