import { TouchpadIcon } from "lucide-react";
import type { SectionMeta } from "@/lib/section-types";
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
      label: "Enable Touch",
      description: "Enable touchscreen input",
      aliases: ["touchscreen", "enable touch"],
    },
    {
      configKey: "touch_enable_mouse_emulation",
      label: "Mouse Emulation",
      description: "Convert touch gestures into mouse events",
      aliases: ["touch mouse", "emulate mouse", "touch clicks"],
    },
    {
      configKey: "touch_map_to_mon",
      label: "Map to Monitor",
      description: "Monitor to map the touchscreen to",
    },
  ],
};
