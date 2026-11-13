import { TagsIcon } from "lucide-react";
import type { SectionMeta } from "@/lib/presentation/section-types";
import { TagsPanel } from "./TagsPanel";

export const tagsMeta: SectionMeta = {
  id: "tags",
  label: "Tags",
  icon: <TagsIcon />,
  panel: TagsPanel,
  parentId: "behaviour",
  keywords: ["tag", "carousel", "view", "back", "navigation", "count", "number", "gather"],
  fields: [
    {
      configKey: "tag_num",
    },
    {
      configKey: "tag_gather",
    },
    {
      configKey: "tag_carousel",
    },
    {
      configKey: "view_current_to_back",
    },
  ],
};
