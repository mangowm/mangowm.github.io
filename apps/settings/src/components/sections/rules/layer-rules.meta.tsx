import { Layers } from "lucide-react";
import type { SectionMeta } from "@/lib/section-types";
import { LayerRulesPanel } from "./LayerRulesPanel";

export const layerRulesMeta: SectionMeta = {
  id: "layer-rules",
  label: "Layer Rules",
  icon: <Layers />,
  parentId: "rules",
  panel: LayerRulesPanel,
  keywords: [
    "layer",
    "layer-shell",
    "panel",
    "notification",
    "wallpaper",
    "blur",
    "shadow",
    "animation",
  ],
};
