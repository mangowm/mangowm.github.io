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
];
