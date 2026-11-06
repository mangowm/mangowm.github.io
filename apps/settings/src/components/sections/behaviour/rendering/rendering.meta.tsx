import { MonitorIcon } from "lucide-react";
import type { SectionMeta } from "@/lib/presentation/section-types";
import { RenderingPanel } from "./RenderingPanel";

export const renderingMeta: SectionMeta = {
  id: "rendering",
  label: "Rendering",
  icon: <MonitorIcon />,
  panel: RenderingPanel,
  parentId: "behaviour",
  keywords: ["tearing", "vsync", "async", "sync", "drm", "hdr", "performance", "display"],
  fields: [
    {
      configKey: "allow_tearing",
      aliases: ["tearing", "tear", "vsync", "async", "page flip"],
    },
    {
      configKey: "sync_obj_enable",
      aliases: ["sync", "drm", "timeline", "syncobj", "gpu"],
    },
    {
      configKey: "hdr_depth",
      aliases: ["hdr", "bit depth", "high dynamic range", "color depth"],
    },
  ],
};
