# Keyboard

Configure key repeat behavior and XKB layout settings.

## Key Repeat

| Option         | Description                                                                                                                   |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `repeat_rate`  | Character repeat rate when a key is held (characters/sec). Mango range: 1–1000. Set to 0 to disable repeat (via config file). |
| `repeat_delay` | How long a key must be held before repeating begins (ms). Mango range: 1–20000.                                               |

## Startup

| Option      | Description                                    |
| ----------- | ---------------------------------------------- |
| `numlockon` | Enable NumLock on compositor startup (0 or 1). |

## XKB Layout

| Option              | Description                                                                                                    |
| ------------------- | -------------------------------------------------------------------------------------------------------------- |
| `xkb_rules_rules`   | XKB rules file. Usually left empty.                                                                            |
| `xkb_rules_model`   | Keyboard model hint for XKB.                                                                                   |
| `xkb_rules_layout`  | Comma-separated layout identifier(s) — e.g. `us,ru,de`. Add each layout as a separate tag in the UI.           |
| `xkb_rules_variant` | Comma-separated variant(s) matching each layout — e.g. `dvorak,winkeys`. Add each as a separate tag in the UI. |
| `xkb_rules_options` | Comma-separated XKB option(s) — e.g. `ctrl:nocaps,compose:rwin`. Add each option as a separate tag in the UI.  |
