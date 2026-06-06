import { Monitor } from "lucide-react";
import type { SectionMeta } from "@/lib/section-types";
import { WindowRulesPanel } from "./WindowRulesPanel";

export const windowRulesMeta: SectionMeta = {
  id: "window-rules",
  label: "Window Rules",
  icon: <Monitor />,
  parentId: "rules",
  panel: WindowRulesPanel,
  keywords: [
    "appid",
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
