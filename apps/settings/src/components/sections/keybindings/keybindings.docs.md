# Keybindings

Define keyboard shortcuts that control every aspect of mangowm — window management, navigation, layout control, spawning applications, and more.

## Config Syntax

Each binding follows the format:

```
bind[flags] = modifiers+key,dispatcher,arg1,arg2,...
```

| Part          | Description                                                           |
| :------------ | :-------------------------------------------------------------------- |
| `bind`        | Config key — the base keyword for keyboard bindings.                  |
| `[flags]`     | Optional suffix letters that modify when/how the binding fires.       |
| `modifiers`   | Modifier key combination, e.g. `super+ctrl+alt`. Use `none` for bare. |
| `key`         | XKB keysym name, e.g. `Return`, `Left`, `a`, `space`, `Escape`.      |
| `dispatcher`  | Action to execute, e.g. `spawn`, `focusdir`, `killclient`.            |
| `arg1,...`    | Comma-separated arguments passed to the dispatcher.                   |

### Examples

```ini
# Launch a terminal with Super+Return
bind = super,Return,spawn,foot

# Focus the window to the left with Super+Left
bind = super,Left,focusdir,left

# Switch to tag 3 with super+3
bind = super,3,view,3

# Close focused window with Super+Q
bind = super,q,killclient
```

## Bind Keyword Flags

Append letters to `bind` to change firing behaviour:

| Keyword     | Flags           | Behaviour                                                          |
| :---------- | :--------------- | :----------------------------------------------------------------- |
| `bind`      | *(none)*         | Fire on key press, keysym depends on active keyboard layout.       |
| `binds`     | `s` (sym)        | Match the raw keysym, ignoring the active keyboard layout.         |
| `bindl`     | `l` (lock)       | Allow the binding to fire while the compositor session is locked.  |
| `bindr`     | `r` (release)    | Fire when the key is **released** instead of pressed.              |
| `bindp`     | `p` (pass)       | Fire the binding **and** pass the keypress through to the client.  |
| `bindlr`    | `l` + `r`        | Fire on release while the session is locked.                       |
| `bindrs`    | `r` + `s`        | Fire on release with strict keysym matching.                       |
| `bindsr`    | `s` + `r`        | *(same as `bindrs`, order independent)*                            |

## Modifier Keys

| Modifier   | Typical Key   |
| :--------- | :------------ |
| `super`    | Windows/Command key |
| `ctrl`     | Control key   |
| `alt`      | Alt key       |
| `shift`    | Shift key     |
| `hyper`    | Hyper key (less common) |

Modifiers are joined with `+`. Use `none` (or omit) when no modifier is required (e.g. `bind = none,F11,fullscreen`).

## Keybinding Modes (Submaps)

Group bindings under named modes with the `keymode` directive. Bindings outside any `keymode` belong to the `default` mode.

```ini
# Default mode (used unless another mode is active)
bind = super,Return,spawn,foot
bind = super,q,killclient

# Resize mode — only active after setkeymode(resize)
keymode = resize
bind = none,h,movewin,-10,0
bind = none,l,movewin,+10,0
bind = none,Escape,setkeymode,default
```

Switch between modes at runtime with the `setkeymode` dispatcher.

## Dispatcher Actions

Dispatchers are organised into categories. Select one in the **Trigger Action** field when creating or editing a binding.

### Spawn

| Dispatcher         | Arguments                   | Description                                          |
| :----------------- | :-------------------------- | :--------------------------------------------------- |
| `spawn`            | `command`                   | Execute a command.                                   |
| `spawn_shell`      | `command`                   | Execute a shell command (supports pipes, `&&`, `;`). |
| `spawn_on_empty`   | `command, tag`              | Execute only if the specified tag (1-9) is empty.    |

### Window

| Dispatcher              | Description                                        |
| :---------------------- | :------------------------------------------------- |
| `killclient`            | Close the focused window.                          |
| `togglefloating`        | Toggle floating state of the focused window.       |
| `toggle_all_floating`   | Toggle floating state for all visible clients.     |
| `togglefullscreen`      | Toggle fullscreen mode.                            |
| `togglefakefullscreen`  | Toggle fake fullscreen (stays within monitor).     |
| `togglemaximizescreen`  | Maximize while keeping decorations visible.        |
| `toggleglobal`          | Pin window to all tags (stick across tag switches).|
| `toggle_render_border`  | Toggle border rendering for the focused window.    |
| `centerwin`             | Center the floating window on screen.              |
| `toggleoverlay`         | Toggle always-on-top overlay state.                |

### Navigation

| Dispatcher              | Arguments                | Description                                         |
| :---------------------- | :----------------------- | :-------------------------------------------------- |
| `focusdir`              | `left/right/up/down`     | Focus the nearest window in a direction.            |
| `focusstack`            | `next/prev`              | Cycle focus in the stacking order.                  |
| `focuslast`             | —                        | Focus the previously active window.                 |
| `focusid`               | —                        | Focus a specific window by its client ID.           |
| `exchange_client`       | `left/right/up/down`     | Swap focused window with neighbour in a direction.  |
| `exchange_stack_client` | `next/prev`              | Swap position in the stacking order.                |
| `zoom`                  | —                        | Swap the focused window with the master window.     |

### View

| Dispatcher                  | Arguments                | Description                                         |
| :-------------------------- | :----------------------- | :-------------------------------------------------- |
| `view`                      | `tag, synctag?`          | Switch to a tag (1-9, mask like `1|3|5`, or special). |
| `viewtoleft`                | `synctag?`               | View the previous tag.                              |
| `viewtoright`               | `synctag?`               | View the next tag.                                  |
| `viewtoleft_have_client`    | `synctag?`               | View previous tag and focus a client if present.    |
| `viewtoright_have_client`   | `synctag?`               | View next tag and focus a client if present.        |
| `viewcrossmon`              | `tag, monitor?`          | View a tag on a specific monitor.                   |
| `toggleview`                | `tag`                    | Toggle a tag's visibility (1-9).                    |
| `comboview`                 | `tag`                    | Combo-key multi-tag navigation.                     |

### Tag

| Dispatcher              | Arguments                | Description                                         |
| :---------------------- | :----------------------- | :-------------------------------------------------- |
| `tag`                   | `tag, synctag?`          | Move focused window to a tag (1-9).                 |
| `tagsilent`             | `tag`                    | Move window to a tag without switching focus.       |
| `tagtoleft`             | `synctag?`               | Move window to the previous tag.                    |
| `tagtoright`            | `synctag?`               | Move window to the next tag.                        |
| `tagcrossmon`           | `tag, monitor?`          | Move window to a tag on another monitor.            |
| `toggletag`             | `tag`                    | Toggle a tag on the focused window.                 |

### Monitor

| Dispatcher              | Arguments                | Description                                         |
| :---------------------- | :----------------------- | :-------------------------------------------------- |
| `focusmon`              | `direction/name`         | Focus a monitor by direction or name.               |
| `tagmon`                | `direction/name, keeptag?` | Move window to a monitor.                        |
| `disable_monitor`       | `monitor`                | Power off a monitor.                                |
| `enable_monitor`        | `monitor`                | Power on a monitor.                                 |
| `toggle_monitor`        | `monitor`                | Toggle monitor power state.                         |

### Layout

| Dispatcher                    | Arguments                | Description                                         |
| :---------------------------- | :----------------------- | :-------------------------------------------------- |
| `setlayout`                   | `layout`                 | Switch to a specific layout by name.                |
| `switch_layout`               | —                        | Cycle through layouts (restrict via layout toggle). |
| `incnmaster`                  | `delta`                  | Change the number of master windows (+1/-1).        |
| `setmfact`                    | `ratio`                  | Adjust master area ratio (±0.05).                   |
| `set_proportion`              | `proportion`             | Set scroller window proportion (0.0–1.0).           |
| `switch_proportion_preset`    | `next/prev`              | Cycle scroller proportion presets.                  |
| `scroller_stack`              | `left/right/up/down`     | Move a window into/out of the scroller stack.       |
| `incgaps`                     | `delta`                  | Adjust gap size by a relative value (±N).           |
| `togglegaps`                  | —                        | Toggle gaps on and off.                             |
| `dwindle_toggle_split_direction` | —                     | Toggle dwindle split direction.                     |
| `dwindle_split_horizontal`    | —                        | Set dwindle split to horizontal.                    |
| `dwindle_split_vertical`      | —                        | Set dwindle split to vertical.                      |

### Floating

| Dispatcher              | Arguments                | Description                                         |
| :---------------------- | :----------------------- | :-------------------------------------------------- |
| `smartmovewin`          | `direction`              | Move floating window by snap distance.              |
| `smartresizewin`        | `direction`              | Resize floating window by snap distance.            |
| `movewin`               | `x, y`                   | Move floating window by absolute/relative offset.   |
| `resizewin`             | `w, h`                   | Resize window by absolute/relative dimensions.      |
| `moveresize`            | `curmove/curresize`      | Interactive mouse move or resize (for mousebinds).  |

### Scratchpad

| Dispatcher                 | Arguments                | Description                                      |
| :------------------------- | :----------------------- | :----------------------------------------------- |
| `minimized`                | —                        | Minimize window to scratchpad.                   |
| `restore_minimized`        | —                        | Restore most recently minimized window.          |
| `toggle_scratchpad`        | —                        | Toggle the global scratchpad window.             |
| `toggle_named_scratchpad`  | `id, title?, spawn?`     | Toggle a named scratchpad (launch if missing).   |

### System

| Dispatcher                   | Arguments                | Description                                      |
| :--------------------------- | :----------------------- | :----------------------------------------------- |
| `reload_config`              | —                        | Hot-reload the configuration file.               |
| `quit`                       | —                        | Exit mangowm.                                    |
| `toggleoverview`             | `tabmode?`               | Toggle overview/tab mode (0=grid, 1=tab).        |
| `create_virtual_output`      | —                        | Create a headless virtual monitor.               |
| `destroy_all_virtual_output` | —                        | Destroy all headless virtual monitors.           |
| `toggle_trackpad_enable`     | —                        | Toggle the trackpad on and off.                  |
| `setkeymode`                 | `mode`                   | Switch to a keybinding mode (submap).            |
| `switch_keyboard_layout`     | `index?`                 | Switch keyboard layout (optional index).         |
| `setoption`                  | `key, value`             | Temporarily set a config option at runtime.      |
| `chvt`                       | `vt`                     | Switch to a virtual terminal (1-12).             |

## Conflict Detection

When two bindings share the same combination (mods + key) in the same mode, a conflict is flagged. The **Conflicts** button highlights all conflicting entries; saving a new binding automatically removes any existing bindings that conflict.
