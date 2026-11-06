import { KeyboardIcon } from "lucide-react";
import type { SectionMeta } from "@/lib/presentation/section-types";
import { KeyboardPanel } from "./KeyboardPanel";

export const keyboardMeta: SectionMeta = {
  id: "keyboard",
  label: "Keyboard",
  icon: <KeyboardIcon />,
  panel: KeyboardPanel,
  parentId: "input-devices",
  keywords: ["repeat", "rate", "delay", "numlock", "xkb", "layout", "variant", "model"],
  fields: [
    {
      configKey: "repeat_rate",
    },
    {
      configKey: "repeat_delay",
    },
    {
      configKey: "numlock_on",
    },
    {
      configKey: "xkb_rules_layout",
    },
    {
      configKey: "xkb_rules_variant",
    },
    {
      configKey: "xkb_rules_options",
    },
    {
      configKey: "xkb_rules_model",
    },
    {
      configKey: "xkb_rules_rules",
    },
  ],
};
