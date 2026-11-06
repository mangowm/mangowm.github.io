import { Monitor } from "lucide-react";
import type { SectionMeta } from "@/lib/presentation/section-types";
import { WindowRulesPanel } from "./WindowRulesPanel";

export const windowRulesMeta: SectionMeta = {
  id: "window-rules",
  label: "Window Rules",
  icon: <Monitor />,
  parentId: "rules",
  panel: WindowRulesPanel,
  keywords: [
    "app_id",
    "title",
    "floating",
    "fullscreen",
    "opacity",
    "animation",
    "override",
    "match",
    "scratchpad",
    "border",
    "shadow",
    "swallow",
    "blur",
  ],
};
