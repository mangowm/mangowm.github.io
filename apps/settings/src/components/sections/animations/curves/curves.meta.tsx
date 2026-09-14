import { InfinityIcon } from "lucide-react";
import type { SectionMeta } from "@/lib/section-types";
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
      label: "Move Curve",
      description: "Cubic bezier curve for move/resize animations (x1,y1,x2,y2)",
      aliases: ["move easing", "move bezier", "move control points"],
    },
    {
      configKey: "animation_curve_open",
      label: "Open Curve",
      description: "Cubic bezier curve for window open animations (x1,y1,x2,y2)",
      aliases: ["open easing", "open bezier", "open control points"],
    },
    {
      configKey: "animation_curve_close",
      label: "Close Curve",
      description: "Cubic bezier curve for window close animations (x1,y1,x2,y2)",
      aliases: ["close easing", "close bezier", "close control points"],
    },
    {
      configKey: "animation_curve_tag",
      label: "Tag Switch Curve",
      description: "Cubic bezier curve for tag-switch animations (x1,y1,x2,y2)",
      aliases: ["tag easing", "tag bezier", "tag control points", "workspace curve"],
    },
    {
      configKey: "animation_curve_focus",
      label: "Focus Curve",
      description: "Cubic bezier curve for focus-change animations (x1,y1,x2,y2)",
      aliases: ["focus easing", "focus bezier", "focus control points"],
    },
    {
      configKey: "animation_curve_opafadein",
      label: "Fade In Curve",
      description: "Cubic bezier curve for fade-in opacity animations (x1,y1,x2,y2)",
      aliases: ["fade in easing", "fade in bezier", "fade in control points"],
    },
    {
      configKey: "animation_curve_opafadeout",
      label: "Fade Out Curve",
      description: "Cubic bezier curve for fade-out opacity animations (x1,y1,x2,y2)",
      aliases: ["fade out easing", "fade out bezier", "fade out control points"],
    },
  ],
};
