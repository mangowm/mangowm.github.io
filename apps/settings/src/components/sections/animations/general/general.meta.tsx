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
    },
    {
      configKey: "layer_animations",
    },
    {
      configKey: "animation_fade_in",
    },
    {
      configKey: "animation_fade_out",
    },
    {
      configKey: "animation_type_open",
    },
    {
      configKey: "animation_type_close",
    },
    {
      configKey: "layer_animation_type_open",
    },
    {
      configKey: "layer_animation_type_close",
    },
    {
      configKey: "tag_animation_direction",
    },
    {
      configKey: "zoom_initial_ratio",
    },
    {
      configKey: "zoom_end_ratio",
    },
    {
      configKey: "fade_in_begin_opacity",
    },
    {
      configKey: "fade_out_begin_opacity",
    },
  ],
};
