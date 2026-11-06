import { ScanSearch } from "lucide-react";
import type { SectionMeta } from "@/lib/presentation/section-types";
import { JumpLabelPanel } from "./JumpLabelPanel";

export const jumpLabelMeta: SectionMeta = {
  id: "jump-label",
  label: "Jump Labels",
  icon: <ScanSearch />,
  panel: JumpLabelPanel,
  parentId: "appearance",
  keywords: [
    "jump",
    "label",
    "overlay",
    "overview",
    "navigate",
    "key",
    "hint",
    "character",
    "letters",
  ],
  fields: [
    {
      configKey: "jump_labels",
      aliases: ["character set", "letters", "hint keys", "selection keys"],
    },
    {
      configKey: "jump_label_decorate_font_desc",
      aliases: ["typeface", "text", "family"],
    },
    {
      configKey: "jump_label_decorate_fg_color",
      aliases: ["foreground", "text color", "front"],
    },
    {
      configKey: "jump_label_decorate_bg_color",
      aliases: ["back", "behind"],
    },
    {
      configKey: "jump_label_decorate_focus_fg_color",
      aliases: ["focus foreground", "active text"],
    },
    {
      configKey: "jump_label_decorate_focus_bg_color",
      aliases: ["focus back", "active background"],
    },
    {
      configKey: "jump_label_decorate_border_color",
      aliases: ["stroke", "edge"],
    },
    {
      configKey: "jump_label_decorate_border_width",
      aliases: ["stroke width", "thickness"],
    },
    {
      configKey: "jump_label_decorate_corner_radius",
      aliases: ["rounding", "rounded", "curves"],
    },
    {
      configKey: "jump_label_decorate_padding_x",
      aliases: ["spacing", "inner", "left", "right"],
    },
    {
      configKey: "jump_label_decorate_padding_y",
      aliases: ["spacing", "inner", "top", "bottom"],
    },
  ],
};
