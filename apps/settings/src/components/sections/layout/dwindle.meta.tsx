import { SplitSquareHorizontalIcon } from "lucide-react";
import type { SectionMeta } from "@/lib/section-types";
import { DwindlePanel } from "./DwindlePanel";

export const dwindleMeta: SectionMeta = {
  id: "dwindle",
  label: "Dwindle",
  icon: <SplitSquareHorizontalIcon />,
  panel: DwindlePanel,
  parentId: "layout",
  keywords: ["split", "smart", "ratio", "direction"],
  fields: [
    { configKey: "dwindle_vsplit",             label: "Vertical Split",   description: "Policy for vertical splits in the dwindle layout" },
    { configKey: "dwindle_hsplit",             label: "Horizontal Split", description: "Policy for horizontal splits in the dwindle layout" },
    { configKey: "dwindle_preserve_split",     label: "Preserve Split",   description: "Keep the current split direction when inserting" },
    { configKey: "dwindle_smart_split",        label: "Smart Split",      description: "Auto-choose split direction based on dimensions" },
    { configKey: "dwindle_smart_resize",       label: "Smart Resize",     description: "Intelligently resize adjacent windows" },
    { configKey: "dwindle_drop_simple_split",  label: "Drop Simple Split", description: "Fall back to simple split when smart split can't decide" },
    { configKey: "dwindle_manual_split",       label: "Manual Split",     description: "Require explicit split direction input" },
    { configKey: "dwindle_split_ratio",        label: "Split Ratio",      description: "Proportion of space for the first child when splitting" },
  ],
};
