# Workspace

Configure how monitors, tags, and scratchpads interact.

## Settings

### Cross-Monitor

| Option                     | Default   | Description                                                 |
| -------------------------- | --------- | ----------------------------------------------------------- |
| `exchange_cross_monitor`   | `0` (off) | Allow swapping window positions between different monitors. |
| `scratchpad_cross_monitor` | `0` (off) | Scratchpad windows can appear on any monitor.               |

### Scratchpad

| Option              | Default  | Description                                                                 |
| ------------------- | -------- | --------------------------------------------------------------------------- |
| `single_scratchpad` | `1` (on) | Only one scratchpad window at a time. Opening a new one hides the previous. |

### Tags

| Option                 | Default   | Description                                                                |
| ---------------------- | --------- | -------------------------------------------------------------------------- |
| `tag_carousel`         | `0` (off) | Tags wrap around — moving past the last tag returns to the first.          |
| `view_current_to_back` | `0` (off) | Viewing the current tag sends it to back and switches to the previous tag. |
