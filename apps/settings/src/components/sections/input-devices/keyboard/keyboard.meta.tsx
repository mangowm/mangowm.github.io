import { KeyboardIcon } from "lucide-react";
import type { SectionMeta } from "@/lib/section-types";
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
      label: "Repeat Rate",
      description: "Keyboard repeat rate in characters per second",
    },
    {
      configKey: "repeat_delay",
      label: "Repeat Delay",
      description: "Delay before key repeat starts, in milliseconds",
    },
    {
      configKey: "numlockon",
      label: "NumLock On Startup",
      description: "Enable NumLock when the compositor starts",
    },
    {
      configKey: "xkb_rules_layout",
      label: "XKB Layout",
      description: "Keyboard layout(s) — e.g. 'us' or 'us,ru'",
    },
    {
      configKey: "xkb_rules_variant",
      label: "XKB Variant",
      description: "Keyboard layout variant",
    },
    {
      configKey: "xkb_rules_options",
      label: "XKB Options",
      description: "XKB configuration options — e.g. 'ctrl:nocaps'",
    },
    {
      configKey: "xkb_rules_model",
      label: "XKB Model",
      description: "Keyboard model for XKB",
    },
    {
      configKey: "xkb_rules_rules",
      label: "XKB Rules",
      description: "XKB rules file",
    },
  ],
};
