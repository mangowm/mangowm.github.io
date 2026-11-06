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
      aliases: ["resize handle", "drag edge", "corner resize"],
    },
    {
      configKey: "drag_warp_cursor",
      aliases: ["cursor warp resize", "drag warp"],
    },
    {
      configKey: "drag_tile_to_tile",
      aliases: ["tile drag", "reorder", "swap tiles"],
    },
    {
      configKey: "drag_tile_small",
      aliases: ["tile thumbnail", "drag preview", "mini tile"],
    },
    {
      configKey: "snap_distance",
      aliases: ["snapping", "snap threshold", "edge snap"],
    },
    {
      configKey: "enable_floating_snap",
      aliases: ["snap", "floating snap", "window snap"],
    },
  ],
};
