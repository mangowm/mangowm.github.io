import { MousePointerIcon } from "lucide-react";
import type { SectionMeta } from "@/lib/section-types";
import { CursorPanel } from "./CursorPanel";

export const cursorMeta: SectionMeta = {
  id: "cursor",
  label: "Cursor",
  icon: <MousePointerIcon />,
  panel: CursorPanel,
  parentId: "appearance",
  keywords: ["cursor", "pointer", "theme", "size", "x cursor"],
  fields: [
    {
      configKey: "cursor_theme",
      label: "Cursor Theme",
      description: "XCursor theme name",
      aliases: ["pointer", "icon", "style"],
    },
    {
      configKey: "cursor_size",
      label: "Cursor Size",
      description: "XCursor size in pixels",
      aliases: ["pointer", "scale", "dimensions"],
    },
  ],
};
