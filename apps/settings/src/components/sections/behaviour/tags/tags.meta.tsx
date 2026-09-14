import { TagsIcon } from "lucide-react";
import type { SectionMeta } from "@/lib/section-types";
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
      label: "Number of Tags",
      description: "How many tags/workspaces are available (1–31)",
      aliases: ["tag count", "workspace count", "number of tags", "tags count"],
    },
    {
      configKey: "tag_gather",
      label: "Gather Tags",
      description: "Compact tags to remove gaps after windows leave tags",
      aliases: ["compact tags", "remove gaps", "tag compaction"],
    },
    {
      configKey: "tag_carousel",
      label: "Tag Carousel",
      description: "Tags wrap around in a carousel",
      aliases: ["wrap tags", "tag wrap", "carousel"],
    },
    {
      configKey: "view_current_to_back",
      label: "View Current to Back",
      description: "Viewing current tag sends it to back and shows previous tag",
      aliases: ["send to back", "background", "tag back"],
    },
  ],
};
