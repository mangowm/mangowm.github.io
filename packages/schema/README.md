# mango config schema

Two JSON Schema 2020-12 files generated from the TypeBox definitions in `src/`.
Both describe the parsed configuration object. Neither validates `.conf` or TOML
syntax.

## Canonical schema

```text
https://mangowm.github.io/schema/<version>/schema.json
```

Use this as the primary contract for programs that read or write normalized
config data. Values are normalized:

- booleans are `true` or `false`
- colors are `"0xRRGGBBAA"` strings
- `[env]` and `[var]` values are strings
- `exec`, `exec_once`, `source`, and `source_optional` live under `global`

Example:

```json
{
  "global": {
    "blur": true,
    "root_color": "0x323232ff",
    "exec": ["waybar"]
  },
  "env": {
    "DPI": "140"
  }
}
```

## TOML schema

```text
https://mangowm.github.io/schema/<version>/toml.schema.json
```

Same structure, with the value forms a TOML parser produces. Use it for editor
validation:

- booleans can be `true` / `false` or `0` / `1`
- colors can be `"0xRRGGBBAA"` or a 32-bit integer
- `[env]` and `[var]` values can be strings, numbers, or booleans

Use with Taplo:

```toml
#:schema https://mangowm.github.io/schema/0.18.4/toml.schema.json
```

Write colors as `0xRRGGBBAA` in TOML. A TOML parser exposes that token as an
integer, which is why the TOML schema accepts the integer form.

## Normalization

Normalize parsed configs to the canonical object:

- `.conf`: `0` / `1` become booleans; `0xRRGGBBAA` strings stay strings;
  comma lists become arrays; flat keys move under `global`; `[env]` and `[var]`
  values stay strings.
- TOML: `true` / `false` become booleans; `0` / `1` become booleans; `0x...`
  integers become `"0xRRGGBBAA"` strings; scalar `[env]` and `[var]` values
  become strings.

A `.conf` parser must produce this object before validation.
