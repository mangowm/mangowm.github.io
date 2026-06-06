# Tag Rules

Configure per-tag settings like master count and layout factor on a per-monitor basis.

## Config Syntax

```
tagrule=id:...,layout_name:...,monitor_name:...,property:value,...
```

## Matchers

| Key              | Description                                             |
| ---------------- | ------------------------------------------------------- |
| `id`             | Tag index (0-based)                                     |
| `layout_name`    | Layout name (`master`, `dwindle`, `scroller`, `circle`) |
| `monitor_name`   | Monitor name (regex match)                              |
| `monitor_make`   | Monitor manufacturer (exact match)                      |
| `monitor_model`  | Monitor model (exact match)                             |
| `monitor_serial` | Monitor serial (exact match)                            |

## Examples

**Tag index 1 (second tag) on the left monitor uses dwindle with 2 masters:**

```
tagrule=id:1,layout_name:dwindle,nmaster:2,mfact:0.6
```

**Tag index 2 (third tag) always opens windows as floating:**

```
tagrule=id:2,open_as_floating:1
```
