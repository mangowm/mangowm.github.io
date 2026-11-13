import { PuzzleIcon } from "lucide-react";
import type { SectionMeta } from "@/lib/presentation/section-types";
import { XWaylandPanel } from "./XWaylandPanel";

export const xwaylandMeta: SectionMeta = {
  id: "xwayland",
  label: "XWayland",
  icon: <PuzzleIcon />,
  panel: XWaylandPanel,
  parentId: "behaviour",
  keywords: ["xwayland", "x11", "compatibility", "legacy", "persistence", "scale", "scaling"],
  fields: [
    {
      configKey: "xwayland_persistence",
    },
    {
      configKey: "xwayland_ignore_scale",
    },
  ],
};
