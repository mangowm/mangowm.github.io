---
title: Nix Module Options
description: NixOS and Home Manager configuration options for mangowm.
---

> **Note:** This document is automatically generated from the Nix module source code.

## NixOS

**System-level options via `programs.mango`.**

### enable

Whether to enable mango, a wayland compositor based on dwl\.

_Type:_
boolean

_Default:_

```nix
false
```

_Example:_

```nix
true
```

_Declared by:_

- [\<mango/nix/nixos-modules\.nix>](https://github.com/mangowm/mango/blob/main/nix/nixos-modules.nix)

### package

The mango package to use

_Type:_
package

_Default:_

```nix
<derivation mango-nightly>
```

_Declared by:_

- [\<mango/nix/nixos-modules\.nix>](https://github.com/mangowm/mango/blob/main/nix/nixos-modules.nix)

### addLoginEntry

Whether to add a login entry to the display manager for mango\. Only has effect if a display manager is configured (e\.g\. SDDM, GDM via `services.displayManager`)\.

_Type:_
boolean

_Default:_

```nix
true
```

_Declared by:_

- [\<mango/nix/nixos-modules\.nix>](https://github.com/mangowm/mango/blob/main/nix/nixos-modules.nix)

## Home Manager

**Configure mangowm declaratively via `wayland.windowManager.mango`.**

### enable

Whether to enable mangowm, a Wayland compositor based on dwl\.

_Type:_
boolean

_Default:_

```nix
false
```

_Declared by:_

- [\<mango/nix/hm-modules\.nix>](https://github.com/mangowm/mango/blob/main/nix/hm-modules.nix)

### package

The mango package to use

_Type:_
package

_Default:_

```nix
<derivation mango-nightly>
```

_Declared by:_

- [\<mango/nix/hm-modules\.nix>](https://github.com/mangowm/mango/blob/main/nix/hm-modules.nix)

### autostart_sh

Shell script to run on mango startup\. No shebang needed\.

When this option is set, the script will be written to
`~/.config/mango/autostart.sh` and an `exec_once` line
will be automatically added to the config to execute it\.

_Type:_
strings concatenated with “\\n”

_Default:_

```nix
""
```

_Example:_

```nix
''
  waybar &
  dunst &
''
```

_Declared by:_

- [\<mango/nix/hm-modules\.nix>](https://github.com/mangowm/mango/blob/main/nix/hm-modules.nix)

### bottomPrefixes

List of prefixes for attributes that should appear at the bottom of the config file\.
Attributes starting with these prefixes will be sorted to the end\.

_Type:_
list of string

_Default:_

```nix
[ ]
```

_Example:_

```nix
[
  "source"
]
```

_Declared by:_

- [\<mango/nix/hm-modules\.nix>](https://github.com/mangowm/mango/blob/main/nix/hm-modules.nix)

### extraConfig

Extra configuration lines to add to `~/.config/mango/config.conf`\.
This is useful for advanced configurations that don’t fit the structured
settings format, or for options that aren’t yet supported by the module\.

_Type:_
strings concatenated with “\\n”

_Default:_

```nix
""
```

_Example:_

```nix
''
  # Advanced config that doesn't fit structured format
  special_option = 1
''
```

_Declared by:_

- [\<mango/nix/hm-modules\.nix>](https://github.com/mangowm/mango/blob/main/nix/hm-modules.nix)

### settings

Mango configuration written in Nix\. Entries with the same key
should be written as lists\. Variables and colors names should be
quoted\. See [https://mangowm\.github\.io/docs](https://mangowm.github.io/docs) for more examples\.

**Note:** This option uses a structured format that is converted to Mango’s
configuration syntax\. Nested attributes are flattened with underscore separators\.
For example: `animation.duration_open = 400` becomes `animation_duration_open = 400`

Keymodes (submaps) are supported via the special `key_mode` attribute\. Each key_mode
is a nested attribute set under `key_mode` that contains its own bindings\.

_Type:_
Mango configuration value

_Default:_

```nix
{ }
```

_Example:_

```nix
{
  # Window effects
  blur = 1;
  blur_optimized = 1;
  blur_params = {
    radius = 5;
    num_passes = 2;
  };
  border_radius = 6;
  focused_opacity = 1.0;

  # Animations - use underscores for multi-part keys
  animations = 1;
  animation_type_open = "slide";
  animation_type_close = "slide";
  animation_duration_open = 400;
  animation_duration_close = 800;

  # Or use nested attrs (will be flattened with underscores)
  animation_curve = {
    open = "0.46,1.0,0.29,1";
    close = "0.08,0.92,0,1";
  };

  # Use lists for duplicate keys like bind and tag_rule
  bind = [
    "SUPER,r,reload_config"
    "Alt,space,spawn,rofi -show drun"
    "Alt,Return,spawn,foot"
    "ALT,R,setkeymode,resize"  # Enter resize mode
  ];

  tag_rule = [
    "id:1,layout_name:tile"
    "id:2,layout_name:scroller"
  ];

  # Keymodes (submaps) for modal keybindings
  key_mode = {
    resize = {
      bind = [
        "NONE,Left,resizewin,-10,0"
        "NONE,Escape,setkeymode,default"
      ];
    };
  };
}

```

_Declared by:_

- [\<mango/nix/hm-modules\.nix>](https://github.com/mangowm/mango/blob/main/nix/hm-modules.nix)

### systemd\.enable

Whether to enable `mango-session.target` on
mango startup\. This links to
`graphical-session.target`\.
Some important environment variables will be imported to systemd
and dbus user environment before reaching the target, including

- `DISPLAY`
- `WAYLAND_DISPLAY`
- `XDG_CURRENT_DESKTOP`
- `XDG_SESSION_TYPE`
- `NIXOS_OZONE_WL`
  You can extend this list using the `systemd.variables` option\.

_Type:_
boolean

_Default:_

```nix
true
```

_Example:_

```nix
false
```

_Declared by:_

- [\<mango/nix/hm-modules\.nix>](https://github.com/mangowm/mango/blob/main/nix/hm-modules.nix)

### systemd\.extraCommands

Extra commands to run after D-Bus activation\.

_Type:_
list of string

_Default:_

```nix
[
  "systemctl --user reset-failed"
  "systemctl --user start mango-session.target"
]
```

_Declared by:_

- [\<mango/nix/hm-modules\.nix>](https://github.com/mangowm/mango/blob/main/nix/hm-modules.nix)

### systemd\.variables

Environment variables imported into the systemd and D-Bus user environment\.

_Type:_
list of string

_Default:_

```nix
[
  "DISPLAY"
  "WAYLAND_DISPLAY"
  "XDG_CURRENT_DESKTOP"
  "XDG_SESSION_TYPE"
  "NIXOS_OZONE_WL"
  "XCURSOR_THEME"
  "XCURSOR_SIZE"
]
```

_Example:_

```nix
[
  "--all"
]
```

_Declared by:_

- [\<mango/nix/hm-modules\.nix>](https://github.com/mangowm/mango/blob/main/nix/hm-modules.nix)

### systemd\.xdgAutostart

Whether to enable autostart of applications using
`systemd-xdg-autostart-generator(8)`
\.

_Type:_
boolean

_Default:_

```nix
false
```

_Example:_

```nix
true
```

_Declared by:_

- [\<mango/nix/hm-modules\.nix>](https://github.com/mangowm/mango/blob/main/nix/hm-modules.nix)

### topPrefixes

List of prefixes for attributes that should appear at the top of the config file\.
Attributes starting with these prefixes will be sorted to the beginning\.

_Type:_
list of string

_Default:_

```nix
[ ]
```

_Example:_

```nix
[
  "source"
]
```

_Declared by:_

- [\<mango/nix/hm-modules\.nix>](https://github.com/mangowm/mango/blob/main/nix/hm-modules.nix)
