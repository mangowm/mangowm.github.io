## Scroller

The scroller layout (symbol `S`) arranges windows along a scrollable axis. Windows can be scrolled through horizontally or vertically, with configurable proportions and focus behavior.

### Keys

| Key                                  | Default | Description                                                                       |
| :----------------------------------- | :------ | :-------------------------------------------------------------------------------- |
| `scroller_structs`                   | `20`    | Number of structural positions available in the scroller (0–1000).                |
| `scroller_default_proportion`        | `0.9`   | Default proportion of the container occupied by each tiled window (0.1–1.0).      |
| `scroller_default_proportion_single` | `1.0`   | Proportion when only one window is on the tag (0.1–1.0).                          |
| `scroller_ignore_proportion_single`  | `1`     | Ignore proportion settings when only one window is visible.                       |
| `scroller_focus_center`              | `0`     | Focus the window at the center of the viewport when scrolling.                    |
| `scroller_prefer_center`             | `0`     | Prefer to keep the focused window centered in the viewport.                       |
| `scroller_prefer_overspread`         | `1`     | Prefer to overspread windows across the available space.                          |
| `scroller_proportion_preset`         | —       | Comma-separated list of preset proportion values (e.g. `0.3,0.5,0.7`).            |
| `edge_scroller_pointer_focus`        | `1`     | Automatically focus the adjacent window when the pointer reaches the screen edge. |
| `edge_scroller_focus_allow_speed`    | `0`     | Maximum pointer speed for edge-triggered focus changes (0 = always allowed).      |

### Examples

```ini
# Tighter proportions, no edge scrolling
scroller_default_proportion=0.6
scroller_default_proportion_single=0.8
edge_scroller_pointer_focus=0
scroller_proportion_preset=0.3,0.5,0.7,0.9
```
