import { MoveIcon } from "lucide-react";
import type { SectionMeta } from "@/lib/presentation/section-types";
import { DragPanel } from "./DragPanel";

export const dragMeta: SectionMeta = {
  id: "drag",
  label: "Drag",
  icon: <MoveIcon />,
  panel: DragPanel,
  parentId: "behaviour",
  keywords: ["drag", "resize", "corner", "warp", "cursor", "floating"],
  fields: [
    {
      configKey: "drag_corner",
    },
    {
      configKey: "drag_warp_cursor",
    },
    {
      configKey: "drag_tile_to_tile",
    },
    {
      configKey: "drag_tile_small",
    },
    {
      configKey: "snap_distance",
    },
    {
      configKey: "enable_floating_snap",
    },
  ],
};
