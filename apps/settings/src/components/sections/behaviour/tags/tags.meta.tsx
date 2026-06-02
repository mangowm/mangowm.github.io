import { TagsIcon } from "lucide-react";
import type { SectionMeta } from "@/lib/section-types";
import { TagsPanel } from "./TagsPanel";

export const tagsMeta: SectionMeta = {
  id: "tags",
  label: "Tags",
  icon: <TagsIcon />,
  panel: TagsPanel,
  parentId: "behaviour",
  keywords: ["tag", "carousel", "view", "back", "navigation"],
  fields: [
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
