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
    },
    {
      configKey: "group_bar_decorate_font_desc",
    },
    {
      configKey: "group_bar_decorate_fg_color",
    },
    {
      configKey: "group_bar_decorate_bg_color",
    },
    {
      configKey: "group_bar_decorate_focus_fg_color",
    },
    {
      configKey: "group_bar_decorate_focus_bg_color",
    },
    {
      configKey: "group_bar_decorate_border_color",
    },
    {
      configKey: "group_bar_decorate_border_width",
    },
    {
      configKey: "group_bar_decorate_corner_radius",
    },
    {
      configKey: "group_bar_decorate_padding_x",
    },
    {
      configKey: "group_bar_decorate_padding_y",
    },
  ],
};
