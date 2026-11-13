import { MousePointerIcon } from "lucide-react";
import type { SectionMeta } from "@/lib/presentation/section-types";
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
    },
    {
      configKey: "cursor_size",
    },
  ],
};
