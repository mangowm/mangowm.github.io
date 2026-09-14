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
      configKey: "rootcolor",
      label: "Root Background",
      description: "Desktop background behind all windows",
    },
    {
      configKey: "bordercolor",
      label: "Inactive Border",
      description: "Unfocused window border (non-selected monitor)",
    },
    {
      configKey: "focuscolor",
      label: "Active Border",
      description: "Focused window border on the selected monitor",
    },
    {
      configKey: "maximizescreencolor",
      label: "Maximize Screen",
      description: "Border when window is focused and maximized",
    },
    {
      configKey: "urgentcolor",
      label: "Urgent",
      description: "Urgent window border — overrides all other colors",
    },
    {
      configKey: "scratchpadcolor",
      label: "Scratchpad",
      description: "Border when focused and scratchpad window",
    },
    {
      configKey: "globalcolor",
      label: "Global",
      description: "Border when focused and toggleglobal window",
    },
    {
      configKey: "overlaycolor",
      label: "Overlay",
      description: "Border when focused and toggleoverlay window",
    },
    {
      configKey: "dropcolor",
      label: "Drop Shadow",
      description: "Drop-shadow rectangle when dragging floating windows",
    },
    {
      configKey: "splitcolor",
      label: "Split Indicator",
      description: "Dwindle manual-split guide line",
    },
    { configKey: "shadowscolor", label: "Shadow", description: "Drop shadow color for windows" },
  ],
};
