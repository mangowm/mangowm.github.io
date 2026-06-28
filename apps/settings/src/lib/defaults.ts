import type { ConfigData } from "./config-types";

export const DEFAULTS: ConfigData = {
  // Animations
  animations: ["1"],
  layer_animations: ["0"],
  animation_fade_in: ["1"],
  animation_fade_out: ["1"],
  tag_animation_direction: ["1"],
  zoom_initial_ratio: ["0.4"],
  zoom_end_ratio: ["0.8"],
  fadein_begin_opacity: ["0.5"],
  fadeout_begin_opacity: ["0.5"],
  animation_duration_move: ["500"],
  animation_duration_open: ["400"],
  animation_duration_tag: ["300"],
  animation_duration_close: ["300"],
  animation_duration_focus: ["0"],
  animation_type_open: [""],
  animation_type_close: [""],
  layer_animation_type_open: [""],
  layer_animation_type_close: [""],

  // Curves
  animation_curve_move: ["0.46,1.0,0.29,0.99"],
  animation_curve_open: ["0.46,1.0,0.29,0.99"],
  animation_curve_tag: ["0.46,1.0,0.29,0.99"],
  animation_curve_close: ["0.46,1.0,0.29,0.99"],
  animation_curve_focus: ["0.46,1.0,0.29,0.99"],
  animation_curve_opafadein: ["0.46,1.0,0.29,0.99"],
  animation_curve_opafadeout: ["0.5,0.5,0.5,0.5"],

  // Blur & Window Effects
  blur: ["0"],
  blur_layer: ["0"],
  blur_optimized: ["1"],
  blur_params_num_passes: ["1"],
  blur_params_radius: ["5"],
  blur_params_noise: ["0.02"],
  blur_params_brightness: ["0.9"],
  blur_params_contrast: ["0.9"],
  blur_params_saturation: ["1.2"],
  border_radius: ["0"],
  no_radius_when_single: ["0"],
  shadows: ["0"],
  shadow_only_floating: ["1"],
  layer_shadows: ["0"],
  shadows_size: ["10"],
  shadows_blur: ["15"],
  shadows_position_x: ["0"],
  shadows_position_y: ["0"],
  focused_opacity: ["1.0"],
  unfocused_opacity: ["1.0"],

  // Scroller
  scroller_structs: ["20"],
  scroller_default_proportion: ["0.9"],
  scroller_default_proportion_single: ["1.0"],
  scroller_ignore_proportion_single: ["1"],
  scroller_focus_center: ["0"],
  scroller_prefer_center: ["0"],
  scroller_prefer_overspread: ["1"],
  edge_scroller_pointer_focus: ["1"],
  edge_scroller_focus_allow_speed: ["0.0"],

  // Master-Stack
  new_is_master: ["1"],
  default_mfact: ["0.55"],
  default_nmaster: ["1"],
  center_master_overspread: ["0"],
  center_when_single_stack: ["1"],

  // Dwindle
  dwindle_vsplit: ["1"],
  dwindle_hsplit: ["1"],
  dwindle_preserve_split: ["0"],
  dwindle_smart_split: ["0"],
  dwindle_smart_resize: ["0"],
  dwindle_drop_simple_split: ["1"],
  dwindle_manual_split: ["0"],
  dwindle_split_ratio: ["0.5"],

  // Overview
  ov_tab_mode: ["1"],
  ov_no_resize: ["1"],
  hotarea_size: ["10"],
  hotarea_corner: ["2"],
  enable_hotarea: ["0"],
  overviewgappi: ["5"],
  overviewgappo: ["30"],

  // Gaps & Borders
  gappih: ["5"],
  gappiv: ["5"],
  gappoh: ["10"],
  gappov: ["10"],
  borderpx: ["4"],
  no_border_when_single: ["0"],
  smartgaps: ["0"],

  // Misc
  sloppyfocus: ["1"],
  warpcursor: ["1"],
  focus_on_activate: ["1"],
  focus_cross_monitor: ["0"],
  focus_cross_tag: ["0"],
  exchange_cross_monitor: ["0"],
  axis_bind_apply_timeout: ["100"],
  idleinhibit_ignore_visible: ["0"],
  cursor_hide_timeout: ["0"],
  cursor_hide_on_keypress: ["0"],
  enable_floating_snap: ["0"],
  snap_distance: ["30"],
  drag_tile_to_tile: ["0"],
  drag_tile_small: ["1"],
  drag_tile_refresh_interval: ["8.0"],
  drag_floating_refresh_interval: ["8.0"],
  drag_corner: ["3"],
  drag_warp_cursor: ["1"],
  swipe_min_threshold: ["1"],
  scratchpad_width_ratio: ["0.8"],
  scratchpad_height_ratio: ["0.9"],
  scratchpad_cross_monitor: ["0"],
  single_scratchpad: ["1"],

  // Input — keyboard
  repeat_rate: ["25"],
  repeat_delay: ["600"],
  numlockon: ["0"],
  cursor_size: ["24"],

  // Input — trackpad
  trackpad_accel_profile: ["2"],
  trackpad_natural_scrolling: ["0"],
  tap_to_click: ["1"],
  tap_and_drag: ["1"],
  drag_lock: ["1"],
  disable_trackpad: ["0"],
  disable_while_typing: ["1"],
  left_handed: ["0"],
  middle_button_emulation: ["0"],
  trackpad_scroll_factor: ["1.0"],
  trackpad_accel_speed: ["0.0"],
  button_map: ["0"],

  // Input — mouse
  mouse_natural_scrolling: ["0"],
  mouse_accel_profile: ["2"],
  mouse_accel_speed: ["0.0"],
  axis_scroll_factor: ["1.0"],
  scroll_method: ["1"],
  scroll_button: ["274"],
  click_method: ["1"],
  send_events_mode: ["0"],

  // Behaviour — xwayland
  xwayland_persistence: ["1"],

  // Behaviour — security
  allow_shortcuts_inhibit: ["1"],
  allow_lock_transparent: ["0"],

  // Behaviour — rendering
  allow_tearing: ["0"],
  syncobj_enable: ["0"],

  // Colors (from compositor set_value_default — note: these differ from assets/config.conf)
  rootcolor: ["0x323232ff"],
  bordercolor: ["0x444444ff"],
  dropcolor: ["0xd5899d80"],
  splitcolor: ["0xeb441eff"],
  focuscolor: ["0xc66b25ff"],
  maximizescreencolor: ["0x89aa61ff"],
  urgentcolor: ["0xad401fff"],
  scratchpadcolor: ["0x516c93ff"],
  globalcolor: ["0xb153a7ff"],
  overlaycolor: ["0x14a57cff"],
  shadowscolor: ["0x000000ff"],
};
