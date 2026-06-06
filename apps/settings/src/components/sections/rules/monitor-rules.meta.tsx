import { Monitor } from "lucide-react";
import type { SectionMeta } from "@/lib/section-types";
import { MonitorRulesPanel } from "./MonitorRulesPanel";

export const monitorRulesMeta: SectionMeta = {
  id: "monitor-rules",
  label: "Monitor Rules",
  icon: <Monitor />,
  parentId: "rules",
  panel: MonitorRulesPanel,
  keywords: [
    "monitor",
    "output",
    "display",
    "resolution",
    "scale",
    "refresh",
    "vrr",
    "position",
    "layout",
    "rotate",
  ],
};
