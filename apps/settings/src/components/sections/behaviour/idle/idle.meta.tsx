import { PowerIcon } from "lucide-react";
import type { SectionMeta } from "@/lib/section-types";
import { IdlePanel } from "./IdlePanel";

export const idleMeta: SectionMeta = {
  id: "idle",
  label: "Idle",
  icon: <PowerIcon />,
  panel: IdlePanel,
  parentId: "behaviour",
  keywords: ["idle", "inhibit", "dpms", "power", "screen", "blank", "cursor", "hide", "timeout"],
  fields: [
    {
      configKey: "idleinhibit_ignore_visible",
      label: "Idle Inhibit Ignore Visible",
      description: "Only fullscreen windows may inhibit the idle inhibitor",
      aliases: ["inhibit", "idle", "dpms", "screen blank", "power save"],
    },
    {
      configKey: "cursor_hide_timeout",
      label: "Cursor Hide Timeout",
      description: "Seconds of inactivity before auto-hiding the cursor (0 = never)",
      aliases: ["hide cursor", "cursor auto-hide", "cursor timeout"],
    },
  ],
};
