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
      aliases: ["move easing", "move bezier", "move control points"],
    },
    {
      configKey: "animation_curve_open",
      aliases: ["open easing", "open bezier", "open control points"],
    },
    {
      configKey: "animation_curve_close",
      aliases: ["close easing", "close bezier", "close control points"],
    },
    {
      configKey: "animation_curve_tag",
      aliases: ["tag easing", "tag bezier", "tag control points", "workspace curve"],
    },
    {
      configKey: "animation_curve_focus",
      aliases: ["focus easing", "focus bezier", "focus control points"],
    },
    {
      configKey: "animation_curve_opacity_fade_in",
      aliases: ["fade in easing", "fade in bezier", "fade in control points"],
    },
    {
      configKey: "animation_curve_opacity_fade_out",
      aliases: ["fade out easing", "fade out bezier", "fade out control points"],
    },
  ],
};
