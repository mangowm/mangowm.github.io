import { LayoutDashboardIcon } from "lucide-react";
import type { SectionMeta } from "@/lib/section-types";
import { WorkspacePanel } from "./WorkspacePanel";

export const workspaceMeta: SectionMeta = {
  id: "workspace",
  label: "Workspace",
  icon: <LayoutDashboardIcon />,
  panel: WorkspacePanel,
  parentId: "window-behaviour",
  keywords: ["monitor", "exchange", "scratchpad", "tag", "carousel", "view", "back"],
  fields: [
    {
      configKey: "exchange_cross_monitor",
      label: "Cross-Monitor Exchange",
      description: "Allow swapping windows between monitors",
      aliases: ["swap across monitors", "exchange"],
    },
    {
      configKey: "scratchpad_cross_monitor",
      label: "Scratchpad Cross-Monitor",
      description: "Show scratchpad windows on any monitor",
      aliases: ["scratchpad across monitors"],
    },
    {
      configKey: "single_scratchpad",
      label: "Single Scratchpad",
      description: "Only one scratchpad window at a time",
      aliases: ["scratchpad single"],
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
