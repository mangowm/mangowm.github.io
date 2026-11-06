import { SplitSquareHorizontalIcon } from "lucide-react";
import type { SectionMeta } from "@/lib/presentation/section-types";
import { DwindlePanel } from "./DwindlePanel";

export const dwindleMeta: SectionMeta = {
  id: "dwindle",
  label: "Dwindle",
  icon: <SplitSquareHorizontalIcon />,
  panel: DwindlePanel,
  parentId: "layout",
  keywords: ["split", "smart", "ratio", "direction"],
  fields: [
    {
      configKey: "dwindle_vertical_split",
    },
    {
      configKey: "dwindle_horizontal_split",
    },
    {
      configKey: "dwindle_preserve_split",
    },
    {
      configKey: "dwindle_smart_split",
    },
    {
      configKey: "dwindle_smart_resize",
    },
    {
      configKey: "dwindle_drop_simple_split",
    },
    {
      configKey: "dwindle_manual_split",
    },
    {
      configKey: "dwindle_split_ratio",
    },
  ],
};
