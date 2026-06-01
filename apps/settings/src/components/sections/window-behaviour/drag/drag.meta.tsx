import { MoveIcon } from "lucide-react";
import type { SectionMeta } from "@/lib/section-types";
import { DragPanel } from "./DragPanel";

export const dragMeta: SectionMeta = {
  id: "drag",
  label: "Drag",
  icon: <MoveIcon />,
  panel: DragPanel,
  parentId: "window-behaviour",
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
  ],
};
