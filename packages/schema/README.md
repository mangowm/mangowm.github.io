# mango config schema

One JSON Schema 2020-12 file generated from the TypeBox definitions in `src/`.
It describes the canonical parsed configuration object. It does not validate
config text syntax.

```text
https://mangowm.github.io/schema/<version>/schema.json
```

It covers 240 global options, 165 rule fields, 94 dispatchers, and 14 layouts.

## Canonical model

The schema is the semantic contract for one configuration file. Mango expands
`$var` and `${var}` at parse time, while canonical keeps the reference. It does
not merge `source` files. An optional root `$schema` key may hold this URL for
editor tooling.

Values are normalized:

- booleans are `true` or `false`; rule overrides use `true` / `false`, and an
  unset override is omitted
- colors are `"0xRRGGBBAA"` strings
- `[env]` and `[var]` values are strings
- `exec`, `exec_once`, `source`, and `source_optional` are string arrays under
  `global`
- bindings hold one action object, or several under a `conflict` sub-table
- window tags are integers in an array; `0` is the special workspace
- `$var` and `${var}` stay as references in every value position

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

Action objects:

```json
{ "dispatcher": "spawn", "args": "foot" }
```

```json
{ "variable": "term" }
```

`args` may accompany either form. For a dispatcher, it is the text after the
first comma, so commas and shell fragments are preserved. Mango trims each
argument field and treats a field of `0` as the end of the list.

Dispatcher arguments are checked against argument shapes from Mango: directions,
circle directions, layouts, tag masks, monitor strings, numbers, booleans, and
free-form commands. Arguments stay optional where Mango applies defaults, and a
trailing empty argument is accepted.

The model is semantic, not a document model. It does not preserve comments,
blank lines, ordering, or duplicate keys. Use a document model for editing.

## Normalization

Normalize parsed configs to the canonical object:

- boolean fields use `true` / `false`
- `0x...` colors become `"0xRRGGBBAA"` strings
- comma lists become arrays
- action strings become action objects
- tag numbers become one-element arrays (`5` becomes `[5]`)
- `|` strings become arrays (`"1|3"` becomes `[1,3]`)
- flat keys move under `global`
- `[env]` and `[var]` values become strings
- `-1` rule overrides are omitted
- `-1` tags become `[1..31]`

Additional `.conf` rules:

- `key_mode` sets the current bind mode and is consumed, not stored under
  `global`.
- `bind` lines become `bind.<mode>`. The `sym`, `l`, `r`, `p`, and `c` flags
  nest under `sym`, `lock`, `release`, `pass`, and `conflict`.
- multiple conflict binds with the same mode, flags, and trigger merge into one
  action array.
- quoted tag ids such as `"1"` become integer `1`, and quoted tags such as `"5"`
  become `[5]`.

Tag `0` is exclusive. If a tag value contains `0` and other tags, normalize it
to `[0]`. Raw bitmasks above `31` are not supported by the schema.

A `.conf` parser must produce this object before validation.

## Scope

Canonical describes one file. `source` and `source_optional` stay in the
object, variables stay as references, and includes are not merged. A resolved
model must replay source files in document order; merging the arrays is not
equivalent.

## Validation policy

Canonical values are normalized and must be in range. `blur_params_saturation`
uses the effective range `0..1`; Mango's upstream default `1.2` is clamped to
`1`. A parser should report clamped values as warnings before normalization.

## Examples

The schema includes a small set of `examples` for values whose format is not
obvious: colors, curves, presets, layouts, monitor specs, keybindings, tags,
rules, actions, and one root config. They are annotations and do not affect
validation.

## Runtime API

`src/index.ts` exports the schema and the builder:

```ts
import { buildSchema, schema } from "@mangowm.github.io/schema";
```

Validation is a consumer concern. Use any JSON Schema 2020-12 validator, or
compile the schema with TypeBox in the runtime layer that needs it. Action
parsing and action-level validation also belong to that runtime layer.
