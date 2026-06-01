# Focus

Control how windows gain focus and where focus can travel.

## Settings

### Focus Behaviour

| Option              | Default  | Description                                                            |
| ------------------- | -------- | ---------------------------------------------------------------------- |
| `sloppyfocus`       | `1` (on) | Focus follows the mouse — hover a window to focus it without clicking. |
| `warpcursor`        | `1` (on) | Move the cursor to the center of the newly focused window.             |
| `focus_on_activate` | `1` (on) | Focus a window immediately when it requests activation (urgency hint). |

### Boundaries

| Option                | Default   | Description                                                  |
| --------------------- | --------- | ------------------------------------------------------------ |
| `focus_cross_monitor` | `0` (off) | Allow directional focus operations to move between monitors. |
| `focus_cross_tag`     | `0` (off) | Allow focus to move between windows on different tags.       |
