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
    },
    {
      configKey: "sync_obj_enable",
    },
    {
      configKey: "hdr_depth",
    },
  ],
};
