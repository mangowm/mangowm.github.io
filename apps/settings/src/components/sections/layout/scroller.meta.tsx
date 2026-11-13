import { GalleryHorizontalEndIcon } from "lucide-react";
import type { SectionMeta } from "@/lib/presentation/section-types";
import { ScrollerPanel } from "./ScrollerPanel";

export const scrollerMeta: SectionMeta = {
  id: "scroller",
  label: "Scroller",
  icon: <GalleryHorizontalEndIcon />,
  panel: ScrollerPanel,
  parentId: "layout",
  keywords: ["scroll", "proportion", "focus", "edge", "structs"],
  fields: [
    {
      configKey: "scroller_default_proportion",
    },
    {
      configKey: "scroller_default_proportion_single",
    },
    {
      configKey: "scroller_ignore_proportion_single",
    },
    {
      configKey: "scroller_focus_center",
    },
    {
      configKey: "scroller_prefer_center",
    },
    {
      configKey: "scroller_prefer_overspread",
    },
    {
      configKey: "edge_scroller_pointer_focus",
    },
    {
      configKey: "edge_scroller_focus_allow_speed",
    },
    {
      configKey: "scroller_structs",
    },
    {
      configKey: "scroller_proportion_preset",
    },
  ],
};
