# Window Rules

Match windows by app ID or title and apply visual and behavioural overrides.

## Config Syntax

```
windowrule=appid:...,title:...,property:value,...
```

## Matchers

| Key     | Description                   | Example                       |
| ------- | ----------------------------- | ----------------------------- |
| `appid` | The application ID (wm_class) | `appid:foot`, `appid:firefox` |
| `title` | The window title              | `title:Mozilla Firefox`       |

## Examples

**Float a specific application:**

```
windowrule=appid:mpv,isfloating:1,isnoborder:1
```

**Scratchpad terminal:**

```
windowrule=appid:kitty,isnamedscratchpad:1,isfloating:1
```

**Global window (appears on all tags):**

```
windowrule=appid:thunderbird,isglobal:1
```
