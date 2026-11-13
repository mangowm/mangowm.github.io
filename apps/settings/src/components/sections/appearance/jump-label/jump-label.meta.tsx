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
    },
    {
      configKey: "jump_label_decorate_font_desc",
    },
    {
      configKey: "jump_label_decorate_fg_color",
    },
    {
      configKey: "jump_label_decorate_bg_color",
    },
    {
      configKey: "jump_label_decorate_focus_fg_color",
    },
    {
      configKey: "jump_label_decorate_focus_bg_color",
    },
    {
      configKey: "jump_label_decorate_border_color",
    },
    {
      configKey: "jump_label_decorate_border_width",
    },
    {
      configKey: "jump_label_decorate_corner_radius",
    },
    {
      configKey: "jump_label_decorate_padding_x",
    },
    {
      configKey: "jump_label_decorate_padding_y",
    },
  ],
};
