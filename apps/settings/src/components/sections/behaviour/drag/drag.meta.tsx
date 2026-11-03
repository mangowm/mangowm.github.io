import { MoveIcon } from "lucide-react";
import type { SectionMeta } from "@/lib/section-types";
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
      label: "Resize Corner",
      description: "Default resize corner for floating windows (0–4)",
      aliases: ["resize handle", "drag edge", "corner resize"],
    },
    {
      configKey: "drag_warp_cursor",
      label: "Warp Cursor on Drag Resize",
      description: "Move cursor to the resize corner on drag start",
      aliases: ["cursor warp resize", "drag warp"],
    },
    {
      configKey: "drag_tile_to_tile",
      label: "Tile-to-Tile Drag",
      description: "Allow reordering tiled windows by dragging",
      aliases: ["tile drag", "reorder", "swap tiles"],
    },
    {
      configKey: "drag_tile_small",
      label: "Small Tile Preview",
      description: "Shrink dragged tile to a small thumbnail",
      aliases: ["tile thumbnail", "drag preview", "mini tile"],
    },
    {
      configKey: "snap_distance",
      label: "Snap Distance",
      description: "Distance in pixels for window snapping (0–99999)",
      aliases: ["snapping", "snap threshold", "edge snap"],
    },
    {
      configKey: "enable_floating_snap",
      label: "Floating Snap",
      description: "Enable snapping for floating windows",
      aliases: ["snap", "floating snap", "window snap"],
    },
  ],
};
