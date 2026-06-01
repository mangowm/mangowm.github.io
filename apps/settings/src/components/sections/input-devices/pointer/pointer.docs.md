# Pointer / Mouse

Configure mouse and pointer device behavior.

## Scrolling

| Option                    | Description                                                                                                                     |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `mouse_natural_scrolling` | Reverse scroll direction for mouse (0 or 1). Default: 0.                                                                        |
| `axis_scroll_factor`      | Multiplier for axis (wheel) scroll events. Mango range: 0.1–10.0. Default: 1.0.                                                 |
| `scroll_method`           | Trackpad scroll method: `0` = No scroll, `1` = Two-Finger, `2` = Edge, `3` = On-Button-Down, `4` = Custom. Default: Two-Finger. |
| `scroll_button`           | Button code for on-button-down scrolling. Linux input event codes 272–279. Default: 274 (BTN_MIDDLE).                           |

## Acceleration

| Option                | Description                                                                              |
| --------------------- | ---------------------------------------------------------------------------------------- |
| `mouse_accel_profile` | Mouse acceleration profile: `0` = Flat, `1` = Adaptive, `2` = Custom. Default: Adaptive. |
| `mouse_accel_speed`   | Pointer acceleration speed. Mango range: -1.0 to 1.0. Default: 0.0.                      |

## Clicking

| Option             | Description                                                                                                               |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| `click_method`     | How clicks are detected: `0` = None, `1` = Clickfinger (finger count), `2` = Button Areas (zones). Default: Button Areas. |
| `send_events_mode` | When to send pointer events: `0` = Enabled, `1` = Disabled w/ External Mouse, `2` = Disabled. Default: Enabled.           |

## Button Behavior

| Option                    | Description                                                               |
| ------------------------- | ------------------------------------------------------------------------- |
| `disable_while_typing`    | Temporarily disable touchpad while typing (0 or 1). Default: 1 (enabled). |
| `left_handed`             | Swap left/right mouse buttons (0 or 1). Default: 0.                       |
| `middle_button_emulation` | Emulate middle-click with left+right simultaneously (0 or 1). Default: 0. |
