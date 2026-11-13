import { Blend } from "lucide-react";
import type { SectionMeta } from "@/lib/presentation/section-types";
import { WindowEffectsPanel } from "./WindowEffectsPanel";

export const windowEffectsMeta: SectionMeta = {
  id: "window-effects",
  label: "Window Effects",
  icon: <Blend />,
  parentId: "appearance",
  panel: WindowEffectsPanel,
  keywords: ["blur", "shadows", "opacity", "transparency", "radius", "corners", "visual", "glass"],
  fields: [
    {
      configKey: "blur",
    },
    {
      configKey: "blur_layer",
    },
    {
      configKey: "blur_optimized",
    },
    {
      configKey: "blur_params_num_passes",
    },
    {
      configKey: "blur_params_radius",
    },
    {
      configKey: "blur_params_noise",
    },
    {
      configKey: "blur_params_brightness",
    },
    {
      configKey: "blur_params_contrast",
    },
    {
      configKey: "blur_params_saturation",
    },
    {
      configKey: "border_radius",
    },
    {
      configKey: "focused_opacity",
    },
    {
      configKey: "unfocused_opacity",
    },
    {
      configKey: "shadows",
    },
    {
      configKey: "shadow_only_floating",
    },
    {
      configKey: "layer_shadows",
    },
    {
      configKey: "shadows_size",
    },
    {
      configKey: "shadows_blur",
    },
    {
      configKey: "shadows_position_x",
    },
    {
      configKey: "shadows_position_y",
    },
  ],
};
