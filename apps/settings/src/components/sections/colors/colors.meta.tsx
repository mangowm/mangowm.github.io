import { PaletteIcon } from "lucide-react";
import type { SectionMeta } from "@/lib/presentation/section-types";
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
    },
    {
      configKey: "border_color",
    },
    {
      configKey: "focus_color",
    },
    {
      configKey: "maximized_screen_color",
    },
    {
      configKey: "urgent_color",
    },
    {
      configKey: "scratchpad_color",
    },
    {
      configKey: "global_color",
    },
    {
      configKey: "overlay_color",
    },
    {
      configKey: "drop_color",
    },
    {
      configKey: "split_color",
    },
    { configKey: "shadows_color" },
  ],
};
