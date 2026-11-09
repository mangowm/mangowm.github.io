import { LAYOUTS, RULES, type RuleDef, type RuleFieldDef } from "@mangowm.github.io/config/catalog";

import { TAG_NUMBERS } from "../../dispatchers/types";
import type { OverrideMeta, OverrideValueType, RuleType } from "../types";

export const RULE_CONFIG_KEY: Record<RuleType, RuleDef["key"]> = {
  windowrule: "window_rule",
  monitorrule: "monitor_rule",
  tagrule: "tag_rule",
  layerrule: "layer_rule",
};

const RULE_TYPES: RuleType[] = ["windowrule", "monitorrule", "tagrule", "layerrule"];

const DEFAULT_CATEGORY: Record<RuleType, string> = {
  windowrule: "Window",
  monitorrule: "Monitor",
  tagrule: "Tag",
  layerrule: "Layer",
};

export const RULE_MATCHERS: Record<RuleType, string[]> = {
  windowrule: ["app_id", "title"],
  monitorrule: ["name", "make", "model", "serial"],
  tagrule: ["id", "layout_name", "monitor_name", "monitor_make", "monitor_model", "monitor_serial"],
  layerrule: ["layer_name"],
};

interface OverrideUi {
  category?: string;
  step?: number;
  unit?: string;
  range?: [number, number];
  aliases?: string[];
  pattern?: string;
  patternError?: string;
}

const WINDOW_UI: Record<string, OverrideUi> = {
  is_floating: { category: "Appearance", aliases: ["float", "tiled", "floating mode"] },
  is_fullscreen: { category: "Appearance", aliases: ["full screen"] },
  is_fake_fullscreen: { category: "Appearance", aliases: ["fake full screen", "borderless"] },
  no_border: { category: "Appearance", aliases: ["borderless", "hide border"] },
  no_shadow: { category: "Appearance", aliases: ["hide shadow"] },
  no_radius: { category: "Appearance", aliases: ["square", "no radius", "sharp corners"] },
  focused_opacity: {
    category: "Appearance",
    step: 0.05,
    aliases: ["focus opacity", "opacity focus"],
  },
  unfocused_opacity: {
    category: "Appearance",
    step: 0.05,
    aliases: ["blur opacity", "inactive opacity"],
  },
  scroller_proportion: { category: "Appearance", step: 0.05 },
  scroller_proportion_single: { category: "Appearance", step: 0.05 },
  allow_csd: { category: "Appearance", aliases: ["csd", "client side decoration", "no csd"] },
  force_fake_maximize: { category: "Appearance", aliases: ["fake maximize"] },
  force_tearing: { category: "Appearance", aliases: ["tearing", "allow tearing"] },
  force_tiled_state: { category: "Appearance" },
  is_term: { category: "Appearance", aliases: ["terminal", "is terminal"] },
  no_animation: { category: "Behaviour", aliases: ["no animation", "disable animation"] },
  is_open_silent: { category: "Behaviour", aliases: ["silent open", "no focus on open"] },
  is_tag_silent: { category: "Behaviour", aliases: ["silent tag"] },
  no_focus: { category: "Behaviour" },
  no_fade_in: { category: "Behaviour" },
  no_fade_out: { category: "Behaviour" },
  no_force_center: { category: "Behaviour" },
  idle_inhibit_when_focus: { category: "Behaviour", aliases: ["idle inhibit", "inhibit idle"] },
  no_swallow: { category: "Behaviour", aliases: ["no swallow", "prevent swallow"] },
  no_blur: { category: "Behaviour", aliases: ["disable blur"] },
  ignore_maximize: { category: "Behaviour", aliases: ["no maximize"] },
  ignore_minimize: { category: "Behaviour", aliases: ["no minimize", "no iconify"] },
  no_size_hint: { category: "Behaviour", aliases: ["no size hint", "ignore size"] },
  is_named_scratchpad: {
    category: "Scratchpad & Overlay",
    aliases: ["scratchpad", "named scratchpad"],
  },
  is_unmanaged_global: { category: "Scratchpad & Overlay" },
  is_global: { category: "Scratchpad & Overlay", aliases: ["show on all tags", "sticky"] },
  is_overlay: { category: "Scratchpad & Overlay", aliases: ["always on top", "overlay layer"] },
  allow_shortcuts_inhibit: {
    category: "Input & Shortcuts",
    aliases: ["shortcuts inhibit", "inhibit shortcuts"],
  },
  animation_type_open: { category: "Animation", aliases: ["open anim", "show animation"] },
  animation_type_close: { category: "Animation", aliases: ["close anim", "hide animation"] },
  global_key_binding: {
    category: "Input & Shortcuts",
    aliases: ["global shortcut", "keyboard shortcut", "global bind"],
    pattern: "^[A-Za-z0-9_+]+-[a-zA-Z]+$",
    patternError:
      "Must match format Modifier-Keysym (e.g. Super_L-Escape). Keysym must be alpha-only (no digits).",
  },
  tags: { category: "Tags & Monitor", aliases: ["tag assignment", "move to tag"] },
  monitor: { category: "Tags & Monitor", aliases: ["send to monitor", "output"] },
  offset_x: { category: "Geometry", range: [-99999, 99999], unit: "%" },
  offset_y: { category: "Geometry", range: [-99999, 99999], unit: "%" },
  width: { category: "Geometry", range: [0, 99999], step: 0.05, aliases: ["window width"] },
  height: { category: "Geometry", range: [0, 99999], step: 0.05, aliases: ["window height"] },
  shield_when_capture: {
    category: "Behaviour",
    aliases: ["shield capture", "hide when recording", "privacy shield"],
  },
  vrr_only_fullscreen: {
    category: "Appearance",
    aliases: ["vrr fullscreen only", "freesync fullscreen only"],
  },
  force_render: {
    category: "Behaviour",
    aliases: ["always render", "force redraw", "render while hidden"],
  },
  activation_bypass: {
    category: "Behaviour",
    aliases: ["bypass activation", "ignore activation", "no activation"],
  },
  confine_pointer: { category: "Behaviour" },
};

const MONITOR_UI: Record<string, OverrideUi> = {
  scale: { step: 0.25, unit: "×" },
  x: { range: [-99999, 99999], unit: "px" },
  y: { range: [-99999, 99999], unit: "px" },
  width: { range: [1, 99999], unit: "px" },
  height: { range: [1, 99999], unit: "px" },
  refresh: { step: 0.5, unit: "Hz" },
  vrr: { aliases: ["freesync", "gsync", "adaptive sync"] },
  hdr: { aliases: ["high dynamic range", "hdr mode"] },
  hdr_min_lum: {
    step: 50,
    unit: "cd/m²",
    aliases: ["hdr min luminance", "hdr minimum brightness", "mastering black"],
  },
  hdr_max_lum: {
    step: 100,
    unit: "cd/m²",
    aliases: ["hdr max luminance", "hdr maximum brightness", "max cll", "peak brightness"],
  },
  hdr_max_avg_lum: {
    step: 100,
    unit: "cd/m²",
    aliases: ["hdr average luminance", "max fll", "frame average brightness"],
  },
  hdr_force: { aliases: ["force hdr", "bypass edid hdr"] },
  disable: { aliases: ["off", "disabled"] },
};

const TAG_UI: Record<string, OverrideUi> = {
  master_factor: { step: 0.05 },
  scroller_default_proportion: { step: 0.05 },
  scroller_default_proportion_single: { step: 0.05 },
};

const LAYER_UI: Record<string, OverrideUi> = {
  animation_type_open: { category: "Animation" },
  animation_type_close: { category: "Animation" },
  no_animation: { category: "Animation" },
  no_shadow: { category: "Animation" },
  no_blur: { category: "Appearance" },
  shield_when_capture: {
    category: "Privacy",
    aliases: ["shield capture", "hide when recording", "privacy shield"],
  },
};

const UI_OVERRIDES: Record<RuleType, Record<string, OverrideUi>> = {
  windowrule: WINDOW_UI,
  monitorrule: MONITOR_UI,
  tagrule: TAG_UI,
  layerrule: LAYER_UI,
};

function ruleDef(type: RuleType): RuleDef {
  const rule = RULES.find((candidate) => candidate.key === RULE_CONFIG_KEY[type]);
  if (!rule) throw new Error(`Missing schema rule ${RULE_CONFIG_KEY[type]}`);
  return rule;
}

function uiType(field: RuleFieldDef): OverrideValueType {
  switch (field.type) {
    case "bool":
      return "boolean";
    case "int":
      return "integer";
    case "float":
      return "float";
    case "enum":
      return "select";
    case "color":
      return "color";
    default:
      return "string";
  }
}

function buildOverrides(type: RuleType): OverrideMeta[] {
  const matchers = new Set(RULE_MATCHERS[type]);
  const ui = UI_OVERRIDES[type];

  return ruleDef(type)
    .fields.filter((field) => !matchers.has(field.key))
    .map((field) => {
      const extra = ui[field.key] ?? {};
      const min = "min" in field ? field.min : undefined;
      const max = "max" in field ? field.max : undefined;
      const schemaRange: [number, number] | undefined =
        min !== undefined && max !== undefined ? [min, max] : undefined;

      return {
        key: field.key,
        label: field.label,
        description: field.description,
        type: uiType(field),
        category: extra.category ?? DEFAULT_CATEGORY[type],
        range: extra.range ?? schemaRange,
        step: extra.step ?? (field.type === "float" ? 0.01 : undefined),
        unit: extra.unit,
        options:
          field.type === "enum"
            ? field.options.map((option) => ({ value: option.value, label: option.label }))
            : undefined,
        appliesTo: [type],
        aliases: extra.aliases,
        inherit: type === "windowrule" && field.type === "bool",
        pattern: extra.pattern,
        patternError: extra.patternError,
      };
    });
}

export const OVERRIDE_REGISTRY: OverrideMeta[] = RULE_TYPES.flatMap(buildOverrides);

export function getOverridesForRuleType(type: RuleType): OverrideMeta[] {
  return OVERRIDE_REGISTRY.filter((meta) => meta.appliesTo?.includes(type) ?? false);
}

export function getOverrideMeta(key: string, ruleType?: RuleType): OverrideMeta | undefined {
  if (ruleType) {
    return OVERRIDE_REGISTRY.find((meta) => meta.key === key && meta.appliesTo?.includes(ruleType));
  }
  return OVERRIDE_REGISTRY.find((meta) => meta.key === key);
}

export const RULE_LABELS: Record<RuleType, string> = Object.fromEntries(
  RULE_TYPES.map((type) => [type, ruleDef(type).label]),
) as Record<RuleType, string>;

export const RULE_DESCRIPTIONS: Record<RuleType, string> = Object.fromEntries(
  RULE_TYPES.map((type) => [type, ruleDef(type).description]),
) as Record<RuleType, string>;

export const RULE_MATCHER_LABELS: Record<string, string> = {
  app_id: "App ID",
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

const layoutField = ruleDef("tagrule").fields.find((field) => field.key === "layout_name");
const layoutOptions =
  layoutField?.type === "enum"
    ? layoutField.options.map((option) => ({ value: option.value, label: option.label }))
    : LAYOUTS.map((value) => ({ value, label: value }));

export const RULE_MATCHER_OPTIONS: Record<string, { value: string; label: string }[]> = {
  layout_name: layoutOptions,
  id: [
    ...TAG_NUMBERS.map((tag) => ({ value: tag, label: tag })),
    { value: "*", label: "All (wildcard)" },
  ],
};

export const RULE_MATCHER_PLACEHOLDERS: Record<string, string> = {
  app_id: "e.g. foot, firefox, kitty",
  title: "e.g. Mozilla Firefox",
  name: "e.g. DP-1, eDP-1",
  make: "e.g. Dell Inc.",
  model: "e.g. DELL U2723QE",
  serial: "e.g. ABC123",
  id: `Tag 1-${TAG_NUMBERS.length} (or * for all)`,
  layout_name: "e.g. dwindle, scroller",
  monitor_name: "e.g. DP-1",
  monitor_make: "e.g. Dell Inc.",
  monitor_model: "e.g. DELL U2723QE",
  monitor_serial: "e.g. ABC123",
  layer_name: "e.g. gtk-layer-shell, wlr-wallpaper",
};
