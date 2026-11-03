import type { RuleDef, RuleFieldDef } from "./types";

const WINDOW_RULE_FIELDS: readonly RuleFieldDef[] = [
  {
    key: "is_floating",
    type: "bool",
    label: "Floating",
    description: "Force floating state.",
  },
  {
    key: "title",
    type: "string",
    label: "Title",
    description: "Match by window title, supports regex.",
    examples: ["^Picture-in-Picture$"],
  },
  {
    key: "app_id",
    type: "string",
    label: "App ID",
    description: "Match by application ID, supports regex.",
    examples: ["firefox"],
  },
  {
    key: "animation_type_open",
    type: "enum",
    label: "Open Animation",
    description: "Window open animation. Empty inherits the global setting. `none` disables it.",
    options: [
      {
        value: "",
        label: "Unset",
      },
      {
        value: "none",
        label: "None",
      },
      {
        value: "fade",
        label: "Fade",
      },
      {
        value: "slide",
        label: "Slide",
      },
      {
        value: "zoom",
        label: "Zoom",
      },
    ],
  },
  {
    key: "animation_type_close",
    type: "enum",
    label: "Close Animation",
    description: "Window close animation. Empty inherits the global setting. `none` disables it.",
    options: [
      {
        value: "",
        label: "Unset",
      },
      {
        value: "none",
        label: "None",
      },
      {
        value: "fade",
        label: "Fade",
      },
      {
        value: "slide",
        label: "Slide",
      },
      {
        value: "zoom",
        label: "Zoom",
      },
    ],
  },
  {
    key: "tags",
    type: "tag-mask",
    label: "Tags",
    description: "Assign to one tag, several tags separated by |, or the special workspace with 0.",
    examples: [[1, 3]],
  },
  {
    key: "monitor",
    type: "string",
    label: "Monitor",
    description: "Assign to monitor by monitor spec (name, make, model, or serial).",
    examples: ["make:BOE&&model:0x1234"],
  },
  {
    key: "offset_x",
    type: "int",
    label: "X Offset",
    description: "Horizontal offset from center in percent. 100 sits at the outer gap.",
  },
  {
    key: "offset_y",
    type: "int",
    label: "Y Offset",
    description: "Vertical offset from center in percent. 100 sits at the outer gap.",
  },
  {
    key: "no_focus",
    type: "bool",
    label: "No Focus",
    description: "Never give this window keyboard focus.",
  },
  {
    key: "no_fade_in",
    type: "bool",
    label: "No Fade In",
    description: "Window ignores fade-in animation.",
  },
  {
    key: "no_fade_out",
    type: "bool",
    label: "No Fade Out",
    description: "Window ignores fade-out animation.",
  },
  {
    key: "no_force_center",
    type: "bool",
    label: "No Force Center",
    description: "Do not center the window automatically.",
  },
  {
    key: "width",
    type: "float",
    label: "Width",
    description:
      "Floating width: 0 to 1 is a fraction of the usable screen width. Above 1 is pixels.",
    examples: [800],
  },
  {
    key: "height",
    type: "float",
    label: "Height",
    description:
      "Floating height: 0 to 1 is a fraction of the usable screen height. Above 1 is pixels.",
    examples: [600],
  },
  {
    key: "no_border",
    type: "bool",
    label: "No Border",
    description: "Remove window border.",
  },
  {
    key: "no_shadow",
    type: "bool",
    label: "No Shadow",
    description: "Disable the window shadow.",
  },
  {
    key: "no_radius",
    type: "bool",
    label: "No Radius",
    description: "Disable corner radius.",
  },
  {
    key: "no_animation",
    type: "bool",
    label: "No Animation",
    description: "Disable window animations.",
  },
  {
    key: "is_open_silent",
    type: "bool",
    label: "Open Unfocused",
    description: "Open without focus.",
  },
  {
    key: "is_tag_silent",
    type: "bool",
    label: "No Focus on Hidden Tag",
    description: "Do not focus the window when it opens on a tag that is not currently visible.",
  },
  {
    key: "is_named_scratchpad",
    type: "bool",
    label: "Named Scratchpad",
    description: "Mark the window as a named scratchpad toggled by toggle_named_scratchpad.",
  },
  {
    key: "is_unmanaged_global",
    type: "bool",
    label: "Unmanaged Global",
    description: "Open as unmanaged global window (for desktop pets or camera windows).",
  },
  {
    key: "is_global",
    type: "bool",
    label: "Global",
    description: "Open as global window (sticky across tags).",
  },
  {
    key: "scroller_proportion_single",
    type: "float",
    label: "Scroller Proportion (Single)",
    description:
      "Width proportion used while this window is the only tiled window (0-1; 0 keeps the global value).",
    min: 0,
    max: 1,
  },
  {
    key: "unfocused_opacity",
    type: "float",
    label: "Unfocused Opacity",
    description: "Opacity for inactive windows. 0 keeps the global opacity.",
    min: 0,
    max: 1,
    examples: [0.85],
  },
  {
    key: "focused_opacity",
    type: "float",
    label: "Focused Opacity",
    description: "Opacity for the active window. 0 keeps the global opacity.",
    min: 0,
    max: 1,
    examples: [0.9],
  },
  {
    key: "is_overlay",
    type: "bool",
    label: "Overlay",
    description: "Keep the window in the top layer.",
  },
  {
    key: "shield_when_capture",
    type: "bool",
    label: "Shield When Captured",
    description: "Fill the window with black while a screen capture is active.",
  },
  {
    key: "allow_shortcuts_inhibit",
    type: "bool",
    label: "Allow Shortcuts Inhibit",
    description: "Let this window's client inhibit compositor shortcuts.",
  },
  {
    key: "ignore_maximize",
    type: "bool",
    label: "Ignore Maximize",
    description: "Ignore maximize requests from the client.",
  },
  {
    key: "ignore_minimize",
    type: "bool",
    label: "Ignore Minimize",
    description: "Ignore minimize requests from the client.",
  },
  {
    key: "no_size_hint",
    type: "bool",
    label: "No Size Hint",
    description: "Ignore the client's minimum and maximum size hints when resizing.",
  },
  {
    key: "idle_inhibit_when_focus",
    type: "bool",
    label: "Inhibit Idle When Focused",
    description: "Keep idle inhibit active while this window is focused.",
  },
  {
    key: "vrr_only_fullscreen",
    type: "bool",
    label: "VRR Only Fullscreen",
    description:
      "Turn on VRR only while this window is fullscreen. Requires vrr off in its monitor rule.",
  },
  {
    key: "force_render",
    type: "bool",
    label: "Force Render",
    description: "Keep sending frame callbacks while the window is hidden.",
  },
  {
    key: "activation_bypass",
    type: "bool",
    label: "Activation Bypass",
    description: "Treat activation requests for this window as authenticated.",
  },
  {
    key: "is_term",
    type: "bool",
    label: "Terminal",
    description: "Mark the window as a terminal that a newly opened window replaces.",
  },
  {
    key: "allow_csd",
    type: "bool",
    label: "Allow CSD",
    description: "Let clients draw their own window decorations.",
  },
  {
    key: "force_fake_maximize",
    type: "bool",
    label: "Force Fake Maximize",
    description: "Report the window as maximized to the client while keeping the tiled geometry.",
  },
  {
    key: "force_tiled_state",
    type: "bool",
    label: "Force Tiled State",
    description: "Report floating windows as tiled (on by default).",
  },
  {
    key: "force_tearing",
    type: "enum",
    label: "Force Tearing",
    description:
      "Tearing override: 0 unset, 1 enabled, 2 disabled. Enabled still requires global allow_tearing.",
    options: [
      {
        value: "0",
        label: "Unspecified",
      },
      {
        value: "1",
        label: "Enabled",
      },
      {
        value: "2",
        label: "Disabled",
      },
    ],
    numeric: true,
  },
  {
    key: "no_swallow",
    type: "bool",
    label: "No Swallow",
    description: "Do not let this window replace an is_term window.",
  },
  {
    key: "confine_pointer",
    type: "bool",
    label: "Confine Pointer",
    description: "Keep the pointer inside this window while it is focused and visible.",
  },
  {
    key: "no_blur",
    type: "bool",
    label: "No Blur",
    description: "Disable blur for this window.",
  },
  {
    key: "scroller_proportion",
    type: "float",
    label: "Scroller Proportion",
    description:
      "Width proportion for this window in the scroller layout (0-1; 0 keeps the global value).",
    min: 0,
    max: 1,
    examples: [0.6],
  },
  {
    key: "is_fullscreen",
    type: "bool",
    label: "Fullscreen",
    description: "Force fullscreen state.",
  },
  {
    key: "is_fake_fullscreen",
    type: "bool",
    label: "Fake Fullscreen",
    description: "Tell the client it is fullscreen while keeping its tiled size.",
  },
  {
    key: "global_key_binding",
    type: "key-binding",
    label: "Global Key Binding",
    description: "Global keybinding as MODS-KEY, for example ctrl+alt-o. Wayland apps only.",
    examples: ["ctrl+alt-o", "$binding"],
  },
];

export const RULES: readonly RuleDef[] = [
  {
    key: "monitor_rule",
    label: "Monitor Rules",
    description:
      "Match outputs by name, make, model, or serial. Every set field must match. The first match applies.",
    fields: [
      {
        key: "name",
        type: "string",
        label: "Name",
        description: "Match by monitor name (supports regex).",
        examples: ["eDP-1"],
      },
      {
        key: "make",
        type: "string",
        label: "Make",
        description: "Match by monitor manufacturer.",
      },
      {
        key: "model",
        type: "string",
        label: "Model",
        description: "Match by monitor model.",
      },
      {
        key: "serial",
        type: "string",
        label: "Serial",
        description: "Match by monitor serial number.",
      },
      {
        key: "rr",
        type: "enum",
        label: "Transform",
        description: "Monitor transform at startup. Option labels list each value.",
        options: [
          {
            value: "0",
            label: "Normal",
          },
          {
            value: "1",
            label: "90° CCW",
          },
          {
            value: "2",
            label: "180°",
          },
          {
            value: "3",
            label: "270° CCW",
          },
          {
            value: "4",
            label: "180° vertical flip",
          },
          {
            value: "5",
            label: "Flip + 90° CCW",
          },
          {
            value: "6",
            label: "Flip + 180°",
          },
          {
            value: "7",
            label: "Flip + 270° CCW",
          },
        ],
        numeric: true,
      },
      {
        key: "scale",
        type: "float",
        label: "Scale",
        description: "Monitor scale.",
        min: 0.001,
        max: 1000,
        examples: [1.5],
      },
      {
        key: "x",
        type: "int",
        label: "X",
        description: "X position.",
      },
      {
        key: "y",
        type: "int",
        label: "Y",
        description: "Y position.",
      },
      {
        key: "width",
        type: "int",
        label: "Width",
        description: "Monitor width in pixels.",
        min: 1,
        max: 2147483647,
      },
      {
        key: "height",
        type: "int",
        label: "Height",
        description: "Monitor height in pixels.",
        min: 1,
        max: 2147483647,
      },
      {
        key: "refresh",
        type: "float",
        label: "Refresh Rate",
        description: "Monitor refresh rate in Hz.",
        min: 0.001,
        max: 1000,
      },
      {
        key: "vrr",
        type: "bool",
        label: "VRR",
        description: "Turn on variable refresh rate.",
      },
      {
        key: "hdr",
        type: "bool",
        label: "HDR",
        description:
          "Enable HDR. Needs the Vulkan renderer (wl-only build). Not available on scenefx.",
      },
      {
        key: "hdr_min_lum",
        type: "float",
        label: "HDR Min Luminance",
        description:
          "Mastering display minimum luminance, cd/m² (0 = unset). No effect on wlroots 0.20.x.",
        min: 0,
        max: 10000,
      },
      {
        key: "hdr_max_lum",
        type: "float",
        label: "HDR Max Luminance",
        description: "Mastering display peak luminance, also sent as max_cll, cd/m² (0 = unset).",
        min: 0,
        max: 10000,
        examples: [600],
      },
      {
        key: "hdr_max_avg_lum",
        type: "float",
        label: "HDR Max Average Luminance",
        description: "Max frame-average light level (max_fall), cd/m² (0 = unset).",
        min: 0,
        max: 10000,
      },
      {
        key: "hdr_force",
        type: "bool",
        label: "Force HDR",
        description:
          "Skip the EDID BT.2020/PQ checks when hdr is on. HDR requires the wl-only Vulkan build.",
      },
      {
        key: "icc",
        type: "string",
        label: "ICC Profile",
        description: "Path to an ICC profile. Ignored when HDR is on.",
      },
      {
        key: "disable",
        type: "bool",
        label: "Disable",
        description: "Disable the monitor.",
      },
      {
        key: "primary",
        type: "bool",
        label: "Primary",
        description: "Make this monitor the X11 (RandR) primary output for XWayland.",
      },
      {
        key: "custom",
        type: "bool",
        label: "Custom Mode",
        description:
          "Custom display mode. Also requires width, height, and refresh. May cause a black screen.",
      },
    ],
    examples: [
      {
        name: "eDP-1",
        width: 1920,
        height: 1080,
        refresh: 60,
        x: 0,
        y: 0,
      },
    ],
  },
  {
    key: "tag_rule",
    label: "Tag Rules",
    description:
      "Per-tag layout and options. All matching rules apply in order. Later rules override earlier.",
    fields: [
      {
        key: "id",
        type: "tag-id",
        label: "Tag ID",
        description:
          "Tag id to match; 0 targets the special workspace (tag 0). Use * for all tags.",
        examples: [1],
      },
      {
        key: "layout_name",
        type: "enum",
        label: "Layout",
        description: "Layout to apply to this tag.",
        options: [
          {
            value: "tile",
            label: "tile",
          },
          {
            value: "scroller",
            label: "scroller",
          },
          {
            value: "grid",
            label: "grid",
          },
          {
            value: "monocle",
            label: "monocle",
          },
          {
            value: "deck",
            label: "deck",
          },
          {
            value: "center_tile",
            label: "center_tile",
          },
          {
            value: "right_tile",
            label: "right_tile",
          },
          {
            value: "vertical_scroller",
            label: "vertical_scroller",
          },
          {
            value: "vertical_tile",
            label: "vertical_tile",
          },
          {
            value: "vertical_grid",
            label: "vertical_grid",
          },
          {
            value: "vertical_deck",
            label: "vertical_deck",
          },
          {
            value: "dwindle",
            label: "dwindle",
          },
          {
            value: "fair",
            label: "fair",
          },
          {
            value: "vertical_fair",
            label: "vertical_fair",
          },
        ],
        examples: ["tile"],
      },
      {
        key: "monitor_name",
        type: "string",
        label: "Monitor Name",
        description: "Monitor name regex to match.",
      },
      {
        key: "monitor_make",
        type: "string",
        label: "Monitor Make",
        description: "Match by monitor manufacturer.",
      },
      {
        key: "monitor_model",
        type: "string",
        label: "Monitor Model",
        description: "Match by monitor model.",
      },
      {
        key: "monitor_serial",
        type: "string",
        label: "Monitor Serial",
        description: "Match by monitor serial number.",
      },
      {
        key: "no_render_border",
        type: "bool",
        label: "No Render Border",
        description: "Do not draw window borders on this tag.",
      },
      {
        key: "open_as_floating",
        type: "bool",
        label: "Open as Floating",
        description: "Open new windows floating on this tag.",
      },
      {
        key: "no_hide",
        type: "bool",
        label: "No Hide",
        description: "Keep the tag advertised to ext-workspace clients when it is empty.",
      },
      {
        key: "master_count",
        type: "int",
        label: "Master Count",
        description: "Number of master windows.",
        min: 1,
        max: 99,
      },
      {
        key: "master_factor",
        type: "float",
        label: "Master Factor",
        description: "Master area share of the layout (0.1-0.9).",
        min: 0.1,
        max: 0.9,
        examples: [0.6],
      },
      {
        key: "scroller_default_proportion",
        type: "float",
        label: "Scroller Proportion",
        description: "Default width proportion for new windows (0-1; 0 keeps the global value).",
        min: 0,
        max: 1,
        examples: [0.6],
      },
      {
        key: "scroller_default_proportion_single",
        type: "float",
        label: "Scroller Proportion (Single)",
        description:
          "Scroller proportion for a single window (0-1; 0 keeps the global value). Used when scroller_ignore_proportion_single is off.",
        min: 0,
        max: 1,
      },
      {
        key: "scroller_ignore_proportion_single",
        type: "bool",
        label: "Ignore Single Proportion",
        description: "Use the normal scroller proportion when only one window is open.",
      },
    ],
    examples: [
      {
        id: 1,
        layout_name: "tile",
      },
    ],
  },
  {
    key: "layer_rule",
    label: "Layer Rules",
    description: "Configure layer-shell surfaces such as bars, launchers, and notifications.",
    fields: [
      {
        key: "layer_name",
        type: "string",
        label: "Layer Name",
        description: "Layer surface name. Supports regex.",
        examples: ["rofi"],
      },
      {
        key: "animation_type_open",
        type: "enum",
        label: "Open Animation",
        description:
          "Layer surface open animation. Empty inherits the global setting. `none` disables it.",
        options: [
          {
            value: "",
            label: "Unset",
          },
          {
            value: "none",
            label: "None",
          },
          {
            value: "fade",
            label: "Fade",
          },
          {
            value: "slide",
            label: "Slide",
          },
          {
            value: "zoom",
            label: "Zoom",
          },
        ],
      },
      {
        key: "animation_type_close",
        type: "enum",
        label: "Close Animation",
        description:
          "Layer surface close animation. Empty inherits the global setting. `none` disables it.",
        options: [
          {
            value: "",
            label: "Unset",
          },
          {
            value: "none",
            label: "None",
          },
          {
            value: "fade",
            label: "Fade",
          },
          {
            value: "slide",
            label: "Slide",
          },
          {
            value: "zoom",
            label: "Zoom",
          },
        ],
      },
      {
        key: "shield_when_capture",
        type: "bool",
        label: "Shield When Captured",
        description:
          "Black out this layer while a screen capture is active; pair with no_animation:1.",
      },
      {
        key: "no_blur",
        type: "bool",
        label: "No Blur",
        description: "Disable blur for this layer.",
      },
      {
        key: "no_animation",
        type: "bool",
        label: "No Animation",
        description: "Disable layer animations.",
      },
      {
        key: "no_shadow",
        type: "bool",
        label: "No Shadow",
        description: "Disable the layer shadow.",
      },
    ],
    examples: [
      {
        layer_name: "rofi",
        animation_type_open: "zoom",
      },
    ],
  },
  {
    key: "window_rule",
    label: "Window Rules",
    description:
      "Set window properties on open. app_id and title are regex. When both are set, both must match.",
    fields: WINDOW_RULE_FIELDS,
    examples: [
      {
        app_id: "firefox",
        is_floating: true,
      },
    ],
  },
  {
    key: "window_rule_once",
    label: "Window Rules (Once)",
    description:
      "Set window properties only on first open. app_id and title are regex; both must match when set.",
    fields: WINDOW_RULE_FIELDS,
    examples: [
      {
        title: "Picture-in-Picture",
        is_floating: true,
      },
    ],
  },
  {
    key: "device_rule",
    label: "Device Rules",
    description:
      "Device overrides by name or type. kb_* and repeat_* give a keyboard its own keymap and repeat rate.",
    fields: [
      {
        key: "name",
        type: "device-name",
        label: "Name",
        description: "Match by input device name or vendor:product:name.",
        examples: ["AT Translated Set 2 keyboard"],
      },
      {
        key: "type",
        type: "enum",
        label: "Device Type",
        description: "Device type to match. touchpad is a deprecated alias for trackpad.",
        options: [
          {
            value: "keyboard",
            label: "Keyboard",
          },
          {
            value: "pointer",
            label: "Pointer",
          },
          {
            value: "trackpad",
            label: "Trackpad",
          },
          {
            value: "touch",
            label: "Touch",
          },
          {
            value: "switch",
            label: "Switch",
          },
          {
            value: "tablet",
            label: "Tablet",
          },
          {
            value: "pad",
            label: "Pad",
          },
          {
            value: "touchpad",
            label: "Touchpad",
          },
        ],
      },
      {
        key: "repeat_rate",
        type: "int",
        label: "Repeat Rate",
        description: "Key repeat rate per second.",
        min: 0,
        max: 1000,
        examples: [40],
      },
      {
        key: "repeat_delay",
        type: "int",
        label: "Repeat Delay",
        description: "Delay before a held key repeats (ms).",
        min: 0,
        max: 10000,
      },
      {
        key: "kb_rules",
        type: "string",
        label: "Keyboard Rules",
        description: "XKB rules file for this keyboard.",
      },
      {
        key: "kb_model",
        type: "string",
        label: "Keyboard Model",
        description: "XKB model for this keyboard.",
      },
      {
        key: "kb_layout",
        type: "string",
        label: "Keyboard Layout",
        description: "Keyboard layout code, e.g. us or ru.",
        examples: ["us"],
      },
      {
        key: "kb_variant",
        type: "string",
        label: "Keyboard Variant",
        description: "Keyboard layout variant, e.g. dvorak or colemak.",
      },
      {
        key: "kb_options",
        type: "string",
        label: "Keyboard Options",
        description: "XKB options, e.g. caps:escape.",
      },
      {
        key: "natural_scrolling",
        type: "bool",
        label: "Natural Scrolling",
        description: "Invert scrolling direction for this device.",
      },
      {
        key: "accel_profile",
        type: "enum",
        label: "Acceleration Profile",
        description: "Pointer acceleration profile: 0 none, 1 flat, 2 adaptive.",
        options: [
          {
            value: "0",
            label: "None",
          },
          {
            value: "1",
            label: "Flat",
          },
          {
            value: "2",
            label: "Adaptive",
          },
        ],
        numeric: true,
      },
      {
        key: "accel_speed",
        type: "float",
        label: "Acceleration Speed",
        description: "Pointer speed from -1.0 to 1.0.",
        min: -1,
        max: 1,
        examples: [0.1],
      },
      {
        key: "left_handed",
        type: "bool",
        label: "Left Handed",
        description: "Swap left and right buttons.",
      },
      {
        key: "middle_button_emulation",
        type: "bool",
        label: "Middle Button Emulation",
        description: "Emulate the middle button.",
      },
      {
        key: "scroll_method",
        type: "enum",
        label: "Scroll Method",
        description: "Scroll method: 0 disabled, 1 two-finger, 2 edge, 4 button.",
        options: [
          {
            value: "0",
            label: "Disabled",
          },
          {
            value: "1",
            label: "Two-finger",
          },
          {
            value: "2",
            label: "Edge",
          },
          {
            value: "4",
            label: "Button",
          },
        ],
        numeric: true,
      },
      {
        key: "scroll_button",
        type: "int",
        label: "Scroll Button",
        description: "Button code for button scrolling. 0 disables it.",
      },
      {
        key: "click_method",
        type: "enum",
        label: "Click Method",
        description: "Click method: 0 no emulation, 1 button areas, 2 clickfinger.",
        options: [
          {
            value: "0",
            label: "No emulation",
          },
          {
            value: "1",
            label: "Button areas",
          },
          {
            value: "2",
            label: "Clickfinger",
          },
        ],
        numeric: true,
      },
      {
        key: "send_events_mode",
        type: "enum",
        label: "Send Events Mode",
        description: "Send events: 0 on, 1 off, 2 off when an external pointer is present.",
        options: [
          {
            value: "0",
            label: "Enabled",
          },
          {
            value: "1",
            label: "Disabled",
          },
          {
            value: "2",
            label: "Disabled when external pointer present",
          },
        ],
        numeric: true,
      },
      {
        key: "tap_to_click",
        type: "bool",
        label: "Tap to Click",
        description: "Tap to trigger a left click.",
      },
      {
        key: "tap_and_drag",
        type: "bool",
        label: "Tap and Drag",
        description: "Tap and hold to drag items.",
      },
      {
        key: "drag_lock",
        type: "bool",
        label: "Drag Lock",
        description: "Lock dragging after tapping.",
      },
      {
        key: "button_map",
        type: "enum",
        label: "Button Map",
        description: "Tap mapping: 0 left/right/middle, 1 left/middle/right.",
        options: [
          {
            value: "0",
            label: "Left/right/middle",
          },
          {
            value: "1",
            label: "Left/middle/right",
          },
        ],
        numeric: true,
      },
      {
        key: "disable_while_typing",
        type: "bool",
        label: "Disable While Typing",
        description: "Disable the trackpad while typing.",
      },
      {
        key: "monitor",
        type: "string",
        label: "Monitor",
        description:
          "Pin touch or tablet input to one output. Unset touch follows focus. Unset tablet stays unmapped.",
        examples: ["HDMI-A-1"],
      },
      {
        key: "map_focus_monitor",
        type: "bool",
        label: "Map to Focused Monitor",
        description: "Make the tablet follow the currently focused monitor.",
      },
    ],
    examples: [
      {
        name: "AT Translated Set 2 keyboard",
        kb_layout: "us",
      },
    ],
  },
];
