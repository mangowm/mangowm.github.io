## General Animation Settings

Controls the master toggle, animation types, fade effects, zoom ratios, and tag-switch direction.

### Master Controls

- **`animations`** – Master toggle for all window animations. Set to `0` to disable all animations globally.
- **`layer_animations`** – Enable animations for layer-shell surfaces (panels, notifications, etc.).
- **`animation_fade_in`** – Fade windows in when they appear.
- **`animation_fade_out`** – Fade windows out when they close.

### Animation Types

- **`animation_type_open`** – Animation style when a window opens. Options: `none`, `fade`, `zoom`, `slide`.
- **`animation_type_close`** – Animation style when a window closes. Options: `none`, `fade`, `zoom`, `slide`.
- **`layer_animation_type_open`** – Animation style when a layer-surface opens. Options: `none`, `fade`, `zoom`, `slide`.
- **`layer_animation_type_close`** – Animation style when a layer-surface closes. Options: `none`, `fade`, `zoom`, `slide`.

### Tag Switch Direction

- **`tag_animation_direction`** – Direction of the tag-switch animation. `0` = horizontal, `1` = vertical.

### Zoom & Opacity Parameters

- **`zoom_initial_ratio`** – Starting scale factor for zoom animations (0.1–1.0).
- **`zoom_end_ratio`** – Ending scale factor for zoom animations (0.1–1.0).
- **`fadein_begin_opacity`** – Starting opacity for fade-in animations (0.0–1.0).
- **`fadeout_begin_opacity`** – Starting opacity for fade-out animations (0.0–1.0).
