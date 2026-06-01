# Miscellaneous

System-level policies for idle inhibition, security, and rendering.

## Settings

### Idle & Power

| Option                       | Default   | Description                                                                                       |
| ---------------------------- | --------- | ------------------------------------------------------------------------------------------------- |
| `idleinhibit_ignore_visible` | `0` (off) | Only fullscreen windows may inhibit screen blanking. Visible tiled/floating requests are ignored. |

### Security

| Option                    | Default       | Description                                                              |
| ------------------------- | ------------- | ------------------------------------------------------------------------ |
| `allow_shortcuts_inhibit` | `1` (enabled) | Let applications (games, VMs) suspend compositor keybindings.            |
| `allow_lock_transparent`  | `0` (off)     | Permit transparent/translucent lockscreens. Disable for better security. |

### Rendering

| Option          | Default        | Range | Description                                                                                                        |
| --------------- | -------------- | ----- | ------------------------------------------------------------------------------------------------------------------ |
| `allow_tearing` | `0` (disabled) | 0–2   | 0=never tear, 1=always permit tearing, 2=fullscreen only. Tearing reduces latency at the cost of visual artifacts. |
