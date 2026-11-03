import { PaletteIcon } from "lucide-react";
import type { SectionMeta } from "@/lib/section-types";
import { ColorsPanel } from "./ColorsPanel";

export const colorsMeta: SectionMeta = {
  id: "colors",
  label: "Colors",
  icon: <PaletteIcon />,
  panel: ColorsPanel,
  parentId: "appearance",
  keywords: ["palette", "theme", "colour", "background", "border"],
  fields: [
    {
      configKey: "root_color",
      label: "Root Background",
      description: "Desktop background behind all windows",
    },
    {
      configKey: "border_color",
      label: "Inactive Border",
      description: "Unfocused window border (non-selected monitor)",
    },
    {
      configKey: "focus_color",
      label: "Active Border",
      description: "Focused window border on the selected monitor",
    },
    {
      configKey: "maximized_screen_color",
      label: "Maximize Screen",
      description: "Border when window is focused and maximized",
    },
    {
      configKey: "urgent_color",
      label: "Urgent",
      description: "Urgent window border — overrides all other colors",
    },
    {
      configKey: "scratchpad_color",
      label: "Scratchpad",
      description: "Border when focused and scratchpad window",
    },
    {
      configKey: "global_color",
      label: "Global",
      description: "Border when focused and toggleglobal window",
    },
    {
      configKey: "overlay_color",
      label: "Overlay",
      description: "Border when focused and toggleoverlay window",
    },
    {
      configKey: "drop_color",
      label: "Drop Shadow",
      description: "Drop-shadow rectangle when dragging floating windows",
    },
    {
      configKey: "split_color",
      label: "Split Indicator",
      description: "Dwindle manual-split guide line",
    },
    { configKey: "shadows_color", label: "Shadow", description: "Drop shadow color for windows" },
  ],
};
