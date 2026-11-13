import type { CategoryId } from "./categories";
import type { RuleKey } from "./types";

export const RULE_CATEGORIES: Record<RuleKey, CategoryId> = {
  monitor_rule: "rules",
  tag_rule: "rules",
  layer_rule: "rules",
  window_rule: "rules",
  window_rule_once: "rules",
  device_rule: "rules",
};

export const RULE_MATCHERS: Record<RuleKey, readonly string[]> = {
  window_rule: ["app_id", "title"],
  window_rule_once: ["app_id", "title"],
  monitor_rule: ["name", "make", "model", "serial"],
  tag_rule: [
    "id",
    "layout_name",
    "monitor_name",
    "monitor_make",
    "monitor_model",
    "monitor_serial",
  ],
  layer_rule: ["layer_name"],
  device_rule: ["name", "type"],
};

export interface RuleFieldMeta {
  category: CategoryId;
  step?: number;
  unit?: string;
  aliases?: readonly string[];
  pattern?: string;
  patternError?: string;
  inheritable?: boolean;
  placeholder?: string;
}

export interface RuleMatcherMeta {
  label: string;
  placeholder?: string;
  options?: readonly { value: string; label: string }[];
}

export const RULE_MATCHER_META: Record<RuleKey, Record<string, RuleMatcherMeta>> = {
  window_rule: {
    app_id: { label: "App ID", placeholder: "e.g. foot, firefox, kitty" },
    title: { label: "Window Title", placeholder: "e.g. Mozilla Firefox" },
  },
  window_rule_once: {
    app_id: { label: "App ID", placeholder: "e.g. foot, firefox, kitty" },
    title: { label: "Window Title", placeholder: "e.g. Mozilla Firefox" },
  },
  monitor_rule: {
    name: { label: "Monitor Name", placeholder: "e.g. DP-1, eDP-1" },
    make: { label: "Monitor Make", placeholder: "e.g. Dell Inc." },
    model: { label: "Monitor Model", placeholder: "e.g. DELL U2723QE" },
    serial: { label: "Monitor Serial", placeholder: "e.g. ABC123" },
  },
  tag_rule: {
    id: {
      label: "Tag ID",
      placeholder: "Tag 1-31 (or * for all)",
      options: [
        { value: "1", label: "1" },
        { value: "2", label: "2" },
        { value: "3", label: "3" },
        { value: "4", label: "4" },
        { value: "5", label: "5" },
        { value: "6", label: "6" },
        { value: "7", label: "7" },
        { value: "8", label: "8" },
        { value: "9", label: "9" },
        { value: "10", label: "10" },
        { value: "11", label: "11" },
        { value: "12", label: "12" },
        { value: "13", label: "13" },
        { value: "14", label: "14" },
        { value: "15", label: "15" },
        { value: "16", label: "16" },
        { value: "17", label: "17" },
        { value: "18", label: "18" },
        { value: "19", label: "19" },
        { value: "20", label: "20" },
        { value: "21", label: "21" },
        { value: "22", label: "22" },
        { value: "23", label: "23" },
        { value: "24", label: "24" },
        { value: "25", label: "25" },
        { value: "26", label: "26" },
        { value: "27", label: "27" },
        { value: "28", label: "28" },
        { value: "29", label: "29" },
        { value: "30", label: "30" },
        { value: "31", label: "31" },
        { value: "*", label: "All (wildcard)" },
      ],
    },
    layout_name: {
      label: "Layout Name",
      placeholder: "e.g. dwindle, scroller",
      options: [
        { value: "tile", label: "tile" },
        { value: "scroller", label: "scroller" },
        { value: "grid", label: "grid" },
        { value: "monocle", label: "monocle" },
        { value: "deck", label: "deck" },
        { value: "center_tile", label: "center_tile" },
        { value: "right_tile", label: "right_tile" },
        { value: "vertical_scroller", label: "vertical_scroller" },
        { value: "vertical_tile", label: "vertical_tile" },
        { value: "vertical_grid", label: "vertical_grid" },
        { value: "vertical_deck", label: "vertical_deck" },
        { value: "dwindle", label: "dwindle" },
        { value: "fair", label: "fair" },
        { value: "vertical_fair", label: "vertical_fair" },
      ],
    },
    monitor_name: { label: "Monitor Name", placeholder: "e.g. DP-1" },
    monitor_make: { label: "Monitor Make", placeholder: "e.g. Dell Inc." },
    monitor_model: { label: "Monitor Model", placeholder: "e.g. DELL U2723QE" },
    monitor_serial: { label: "Monitor Serial", placeholder: "e.g. ABC123" },
  },
  layer_rule: {
    layer_name: { label: "Layer Name", placeholder: "e.g. gtk-layer-shell, wlr-wallpaper" },
  },
  device_rule: {
    name: { label: "Monitor Name", placeholder: "e.g. DP-1, eDP-1" },
    type: { label: "Device Type" },
  },
};

export const RULE_FIELD_META: Record<RuleKey, Record<string, RuleFieldMeta>> = {
  monitor_rule: {
    rr: { category: "monitor" },
    scale: { category: "monitor", step: 0.25, unit: "×" },
    x: { category: "monitor", unit: "px" },
    y: { category: "monitor", unit: "px" },
    width: { category: "monitor", unit: "px" },
    height: { category: "monitor", unit: "px" },
    refresh: { category: "monitor", step: 0.5, unit: "Hz" },
    vrr: { category: "monitor", aliases: ["freesync", "gsync", "adaptive sync"] },
    hdr: { category: "monitor", aliases: ["high dynamic range", "hdr mode"] },
    hdr_min_lum: {
      category: "monitor",
      step: 50,
      unit: "cd/m²",
      aliases: ["hdr min luminance", "hdr minimum brightness", "mastering black"],
    },
    hdr_max_lum: {
      category: "monitor",
      step: 100,
      unit: "cd/m²",
      aliases: ["hdr max luminance", "hdr maximum brightness", "max cll", "peak brightness"],
    },
    hdr_max_avg_lum: {
      category: "monitor",
      step: 100,
      unit: "cd/m²",
      aliases: ["hdr average luminance", "max fll", "frame average brightness"],
    },
    hdr_force: { category: "monitor", aliases: ["force hdr", "bypass edid hdr"] },
    icc: { category: "monitor" },
    disable: { category: "monitor", aliases: ["off", "disabled"] },
    primary: { category: "monitor" },
    custom: { category: "monitor" },
  },
  tag_rule: {
    no_render_border: { category: "tag" },
    open_as_floating: { category: "tag" },
    no_hide: { category: "tag" },
    master_count: { category: "tag" },
    master_factor: { category: "tag", step: 0.05 },
    scroller_default_proportion: { category: "tag", step: 0.05 },
    scroller_default_proportion_single: { category: "tag", step: 0.05 },
    scroller_ignore_proportion_single: { category: "tag" },
  },
  layer_rule: {
    animation_type_open: { category: "animation" },
    animation_type_close: { category: "animation" },
    shield_when_capture: {
      category: "security",
      aliases: ["shield capture", "hide when recording", "privacy shield"],
    },
    no_blur: { category: "appearance" },
    no_animation: { category: "animation" },
    no_shadow: { category: "animation" },
  },
  window_rule: {
    is_floating: {
      category: "appearance",
      aliases: ["float", "tiled", "floating mode"],
      inheritable: true,
    },
    animation_type_open: { category: "animation", aliases: ["open anim", "show animation"] },
    animation_type_close: { category: "animation", aliases: ["close anim", "hide animation"] },
    tags: { category: "tag", aliases: ["tag assignment", "move to tag"] },
    monitor: { category: "monitor", aliases: ["send to monitor", "output"] },
    offset_x: { category: "geometry", unit: "%" },
    offset_y: { category: "geometry", unit: "%" },
    no_focus: { category: "behaviour", inheritable: true },
    no_fade_in: { category: "behaviour", inheritable: true },
    no_fade_out: { category: "behaviour", inheritable: true },
    no_force_center: { category: "behaviour", inheritable: true },
    width: { category: "geometry", step: 0.05, aliases: ["window width"] },
    height: { category: "geometry", step: 0.05, aliases: ["window height"] },
    no_border: {
      category: "appearance",
      aliases: ["borderless", "hide border"],
      inheritable: true,
    },
    no_shadow: { category: "appearance", aliases: ["hide shadow"], inheritable: true },
    no_radius: {
      category: "appearance",
      aliases: ["square", "no radius", "sharp corners"],
      inheritable: true,
    },
    no_animation: {
      category: "behaviour",
      aliases: ["no animation", "disable animation"],
      inheritable: true,
    },
    is_open_silent: {
      category: "behaviour",
      aliases: ["silent open", "no focus on open"],
      inheritable: true,
    },
    is_tag_silent: { category: "behaviour", aliases: ["silent tag"], inheritable: true },
    is_named_scratchpad: {
      category: "scratchpad",
      aliases: ["scratchpad", "named scratchpad"],
      inheritable: true,
    },
    is_unmanaged_global: { category: "scratchpad", inheritable: true },
    is_global: {
      category: "scratchpad",
      aliases: ["show on all tags", "sticky"],
      inheritable: true,
    },
    scroller_proportion_single: { category: "appearance", step: 0.05 },
    unfocused_opacity: {
      category: "appearance",
      step: 0.05,
      aliases: ["blur opacity", "inactive opacity"],
    },
    focused_opacity: {
      category: "appearance",
      step: 0.05,
      aliases: ["focus opacity", "opacity focus"],
    },
    is_overlay: {
      category: "scratchpad",
      aliases: ["always on top", "overlay layer"],
      inheritable: true,
    },
    shield_when_capture: {
      category: "behaviour",
      aliases: ["shield capture", "hide when recording", "privacy shield"],
      inheritable: true,
    },
    allow_shortcuts_inhibit: {
      category: "bindings",
      aliases: ["shortcuts inhibit", "inhibit shortcuts"],
      inheritable: true,
    },
    ignore_maximize: { category: "behaviour", aliases: ["no maximize"], inheritable: true },
    ignore_minimize: {
      category: "behaviour",
      aliases: ["no minimize", "no iconify"],
      inheritable: true,
    },
    no_size_hint: {
      category: "behaviour",
      aliases: ["no size hint", "ignore size"],
      inheritable: true,
    },
    idle_inhibit_when_focus: {
      category: "behaviour",
      aliases: ["idle inhibit", "inhibit idle"],
      inheritable: true,
    },
    vrr_only_fullscreen: {
      category: "appearance",
      aliases: ["vrr fullscreen only", "freesync fullscreen only"],
      inheritable: true,
    },
    force_render: {
      category: "behaviour",
      aliases: ["always render", "force redraw", "render while hidden"],
      inheritable: true,
    },
    activation_bypass: {
      category: "behaviour",
      aliases: ["bypass activation", "ignore activation", "no activation"],
      inheritable: true,
    },
    is_term: { category: "appearance", aliases: ["terminal", "is terminal"], inheritable: true },
    allow_csd: {
      category: "appearance",
      aliases: ["csd", "client side decoration", "no csd"],
      inheritable: true,
    },
    force_fake_maximize: { category: "appearance", aliases: ["fake maximize"], inheritable: true },
    force_tiled_state: { category: "appearance", inheritable: true },
    force_tearing: { category: "appearance", aliases: ["tearing", "allow tearing"] },
    no_swallow: {
      category: "behaviour",
      aliases: ["no swallow", "prevent swallow"],
      inheritable: true,
    },
    confine_pointer: { category: "behaviour", inheritable: true },
    no_blur: { category: "behaviour", aliases: ["disable blur"], inheritable: true },
    scroller_proportion: { category: "appearance", step: 0.05 },
    is_fullscreen: { category: "appearance", aliases: ["full screen"], inheritable: true },
    is_fake_fullscreen: {
      category: "appearance",
      aliases: ["fake full screen", "borderless"],
      inheritable: true,
    },
    global_key_binding: {
      category: "bindings",
      aliases: ["global shortcut", "keyboard shortcut", "global bind"],
      pattern: "^[A-Za-z0-9_+]+-[a-zA-Z]+$",
      patternError:
        "Must match format Modifier-Keysym (e.g. Super_L-Escape). Keysym must be alpha-only (no digits).",
    },
  },
  window_rule_once: {
    is_floating: {
      category: "appearance",
      aliases: ["float", "tiled", "floating mode"],
      inheritable: true,
    },
    animation_type_open: { category: "animation", aliases: ["open anim", "show animation"] },
    animation_type_close: { category: "animation", aliases: ["close anim", "hide animation"] },
    tags: { category: "tag", aliases: ["tag assignment", "move to tag"] },
    monitor: { category: "monitor", aliases: ["send to monitor", "output"] },
    offset_x: { category: "geometry", unit: "%" },
    offset_y: { category: "geometry", unit: "%" },
    no_focus: { category: "behaviour", inheritable: true },
    no_fade_in: { category: "behaviour", inheritable: true },
    no_fade_out: { category: "behaviour", inheritable: true },
    no_force_center: { category: "behaviour", inheritable: true },
    width: { category: "geometry", step: 0.05, aliases: ["window width"] },
    height: { category: "geometry", step: 0.05, aliases: ["window height"] },
    no_border: {
      category: "appearance",
      aliases: ["borderless", "hide border"],
      inheritable: true,
    },
    no_shadow: { category: "appearance", aliases: ["hide shadow"], inheritable: true },
    no_radius: {
      category: "appearance",
      aliases: ["square", "no radius", "sharp corners"],
      inheritable: true,
    },
    no_animation: {
      category: "behaviour",
      aliases: ["no animation", "disable animation"],
      inheritable: true,
    },
    is_open_silent: {
      category: "behaviour",
      aliases: ["silent open", "no focus on open"],
      inheritable: true,
    },
    is_tag_silent: { category: "behaviour", aliases: ["silent tag"], inheritable: true },
    is_named_scratchpad: {
      category: "scratchpad",
      aliases: ["scratchpad", "named scratchpad"],
      inheritable: true,
    },
    is_unmanaged_global: { category: "scratchpad", inheritable: true },
    is_global: {
      category: "scratchpad",
      aliases: ["show on all tags", "sticky"],
      inheritable: true,
    },
    scroller_proportion_single: { category: "appearance", step: 0.05 },
    unfocused_opacity: {
      category: "appearance",
      step: 0.05,
      aliases: ["blur opacity", "inactive opacity"],
    },
    focused_opacity: {
      category: "appearance",
      step: 0.05,
      aliases: ["focus opacity", "opacity focus"],
    },
    is_overlay: {
      category: "scratchpad",
      aliases: ["always on top", "overlay layer"],
      inheritable: true,
    },
    shield_when_capture: {
      category: "behaviour",
      aliases: ["shield capture", "hide when recording", "privacy shield"],
      inheritable: true,
    },
    allow_shortcuts_inhibit: {
      category: "bindings",
      aliases: ["shortcuts inhibit", "inhibit shortcuts"],
      inheritable: true,
    },
    ignore_maximize: { category: "behaviour", aliases: ["no maximize"], inheritable: true },
    ignore_minimize: {
      category: "behaviour",
      aliases: ["no minimize", "no iconify"],
      inheritable: true,
    },
    no_size_hint: {
      category: "behaviour",
      aliases: ["no size hint", "ignore size"],
      inheritable: true,
    },
    idle_inhibit_when_focus: {
      category: "behaviour",
      aliases: ["idle inhibit", "inhibit idle"],
      inheritable: true,
    },
    vrr_only_fullscreen: {
      category: "appearance",
      aliases: ["vrr fullscreen only", "freesync fullscreen only"],
      inheritable: true,
    },
    force_render: {
      category: "behaviour",
      aliases: ["always render", "force redraw", "render while hidden"],
      inheritable: true,
    },
    activation_bypass: {
      category: "behaviour",
      aliases: ["bypass activation", "ignore activation", "no activation"],
      inheritable: true,
    },
    is_term: { category: "appearance", aliases: ["terminal", "is terminal"], inheritable: true },
    allow_csd: {
      category: "appearance",
      aliases: ["csd", "client side decoration", "no csd"],
      inheritable: true,
    },
    force_fake_maximize: { category: "appearance", aliases: ["fake maximize"], inheritable: true },
    force_tiled_state: { category: "appearance", inheritable: true },
    force_tearing: { category: "appearance", aliases: ["tearing", "allow tearing"] },
    no_swallow: {
      category: "behaviour",
      aliases: ["no swallow", "prevent swallow"],
      inheritable: true,
    },
    confine_pointer: { category: "behaviour", inheritable: true },
    no_blur: { category: "behaviour", aliases: ["disable blur"], inheritable: true },
    scroller_proportion: { category: "appearance", step: 0.05 },
    is_fullscreen: { category: "appearance", aliases: ["full screen"], inheritable: true },
    is_fake_fullscreen: {
      category: "appearance",
      aliases: ["fake full screen", "borderless"],
      inheritable: true,
    },
    global_key_binding: {
      category: "bindings",
      aliases: ["global shortcut", "keyboard shortcut", "global bind"],
      pattern: "^[A-Za-z0-9_+]+-[a-zA-Z]+$",
      patternError:
        "Must match format Modifier-Keysym (e.g. Super_L-Escape). Keysym must be alpha-only (no digits).",
    },
  },
  device_rule: {
    repeat_rate: { category: "input" },
    repeat_delay: { category: "input" },
    kb_rules: { category: "input" },
    kb_model: { category: "input" },
    kb_layout: { category: "input" },
    kb_variant: { category: "input" },
    kb_options: { category: "input" },
    natural_scrolling: { category: "input" },
    accel_profile: { category: "input" },
    accel_speed: { category: "input" },
    left_handed: { category: "input" },
    middle_button_emulation: { category: "input" },
    scroll_method: { category: "input" },
    scroll_button: { category: "input" },
    click_method: { category: "input" },
    send_events_mode: { category: "input" },
    tap_to_click: { category: "input" },
    tap_and_drag: { category: "input" },
    drag_lock: { category: "input" },
    button_map: { category: "input" },
    disable_while_typing: { category: "input" },
    monitor: { category: "input" },
    map_focus_monitor: { category: "input" },
  },
};
