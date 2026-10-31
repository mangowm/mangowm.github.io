# mango config schema

Two JSON Schema 2020-12 files generated from the TypeBox definitions in `src/`.
They describe a parsed configuration object. Neither validates `.conf` or TOML
syntax.

## Canonical schema

```text
https://mangowm.github.io/schema/<version>/schema.json
```

The semantic contract for one configuration file. It does not merge `source`
files or expand variables. Values are normalized:

- booleans are `true` or `false`
- colors are `"0xRRGGBBAA"` strings
- `[env]` and `[var]` values are strings
- `exec`, `exec_once`, `source`, and `source_optional` are string arrays under
  `global`
- bindings hold arrays of action objects
- window tags are arrays of integers

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
  },
  "bind": {
    "default": {
      "SUPER+Return": [{ "dispatcher": "spawn", "args": "foot" }]
    }
  }
}
```

An action object is one of:

```json
{ "dispatcher": "spawn", "args": "foot" }
```

```json
{ "variable": "term" }
```

`args` is the raw text after the first comma, so commas and shell fragments are
preserved. Tags use `[1, 2]` for normal tags and `[0]` for the special
workspace.

The canonical model is semantic, not a document model. It does not preserve
comments, blank lines, ordering, or duplicate keys. Use a document model for
editing.

## TOML schema

```text
https://mangowm.github.io/schema/<version>/toml.schema.json
```

The same configuration sections, with the value forms a TOML parser produces.
Bindings and tags use their TOML forms, not the canonical structured forms. Use
it for editor validation:

- booleans can be `true` / `false` or `0` / `1`
- colors can be `"0xRRGGBBAA"` or a 32-bit integer
- `[env]` and `[var]` values can be strings, numbers, or booleans
- `source`, `exec`, `exec_once`, and `source_optional` can be a string or an
  array of strings
- binding actions are strings such as `"spawn,foot"` or arrays of strings
- `window_rule.tags` can be an integer bitmask or a string such as `"1|2"`

Use with Taplo:

```toml
#:schema https://mangowm.github.io/schema/0.18.4/toml.schema.json
```

Write colors as `0xRRGGBBAA` in TOML. A TOML parser exposes that token as an
integer, which is why the TOML schema accepts the integer form.

## Normalization

Normalize parsed configs to the canonical object:

- `.conf`: boolean fields use `0` / `1`; colors stay `0xRRGGBBAA` strings;
  comma lists become arrays; action strings become action objects; tag masks
  become tag arrays; flat keys move under `global`; `[env]` and `[var]` values
  stay strings.
- TOML: boolean fields can be `true` / `false` or `0` / `1` and become
  booleans; numeric enums stay integers; `0x...` integers become
  `"0xRRGGBBAA"` strings; scalar `[env]` and `[var]` values become strings;
  action strings become action objects; tag masks become tag arrays.

Tag `0` is exclusive. If a tag mask contains `0` and other tags, keep only `0`.

A `.conf` parser must produce this object before validation.

## Scope

Canonical describes one file. `source` and `source_optional` stay in the
object, variables stay as references, and includes are not merged. A resolved
model can merge includes and expand variables later.

## Validation policy

Canonical values are normalized and must be in range. The TOML schema also
rejects values that Mango would clamp. A parser should report those as warnings
before normalization.
