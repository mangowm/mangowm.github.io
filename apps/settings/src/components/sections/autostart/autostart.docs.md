## exec-once

Each command runs once on startup in the order listed.

| Command     | Behavior                               |
| :---------- | :------------------------------------- |
| `exec-once` | Runs **only once** when mangowm starts |
| `exec`      | Runs every time the config is reloaded |

> **Tip:** Use absolute paths to avoid resolution issues. Programs like status bars, wallpapers, and notification daemons belong here.

## Examples

```ini
exec-once=waybar
exec-once=swaybg -i ~/.config/mango/wallpaper/room.png
exec=bash ~/.config/mango/reload-settings.sh
```
