import { GalleryHorizontalEndIcon } from "lucide-react";
import type { SectionMeta } from "@/lib/section-types";
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
      label: "Default Proportion",
      description: "Default proportion of the container per tiled window",
    },
    {
      configKey: "scroller_default_proportion_single",
      label: "Single Window Proportion",
      description: "Proportion when only one window is on the tag",
    },
    {
      configKey: "scroller_ignore_proportion_single",
      label: "Ignore Proportion When Solo",
      description: "Ignore proportion setting when solo",
    },
    {
      configKey: "scroller_focus_center",
      label: "Focus Center",
      description: "Focus the window at the center of the viewport",
    },
    {
      configKey: "scroller_prefer_center",
      label: "Prefer Center",
      description: "Keep the focused window centered",
    },
    {
      configKey: "scroller_prefer_overspread",
      label: "Prefer Overspread",
      description: "Overspread windows across available space",
    },
    {
      configKey: "edge_scroller_pointer_focus",
      label: "Pointer Focus at Edge",
      description: "Auto-focus adjacent window at screen edge",
    },
    {
      configKey: "edge_scroller_focus_allow_speed",
      label: "Focus Allow Speed",
      description: "Max pointer speed for edge-triggered focus",
    },
    {
      configKey: "scroller_structs",
      label: "Scroller Structs",
      description: "Number of structural positions in the scroller",
    },
    {
      configKey: "scroller_proportion_preset",
      label: "Proportion Presets",
      description: "Comma-separated preset proportion values (0.1–1.0) for quick switching",
      aliases: ["preset", "proportion list", "quick proportion"],
    },
  ],
};
