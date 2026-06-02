# Trackpad

Configure trackpad input behavior, acceleration, and gestures.

## Scrolling

| Option                       | Description                                                                |
| ---------------------------- | -------------------------------------------------------------------------- |
| `trackpad_natural_scrolling` | Reverse scroll direction for trackpad (0 or 1). Default: 0.                |
| `trackpad_scroll_factor`     | Multiplier for trackpad scroll speed. Mango range: 0.1–10.0. Default: 1.0. |

## Acceleration

| Option                   | Description                                                                                 |
| ------------------------ | ------------------------------------------------------------------------------------------- |
| `trackpad_accel_profile` | Trackpad acceleration profile: `0` = Flat, `1` = Adaptive, `2` = Custom. Default: Adaptive. |
| `trackpad_accel_speed`   | Trackpad pointer acceleration speed. Mango range: -1.0 to 1.0. Default: 0.0.                |

## Gestures & Taps

| Option                | Description                                                                                                                                                       |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tap_to_click`        | Enable tap-to-click (0 or 1). Default: 1 (enabled).                                                                                                               |
| `tap_and_drag`        | Enable tap-and-drag gestures (0 or 1). Default: 1 (enabled).                                                                                                      |
| `drag_lock`           | Enable drag lock — lift finger without cancelling drag (0 or 1). Default: 1 (enabled).                                                                            |
| `button_map`          | Tap gesture button mapping: `0` = LMR (1-finger=Left, 2-finger=Middle, 3-finger=Right), `1` = LRM (1-finger=Left, 2-finger=Right, 3-finger=Middle). Default: LRM. |
| `swipe_min_threshold` | Minimum pointer movement in pixels to trigger a swipe gesture. Mango range: 1–1000. Default: 1.                                                                   |

## Device

| Option             | Description                                                    |
| ------------------ | -------------------------------------------------------------- |
| `disable_trackpad` | Completely disable the built-in trackpad (0 or 1). Default: 0. |
