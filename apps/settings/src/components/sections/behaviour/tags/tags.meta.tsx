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
      aliases: ["tag count", "workspace count", "number of tags", "tags count"],
    },
    {
      configKey: "tag_gather",
      aliases: ["compact tags", "remove gaps", "tag compaction"],
    },
    {
      configKey: "tag_carousel",
      aliases: ["wrap tags", "tag wrap", "carousel"],
    },
    {
      configKey: "view_current_to_back",
      aliases: ["send to back", "background", "tag back"],
    },
  ],
};
