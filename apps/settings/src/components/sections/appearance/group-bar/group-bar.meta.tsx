import { PanelTop } from "lucide-react";
import type { SectionMeta } from "@/lib/presentation/section-types";
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
      aliases: ["size", "thickness"],
    },
    {
      configKey: "group_bar_decorate_font_desc",
      aliases: ["typeface", "text", "family"],
    },
    {
      configKey: "group_bar_decorate_fg_color",
      aliases: ["foreground", "text color", "front"],
    },
    {
      configKey: "group_bar_decorate_bg_color",
      aliases: ["back", "behind"],
    },
    {
      configKey: "group_bar_decorate_focus_fg_color",
      aliases: ["focus foreground", "active text"],
    },
    {
      configKey: "group_bar_decorate_focus_bg_color",
      aliases: ["focus back", "active background"],
    },
    {
      configKey: "group_bar_decorate_border_color",
      aliases: ["stroke", "edge"],
    },
    {
      configKey: "group_bar_decorate_border_width",
      aliases: ["stroke width", "thickness"],
    },
    {
      configKey: "group_bar_decorate_corner_radius",
      aliases: ["rounding", "rounded", "curves"],
    },
    {
      configKey: "group_bar_decorate_padding_x",
      aliases: ["spacing", "inner", "left", "right"],
    },
    {
      configKey: "group_bar_decorate_padding_y",
      aliases: ["spacing", "inner", "top", "bottom"],
    },
  ],
};
