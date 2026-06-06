# Rules

Rules are the most powerful configuration mechanism in MangoWM. They let you selectively override behaviour for specific windows, monitors, tags, or layer surfaces — without changing global defaults.

## Why Rules?

Without rules, every window on every tag behaves identically. Rules intercept specific windows (by app ID or title) and apply targeted overrides, while leaving everything else at the global default.

This means:

- **No more 40-boolean-per-window forms.** A rule only shows the properties you actually override.
- **Explicit inheritance.** Every unset property inherits from the global config. If you remove an override, that property goes back to the global default.
- **First-match wins.** Rules are evaluated in order. The first rule whose criteria match the window is applied.

---

## Rule Types

### Monitor Rules (`monitorrule=`)

Match monitors by `name`, `make`, `model`, or `serial` and configure resolution, scaling, position, VRR, and rotation.

**Example: Configure a 4K monitor at 150% scale**

```
monitorrule=name:DP-1,scale:1.5,x:0,y:0,vrr:1
```

**Example: Rotate a secondary monitor**

```
monitorrule=name:HDMI-A-1,rr:1,scale:1.0,x:3840,y:0
```

---

### Tag Rules (`tagrule=`)

Configure per-tag settings (master count, layout factor, default floating) on a per-monitor basis.

**Example: Tag index 1 (second tag) uses dwindle layout with 2 masters**

```
tagrule=id:1,layout_name:dwindle,nmaster:2,mfact:0.6
```

**Example: Tag index 2 (third tag) always opens windows as floating**

```
tagrule=id:2,open_as_floating:1
```

---

### Window Rules (`windowrule=`)

Match windows by `appid` or `title` and override any combination of appearance, behaviour, geometry, or animation properties.

**Example: Make foot terminal float with reduced opacity**

```
windowrule=appid:foot,isfloating:1,focused_opacity:0.85,unfocused_opacity:0.75
```

**Example: Force Firefox to open on a specific monitor without animations**

```
windowrule=appid:firefox,monitor:DP-1,isnoanimation:1
```

---

### Layer Rules (`layerrule=`)

Configure behaviour for layer-shell surfaces such as panels, notifications, and wallpapers. These match by `layer_name` (the namespace registered by the application).

**Example: Disable blur behind the panel**

```
layerrule=layer_name:gtk-layer-shell,noblur:1,noanim:1
```

---

## How Rules Work Internally

Each rule is stored as a flat string in the config file:

```
windowrule=appid:foot,isfloating:1,focused_opacity:0.85
```

The string is split on `,` into key:value pairs. Keys known as **matchers** (like `appid`, `title`, `name`) identify _what_ the rule applies to. All other keys become **overrides** that change behaviour.

When the compositor evaluates rules, it iterates the list in order and applies the first match. A rule with no matchers matches nothing and is effectively ignored.

---

## Override Properties Reference

### Appearance

| Property                     | Type          | Description                       |
| ---------------------------- | ------------- | --------------------------------- |
| `isfloating`                 | boolean       | Force floating or tiled           |
| `isfullscreen`               | boolean       | Force fullscreen mode             |
| `isfakefullscreen`           | boolean       | Fake fullscreen (geometry only)   |
| `isnoborder`                 | boolean       | Remove window border              |
| `isnoshadow`                 | boolean       | Disable shadow                    |
| `isnoradius`                 | boolean       | Remove corner radius              |
| `focused_opacity`            | float [0–1]   | Opacity when focused              |
| `unfocused_opacity`          | float [0–1]   | Opacity when unfocused            |
| `scroller_proportion`        | float [0–1]   | Scroller layout proportion (0=inherit)        |
| `scroller_proportion_single` | float [0–1]   | Scroller single-window proportion (0=inherit) |
| `allow_csd`                  | boolean       | Allow client-side decorations     |
| `force_fakemaximize`         | boolean       | Force fake maximize               |
| `force_tearing`              | boolean       | Allow tearing                     |
| `force_tiled_state`          | boolean       | Force tiled state                 |
| `isterm`                     | boolean       | Mark as terminal                  |

### Behaviour

| Property                 | Type    | Description               |
| ------------------------ | ------- | ------------------------- |
| `isnoanimation`          | boolean | Disable animations        |
| `isopensilent`           | boolean | Don't focus on open       |
| `istagsilent`            | boolean | Don't switch tags on open |
| `nofocus`                | boolean | Never receive focus       |
| `nofadein`               | boolean | Disable fade-in           |
| `nofadeout`              | boolean | Disable fade-out          |
| `no_force_center`        | boolean | Don't auto-center         |
| `idleinhibit_when_focus` | boolean | Inhibit idle when focused |
| `noswallow`              | boolean | Prevent window swallowing |
| `noblur`                 | boolean | Disable background blur   |
| `ignore_maximize`        | boolean | Ignore maximize requests  |
| `ignore_minimize`        | boolean | Ignore minimize requests  |
| `isnosizehint`           | boolean | Ignore size hints         |

### Scratchpad & Overlay

| Property            | Type    | Description              |
| ------------------- | ------- | ------------------------ |
| `isnamedscratchpad` | boolean | Mark as named scratchpad |
| `isunglobal`        | boolean | Show only on current tag |
| `isglobal`          | boolean | Show on all tags         |
| `isoverlay`         | boolean | Render in overlay layer  |

### Input & Shortcuts

| Property                  | Type    | Description                                    |
| ------------------------- | ------- | ---------------------------------------------- |
| `allow_shortcuts_inhibit` | boolean | Allow shortcut inhibition                      |
| `globalkeybinding`        | string  | Global hotkey (format: `Modifier-Keysym`)      |

### Tags & Monitor

| Property  | Type    | Applies To | Description          |
| --------- | ------- | ---------- | -------------------- |
| `tags`    | integer | windowrule | Assign to tag number |
| `monitor` | string  | windowrule | Target monitor name  |

### Geometry

| Property  | Type    | Applies To | Description       |
| --------- | ------- | ---------- | ----------------- |
| `offsetx` | integer | windowrule | Horizontal percentage offset |
| `offsety` | integer | windowrule | Vertical percentage offset   |
| `width`   | float   | windowrule | Width ratio (0=inherit, >1 = absolute px)    |
| `height`  | float   | windowrule | Height ratio (0=inherit, >1 = absolute px)   |

### Monitor Properties

| Property  | Type    | Description                                |
| --------- | ------- | ------------------------------------------ |
| `rr`      | select  | Rotation (0=normal, 1=90°, 2=180°, 3=270°) |
| `scale`   | float   | Scale factor                               |
| `x`       | integer | X position in layout                       |
| `y`       | integer | Y position in layout                       |
| `width`   | integer | Output width in px                         |
| `height`  | integer | Output height in px                        |
| `refresh` | float   | Refresh rate in Hz                         |
| `vrr`     | boolean | Variable refresh rate                      |
| `custom`  | boolean | Custom mode                                |

### Tag Properties

| Property           | Type            | Description                    |
| ------------------ | --------------- | ------------------------------ |
| `nmaster`          | integer [1–99]  | Number of master windows       |
| `mfact`            | float [0.1–0.9] | Master area ratio              |
| `no_render_border` | boolean         | Disable borders on this tag    |
| `open_as_floating` | boolean         | New windows float by default   |
| `no_hide`          | boolean         | Don't hide when switching tags |

### Animation & Layer

| Property               | Type    | Applies To            | Description              |
| ---------------------- | ------- | --------------------- | ------------------------ |
| `animation_type_open`  | string  | windowrule, layerrule | Open animation name      |
| `animation_type_close` | string  | windowrule, layerrule | Close animation name     |
| `noanim`               | boolean | layerrule             | Disable layer animations |
| `noshadow`             | boolean | layerrule             | Disable layer shadows    |
