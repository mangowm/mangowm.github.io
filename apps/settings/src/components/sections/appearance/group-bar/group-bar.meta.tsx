import { PanelTop } from "lucide-react";
import type { SectionMeta } from "@/lib/section-types";
import { GroupBarPanel } from "./GroupBarPanel";

export const groupBarMeta: SectionMeta = {
  id: "group-bar",
  label: "Group Bar",
  icon: <PanelTop />,
  panel: GroupBarPanel,
  parentId: "appearance",
  keywords: ["group", "bar", "window group", "grouped windows", "decorate", "titlebar"],
  fields: [
    {
      configKey: "group_bar_height",
      label: "Bar Height",
      description: "Height of the per-window group bar in pixels",
      aliases: ["size", "thickness"],
    },
    {
      configKey: "group_bar_decorate_font_desc",
      label: "Font",
      description: "Pango font description for window group bar labels",
      aliases: ["typeface", "text", "family"],
    },
    {
      configKey: "group_bar_decorate_fg_color",
      label: "Text Color",
      description: "Foreground color of window group labels",
      aliases: ["foreground", "text color", "front"],
    },
    {
      configKey: "group_bar_decorate_bg_color",
      label: "Background",
      description: "Background color of the window group bar",
      aliases: ["back", "behind"],
    },
    {
      configKey: "group_bar_decorate_focus_fg_color",
      label: "Focused Text Color",
      description: "Foreground color of the focused group member label",
      aliases: ["focus foreground", "active text"],
    },
    {
      configKey: "group_bar_decorate_focus_bg_color",
      label: "Focused Background",
      description: "Background color of the focused group member bar",
      aliases: ["focus back", "active background"],
    },
    {
      configKey: "group_bar_decorate_border_color",
      label: "Border Color",
      description: "Color of the window group bar outline",
      aliases: ["stroke", "edge"],
    },
    {
      configKey: "group_bar_decorate_border_width",
      label: "Border Width",
      description: "Thickness of the window group bar border in pixels",
      aliases: ["stroke width", "thickness"],
    },
    {
      configKey: "group_bar_decorate_corner_radius",
      label: "Corner Radius",
      description: "Rounding radius for window group bar corners",
      aliases: ["rounding", "rounded", "curves"],
    },
    {
      configKey: "group_bar_decorate_padding_x",
      label: "Padding X",
      description: "Horizontal padding inside the window group bar",
      aliases: ["spacing", "inner", "left", "right"],
    },
    {
      configKey: "group_bar_decorate_padding_y",
      label: "Padding Y",
      description: "Vertical padding inside the window group bar",
      aliases: ["spacing", "inner", "top", "bottom"],
    },
  ],
};
