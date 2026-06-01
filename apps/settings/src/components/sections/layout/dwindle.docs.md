## Dwindle

The dwindle layout (symbol `DW`) arranges windows in a spiral / alternating-split pattern, similar to dwm's default tiling algorithm.

### Keys

| Key                         | Default | Description                                                                 |
| :-------------------------- | :------ | :-------------------------------------------------------------------------- |
| `dwindle_vsplit`            | `1`     | Vertical split policy: `0` = off, `1` = smart (automatic), `2` = force.     |
| `dwindle_hsplit`            | `1`     | Horizontal split policy: `0` = off, `1` = smart (automatic), `2` = force.   |
| `dwindle_preserve_split`    | `0`     | Keep the current split direction when inserting a new window.               |
| `dwindle_smart_split`       | `0`     | Automatically choose split direction based on window dimensions.            |
| `dwindle_smart_resize`      | `0`     | Intelligently resize adjacent windows during resize operations.             |
| `dwindle_drop_simple_split` | `1`     | Fall back to a simple split when smart split cannot determine a direction.  |
| `dwindle_manual_split`      | `0`     | Require explicit split direction input instead of automatic detection.      |
| `dwindle_split_ratio`       | `0.5`   | Proportion of space allotted to the first child when splitting (0.05–0.95). |

### Examples

```ini
# Aggressive smart dwindle: 60/40 splits, smart split enabled
dwindle_vsplit=2
dwindle_hsplit=2
dwindle_smart_split=1
dwindle_split_ratio=0.60
```
