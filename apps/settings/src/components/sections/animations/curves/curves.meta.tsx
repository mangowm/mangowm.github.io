import { InfinityIcon } from "lucide-react";
import type { SectionMeta } from "@/lib/presentation/section-types";
import { CurvesPanel } from "./CurvesPanel";

export const curvesMeta: SectionMeta = {
  id: "animations-curves",
  label: "Curves",
  icon: <InfinityIcon />,
  panel: CurvesPanel,
  parentId: "animations",
  keywords: [
    "curve",
    "easing",
    "bezier",
    "cubic",
    "control point",
    "ease in",
    "ease out",
    "ease in out",
    "smooth",
    "spring",
    "animation curve",
  ],
  fields: [
    {
      configKey: "animation_curve_move",
    },
    {
      configKey: "animation_curve_open",
    },
    {
      configKey: "animation_curve_close",
    },
    {
      configKey: "animation_curve_tag",
    },
    {
      configKey: "animation_curve_focus",
    },
    {
      configKey: "animation_curve_opacity_fade_in",
    },
    {
      configKey: "animation_curve_opacity_fade_out",
    },
  ],
};
