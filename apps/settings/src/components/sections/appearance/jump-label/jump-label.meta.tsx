import { ScanSearch } from "lucide-react";
import type { SectionMeta } from "@/lib/section-types";
import { JumpLabelPanel } from "./JumpLabelPanel";

export const jumpLabelMeta: SectionMeta = {
  id: "jump-label",
  label: "Jump Labels",
  icon: <ScanSearch />,
  panel: JumpLabelPanel,
  parentId: "appearance",
  keywords: ["jump", "label", "overlay", "overview", "navigate", "key", "hint"],
  fields: [
    {
      configKey: "jump_label_decorate_font_desc",
      label: "Font",
      description: "Pango font description for jump labels",
      aliases: ["typeface", "text", "family"],
    },
    {
      configKey: "jump_label_decorate_fg_color",
      label: "Text Color",
      description: "Foreground color of jump labels",
      aliases: ["foreground", "text color", "front"],
    },
    {
      configKey: "jump_label_decorate_bg_color",
      label: "Background",
      description: "Background color of jump labels",
      aliases: ["back", "behind"],
    },
    {
      configKey: "jump_label_decorate_focus_fg_color",
      label: "Focused Text Color",
      description: "Foreground color of the focused jump label",
      aliases: ["focus foreground", "active text"],
    },
    {
      configKey: "jump_label_decorate_focus_bg_color",
      label: "Focused Background",
      description: "Background color of the focused jump label",
      aliases: ["focus back", "active background"],
    },
    {
      configKey: "jump_label_decorate_border_color",
      label: "Border Color",
      description: "Color of the jump label outline",
      aliases: ["stroke", "edge"],
    },
    {
      configKey: "jump_label_decorate_border_width",
      label: "Border Width",
      description: "Thickness of the jump label border in pixels",
      aliases: ["stroke width", "thickness"],
    },
    {
      configKey: "jump_label_decorate_corner_radius",
      label: "Corner Radius",
      description: "Rounding radius for jump label corners",
      aliases: ["rounding", "rounded", "curves"],
    },
    {
      configKey: "jump_label_decorate_padding_x",
      label: "Padding X",
      description: "Horizontal padding inside jump labels",
      aliases: ["spacing", "inner", "left", "right"],
    },
    {
      configKey: "jump_label_decorate_padding_y",
      label: "Padding Y",
      description: "Vertical padding inside jump labels",
      aliases: ["spacing", "inner", "top", "bottom"],
    },
  ],
};
