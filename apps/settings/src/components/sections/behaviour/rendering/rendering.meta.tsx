import { MonitorIcon } from "lucide-react";
import type { SectionMeta } from "@/lib/section-types";
import { RenderingPanel } from "./RenderingPanel";

export const renderingMeta: SectionMeta = {
  id: "rendering",
  label: "Rendering",
  icon: <MonitorIcon />,
  panel: RenderingPanel,
  parentId: "behaviour",
  keywords: ["tearing", "vsync", "async", "sync", "drm", "performance", "display"],
  fields: [
    {
      configKey: "allow_tearing",
      label: "Allow Tearing",
      description: "Permit screen tearing for lower latency",
      aliases: ["tearing", "tear", "vsync", "async", "page flip"],
    },
    {
      configKey: "syncobj_enable",
      label: "Sync Object Enable",
      description: "Enable DRM sync object timeline support",
      aliases: ["sync", "drm", "timeline", "syncobj", "gpu"],
    },
  ],
};
