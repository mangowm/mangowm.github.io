import type { OverrideMeta } from "../types";

export const tagMatchers = [
  "id",
  "layout_name",
  "monitor_name",
  "monitor_make",
  "monitor_model",
  "monitor_serial",
];

export const tagOverrides: OverrideMeta[] = [
  {
    key: "nmaster",
    label: "Master Count",
    description: "Number of master windows",
    type: "integer",
    category: "Tag",
    range: [1, 99],
    unit: "",
    appliesTo: ["tagrule"],
  },
  {
    key: "mfact",
    label: "Master Factor",
    description: "Ratio of screen allocated to the master area (0.1–0.9)",
    type: "float",
    category: "Tag",
    range: [0.1, 0.9],
    step: 0.05,
    unit: "",
    appliesTo: ["tagrule"],
  },
  {
    key: "no_render_border",
    label: "No Render Border",
    description: "Disable border rendering for windows on this tag",
    type: "boolean",
    category: "Tag",
    appliesTo: ["tagrule"],
  },
  {
    key: "open_as_floating",
    label: "Open As Floating",
    description: "New windows on this tag open as floating by default",
    type: "boolean",
    category: "Tag",
    appliesTo: ["tagrule"],
  },
  {
    key: "no_hide",
    label: "No Hide",
    description: "Don't hide this tag's windows when switching away",
    type: "boolean",
    category: "Tag",
    appliesTo: ["tagrule"],
  },
];
