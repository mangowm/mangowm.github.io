import { MonitorIcon } from "lucide-react";
import type { SectionMeta } from "@/lib/section-types";
import { TabletPanel } from "./TabletPanel";

export const tabletMeta: SectionMeta = {
  id: "tablet",
  label: "Tablet",
  icon: <MonitorIcon />,
  panel: TabletPanel,
  parentId: "input-devices",
  keywords: ["pen", "draw", "graphics", "monitor", "map", "stylus"],
  fields: [
    {
      configKey: "tablet_map_to_mon",
      label: "Map Tablet To Monitor",
      description: "Monitor to map the graphics tablet to",
    },
  ],
};
