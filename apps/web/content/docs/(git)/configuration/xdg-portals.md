---
title: XDG Portals
description: Set up screen sharing, clipboard, keyring, and file pickers using XDG portals.
---

## Portal Configuration

You can customize portal settings via the following paths:

- **User Configuration (Priority):** `~/.config/xdg-desktop-portal/mango-portals.conf`
- **System Fallback:** `/usr/share/xdg-desktop-portal/mango-portals.conf`

> **Warning:** If you previously added `dbus-update-activation-environment --systemd WAYLAND_DISPLAY XDG_CURRENT_DESKTOP=wlroots` to your config, remove it. Mango now handles this automatically.

## Screen Sharing

Screen sharing (OBS, Discord, WebRTC, Tencent Meeting, ...) needs a portal backend that implements `org.freedesktop.impl.portal.ScreenCast`. Mango recommends [xdg-desktop-portal-luminous](https://github.com/waycrate/xdg-desktop-portal-luminous): it is self-contained, brings its own picker, and opens that picker in `Start()` — the same place the GNOME and KDE portals ask — so every client works, including those that call `Start()` right after `SelectSources()`.

1. **Install it**

   `pipewire`, `pipewire-pulse`, `xdg-desktop-portal-luminous` (AUR), or build it yourself with `meson` + `ninja`.

2. **Make sure the screen interfaces are routed to it**

   The routing installed in `/usr/share/xdg-desktop-portal/mango-portals.conf` already points at `luminous`. An own `~/.config/xdg-desktop-portal/mango-portals.conf` replaces that file, so if you have one, keep these entries:

   ```ini
   [preferred]
   default=gtk
   org.freedesktop.impl.portal.ScreenCast=luminous
   org.freedesktop.impl.portal.Screenshot=luminous
   org.freedesktop.impl.portal.Inhibit=none
   ```

3. **Restart the portal** (or re-login)

   ```bash
   systemctl --user restart xdg-desktop-portal
   ```

### Known Issues

- **Tencent Meeting:** only the first screen share attempt per app start works, so restart it before sharing.

- **Window screen sharing:** Some applications may have issues sharing individual windows. See [#184](https://github.com/mangowm/mango/pull/184) for workarounds.

## Clipboard Manager

Use `cliphist` to manage clipboard history.

**Dependencies:** `wl-clipboard`, `cliphist`, `wl-clip-persist`

**Autostart Config:**

```bash
# Keep clipboard content after app closes
wl-clip-persist --clipboard regular --reconnect-tries 0 &

# Watch clipboard and store history
wl-paste --type text --watch cliphist store &
```

## GNOME Keyring

If you need to store passwords or secrets (e.g., for VS Code or Minecraft launchers), install `gnome-keyring`.

**Configuration:**

Add the following to `~/.config/xdg-desktop-portal/mango-portals.conf`:

```ini
[preferred]
default=gtk
org.freedesktop.impl.portal.ScreenCast=luminous
org.freedesktop.impl.portal.Screenshot=luminous
org.freedesktop.impl.portal.Secret=gnome-keyring
org.freedesktop.impl.portal.Inhibit=none
```

## File Picker (File Selector)

**Dependencies:** `xdg-desktop-portal`, `xdg-desktop-portal-gtk`

Reboot your computer once to apply.
