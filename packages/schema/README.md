# mango config schema

Two JSON Schema 2020-12 files generated from the TypeBox definitions in `src/`.
They describe a parsed configuration object. Neither validates `.conf` or TOML
syntax.

## Canonical schema

```text
https://mangowm.github.io/schema/<version>/schema.json
```

The semantic contract for one configuration file. It is a pre-expansion model:
Mango expands `$var` and `${var}` at parse time, while canonical keeps the
reference. It does not merge `source` files. Values are normalized:

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

Tags use `[1, 2]` for normal tags and `[0]` for the special workspace.

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
- `window_rule.tags` can be a tag number (`0` for the special workspace) or a
  string such as `"1|2"` for several tags

Use with Taplo:

```toml
#:schema https://mangowm.github.io/schema/0.18.4/toml.schema.json
```

Write colors as `0xRRGGBBAA` in TOML. A TOML parser exposes that token as an
integer, which is why the TOML schema accepts the integer form. Only use
integers that came from a `0x` literal. Mango reads the raw token as hex, so a
decimal integer or an integer with underscores is misread or rejected.

Mango's TOML reader is a line-oriented subset, not full TOML. Use decimal
integers and floats and single-line strings for option values. The schema
covers the documented `[global]`, `[bind.*]`, and `[[rule.*]]` forms. Mango also
accepts top-level globals, `[keybind.*]`, and `[[window_rule]]`; those forms are
not modeled.

Arrays with more than one action require a `.conflict` node. Mouse, axis,
gesture, and switch tables do not support action arrays.

## Normalization

Normalize parsed configs to the canonical object:

- `.conf`: boolean fields use `0` / `1`; colors stay `0xRRGGBBAA` strings;
  comma lists become arrays; action strings become action objects; tag numbers
  become one-element arrays (`5` becomes `[5]`); `|` strings become arrays
  (`"1|3"` becomes `[1,3]`); flat keys move under `global`; `[env]` and `[var]`
  values stay strings.
- TOML: boolean fields can be `true` / `false` or `0` / `1` and become
  booleans; numeric enums stay integers; `0x...` integers become
  `"0xRRGGBBAA"` strings; scalar `[env]` and `[var]` values become strings;
  action strings become action objects; tag numbers and `|` strings become tag
  arrays.

Additional `.conf` rules:

- `key_mode` sets the current bind mode and is consumed, not stored under
  `global`.
- `bind` lines become `bind.<mode>`. The `sym`, `l`, `r`, `p`, and `c` flags
  nest under `sym`, `lock`, `release`, `pass`, and `conflict`.
- multiple binds with the same mode and trigger merge into one action array.
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

Canonical values are normalized and must be in range. The TOML schema rejects
values Mango would clamp, except `blur_params_saturation`: the source default is
`1.2` and the runtime clamps it to `1`, so canonical uses `1`. A parser should
report clamped values as warnings before normalization.
