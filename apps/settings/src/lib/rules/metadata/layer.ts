import type { OverrideMeta } from "../types";

export const layerMatchers = ["layer_name"];

export const layerOverrides: OverrideMeta[] = [
  {
    key: "noanim",
    label: "No Animation",
    description: "Disable animations on this layer",
    type: "boolean",
    category: "Animation",
    appliesTo: ["layerrule"],
  },
  {
    key: "noshadow",
    label: "No Shadow",
    description: "Disable shadows on this layer",
    type: "boolean",
    category: "Animation",
    appliesTo: ["layerrule"],
  },
  {
    key: "shield_when_capture",
    label: "Shield When Capturing",
    description: "Shield (hide) this layer when the screen is being captured/recorded",
    type: "boolean",
    category: "Privacy",
    appliesTo: ["layerrule"],
    aliases: ["shield capture", "hide when recording", "privacy shield"],
  },
];
