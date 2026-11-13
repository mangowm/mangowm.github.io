import { TouchpadIcon } from "lucide-react";
import type { SectionMeta } from "@/lib/presentation/section-types";
import { TouchPanel } from "./TouchPanel";

export const touchMeta: SectionMeta = {
  id: "touch",
  label: "Touch",
  icon: <TouchpadIcon />,
  panel: TouchPanel,
  parentId: "input-devices",
  keywords: ["touch", "touchscreen", "screen", "finger", "map", "monitor"],
  fields: [
    {
      configKey: "touch_enable",
    },
    {
      configKey: "touch_enable_mouse_emulation",
    },
  ],
};
