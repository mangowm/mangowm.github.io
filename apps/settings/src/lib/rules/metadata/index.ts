import type { RuleType, OverrideMeta } from "../types";
import { TAG_NUMBERS } from "../../dispatchers/types";
import { windowMatchers, windowOverrides } from "./window";
import { monitorMatchers, monitorOverrides } from "./monitor";
import { tagMatchers, tagOverrides } from "./tag";
import { layerMatchers, layerOverrides } from "./layer";

export const RULE_MATCHERS: Record<RuleType, string[]> = {
  windowrule: windowMatchers,
  monitorrule: monitorMatchers,
  tagrule: tagMatchers,
  layerrule: layerMatchers,
};

export const OVERRIDE_REGISTRY: OverrideMeta[] = [
  ...windowOverrides,
  ...monitorOverrides,
  ...tagOverrides,
  ...layerOverrides,
];

export function getOverridesForRuleType(type: RuleType): OverrideMeta[] {
  return OVERRIDE_REGISTRY.filter((m) => m.appliesTo?.includes(type) ?? false);
}

export function getOverrideMeta(key: string, ruleType?: RuleType): OverrideMeta | undefined {
  if (ruleType) {
    return OVERRIDE_REGISTRY.find((m) => m.key === key && m.appliesTo?.includes(ruleType));
  }
  return OVERRIDE_REGISTRY.find((m) => m.key === key);
}

export const RULE_LABELS: Record<RuleType, string> = {
  windowrule: "Window Rules",
  monitorrule: "Monitor Rules",
  tagrule: "Tag Rules",
  layerrule: "Layer Rules",
};

export const RULE_DESCRIPTIONS: Record<RuleType, string> = {
  windowrule: "Match windows by app ID or title and apply visual and behavioural overrides.",
  monitorrule:
    "Match monitors by name, make, model, or serial to configure resolution, scaling, and position.",
  tagrule: "Configure per-tag settings like master count and layout factor on a per-monitor basis.",
  layerrule:
    "Configure behaviour for layer-shell surfaces like panels, notifications, and wallpapers.",
};

export const RULE_MATCHER_LABELS: Record<string, string> = {
  appid: "App ID",
  title: "Window Title",
  name: "Monitor Name",
  make: "Monitor Make",
  model: "Monitor Model",
  serial: "Monitor Serial",
  id: "Tag ID",
  layout_name: "Layout Name",
  monitor_name: "Monitor Name",
  monitor_make: "Monitor Make",
  monitor_model: "Monitor Model",
  monitor_serial: "Monitor Serial",
  layer_name: "Layer Name",
};

export const RULE_MATCHER_OPTIONS: Record<string, { value: string; label: string }[]> = {
  layout_name: [
    { value: "tile", label: "Tile" },
    { value: "scroller", label: "Scroller" },
    { value: "grid", label: "Grid" },
    { value: "monocle", label: "Monocle" },
    { value: "deck", label: "Deck" },
    { value: "center_tile", label: "Center Tile" },
    { value: "right_tile", label: "Right Tile" },
    { value: "vertical_scroller", label: "Vertical Scroller" },
    { value: "vertical_tile", label: "Vertical Tile" },
    { value: "vertical_grid", label: "Vertical Grid" },
    { value: "vertical_deck", label: "Vertical Deck" },
    { value: "dwindle", label: "Dwindle" },
    { value: "fair", label: "Fair" },
    { value: "vertical_fair", label: "Vertical Fair" },
  ],
  id: [
    ...TAG_NUMBERS.map((n) => ({ value: n, label: n })),
    { value: "*", label: "All (wildcard)" },
  ],
};

export const RULE_MATCHER_PLACEHOLDERS: Record<string, string> = {
  appid: "e.g. foot, firefox, kitty",
  title: "e.g. Mozilla Firefox",
  name: "e.g. DP-1, eDP-1",
  make: "e.g. Dell Inc.",
  model: "e.g. DELL U2723QE",
  serial: "e.g. ABC123",
  id: "Tag 1–31 (or * for all)",
  layout_name: "e.g. dwindle, master, scroller",
  monitor_name: "e.g. DP-1",
  monitor_make: "e.g. Dell Inc.",
  monitor_model: "e.g. DELL U2723QE",
  monitor_serial: "e.g. ABC123",
  layer_name: "e.g. gtk-layer-shell, wlr-wallpaper",
};
