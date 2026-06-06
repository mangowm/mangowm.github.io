# Layer Rules

Configure behaviour for layer-shell surfaces like panels, notifications, and wallpapers.

## Config Syntax

```
layerrule=layer_name:...,property:value,...
```

## Matchers

| Key          | Description         | Example                      |
| ------------ | ------------------- | ---------------------------- |
| `layer_name` | The layer namespace | `layer_name:gtk-layer-shell` |

## Examples

**Disable blur and animations behind the panel:**

```
layerrule=layer_name:gtk-layer-shell,noblur:1,noanim:1
```

**Disable shadows for wallpaper layer:**

```
layerrule=layer_name:wlr-wallpaper,noshadow:1
```
