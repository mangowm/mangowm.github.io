import { Blend } from "lucide-react";
import type { SectionMeta } from "@/lib/section-types";
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
      label: "Enable Blur",
      description: "Toggle background blur behind windows",
    },
    {
      configKey: "blur_layer",
      label: "Blur Layer Surfaces",
      description: "Apply blur to layer-shell surfaces (panels, notifications)",
    },
    {
      configKey: "blur_optimized",
      label: "Optimized Blur",
      description: "Use a faster blur algorithm",
    },
    {
      configKey: "blur_params_num_passes",
      label: "Blur Passes",
      description: "Number of blur iterations",
      aliases: ["iterations", "quality"],
    },
    {
      configKey: "blur_params_radius",
      label: "Blur Radius",
      description: "Pixel radius of the blur kernel",
      aliases: ["size", "spread"],
    },
    {
      configKey: "blur_params_noise",
      label: "Blur Noise",
      description: "Grain to reduce banding artifacts",
    },
    {
      configKey: "blur_params_brightness",
      label: "Blur Brightness",
      description: "Brightness multiplier for the blurred layer",
    },
    {
      configKey: "blur_params_contrast",
      label: "Blur Contrast",
      description: "Contrast multiplier for the blurred layer",
    },
    {
      configKey: "blur_params_saturation",
      label: "Blur Saturation",
      description: "Saturation multiplier for the blurred layer",
    },
    {
      configKey: "border_radius",
      label: "Border Radius",
      description: "Corner rounding in pixels",
      aliases: ["rounded", "corners", "rounding"],
    },
    {
      configKey: "border_radius_location_default",
      label: "Affected Corners",
      description: "Which corners receive the radius",
    },
    {
      configKey: "focused_opacity",
      label: "Focused Opacity",
      description: "Opacity of the currently focused window",
      aliases: ["transparency", "alpha"],
    },
    {
      configKey: "unfocused_opacity",
      label: "Unfocused Opacity",
      description: "Opacity of unfocused background windows",
      aliases: ["transparency", "alpha"],
    },
    {
      configKey: "shadows",
      label: "Enable Shadows",
      description: "Render drop shadows behind windows",
    },
    {
      configKey: "shadow_only_floating",
      label: "Shadows Floating Only",
      description: "Only draw shadows for floating windows",
    },
    {
      configKey: "layer_shadows",
      label: "Layer Shadow Surfaces",
      description: "Draw shadows under layer-shell surfaces",
    },
    {
      configKey: "shadows_size",
      label: "Shadow Size",
      description: "How far the shadow extends beyond window edges",
    },
    {
      configKey: "shadows_blur",
      label: "Shadow Softness",
      description: "Gaussian blur sigma for softer shadows",
      aliases: ["feather"],
    },
    {
      configKey: "shadows_position_x",
      label: "Shadow Offset X",
      description: "Horizontal shadow offset",
    },
    {
      configKey: "shadows_position_y",
      label: "Shadow Offset Y",
      description: "Vertical shadow offset",
    },
  ],
};
