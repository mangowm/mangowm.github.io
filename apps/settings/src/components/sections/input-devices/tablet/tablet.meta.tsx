import { PenIcon } from "lucide-react";
import type { SectionMeta } from "@/lib/section-types";
import { TabletPanel } from "./TabletPanel";

export const tabletMeta: SectionMeta = {
  id: "tablet",
  label: "Tablet",
  icon: <PenIcon />,
  panel: TabletPanel,
  parentId: "input-devices",
  keywords: ["pen", "draw", "graphics", "monitor", "map", "stylus"],
  fields: [],
};
