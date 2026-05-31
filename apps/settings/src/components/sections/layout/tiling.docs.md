## Tiling

The main tiling layout (symbol `T`) splits the screen into a **master area** and a **stack area**. The master holds the primary window(s); remaining windows are stacked in the remaining space.

Variants like centered tiling (`CT`), right-tile (`RT`), and vertical tiling (`VT`) all inherit these settings.

### Keys

| Key | Default | Description |
| :--- | :--- | :--- |
| `new_is_master` | `1` | New windows open in the master area instead of the stack. |
| `default_mfact` | `0.55` | Proportion of screen width allocated to the master area (0.10–0.90). |
| `default_nmaster` | `1` | Number of windows kept in the master area (1–1000). |
| `center_master_overspread` | `0` | Center the master window when it overspreads its allotted space. |
| `center_when_single_stack` | `1` | Center the single window in the stack area. |

### Examples

```ini
# 50/50 split, 2 masters, new windows go to stack
default_mfact=0.50
default_nmaster=2
new_is_master=0
```
