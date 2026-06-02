import { PuzzleIcon } from "lucide-react";
import type { SectionMeta } from "@/lib/section-types";
import { XWaylandPanel } from "./XWaylandPanel";

export const xwaylandMeta: SectionMeta = {
  id: "xwayland",
  label: "XWayland",
  icon: <PuzzleIcon />,
  panel: XWaylandPanel,
  parentId: "behaviour",
  keywords: ["xwayland", "x11", "compatibility", "legacy", "persistence"],
  fields: [
    {
      configKey: "xwayland_persistence",
      label: "XWayland Persistence",
      description: "Keep XWayland running even when no X11 clients are active",
      aliases: ["xwayland", "x11", "compat", "keep alive"],
    },
  ],
};
