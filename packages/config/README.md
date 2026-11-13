# mango config

Converts mango configuration text to the canonical object and back, and ships
the versioned JSON Schema and catalog for that object. It has no React, DOM,
Tauri, or filesystem dependencies, so it can be used by the settings app, the
docs, or a command-line converter.

```ts
import {
  normalize,
  parseConf,
  parseToml,
  serializeConf,
  serializeToml,
} from "@mangowm.github.io/config";

const { config, warnings } = normalize(parseConf(text));
const toml = serializeToml(config);
const conf = serializeConf(config);
```

## Package layers

```text
@mangowm.github.io/config
  .               parser, normalizer, serializer, validator
  ./schema        schema object and schema types
  ./catalog       config definitions, constants, and reference metadata
  ./schema.json   generated validation artifact
  ./catalog.json  generated reference artifact
```

```ts
import { schema } from "@mangowm.github.io/config/schema";
import { GLOBALS, RULES, DISPATCHERS } from "@mangowm.github.io/config/catalog";
```

The artifacts are versioned by mango release:

```text
https://mangowm.github.io/config/0.18.4/schema.json
https://mangowm.github.io/config/0.18.4/catalog.json
```

Categories are shared catalog identities. Their labels live in `CATEGORIES`,
and each collection defines its own category order:

```ts
import { CATEGORIES, DISPATCHER_CATEGORY_ORDER } from "@mangowm.github.io/config/catalog";
```

Dispatcher catalog arguments carry `kind`, `name`, `label`, `description`,
`placeholder`, `required`, and range/step overrides. Their permitted values come
from `dispatcherArgOptions[kind]`.

## Layers

```text
ConfigDocument   lossless text: comments, blanks, order, duplicates
      |
      v
CanonicalConfig  schema-shaped values; warnings collected, not thrown
      |
      v
config text      generated .conf or TOML
```

The document model is per format and keeps untouched lines verbatim. The
canonical model matches the generated schema exactly.

## Formats

### `.conf`

Line oriented `key = value`. The reader:

- keeps comments, blank lines, and line order
- strips one pair of matching quotes and an inline `#` comment
- keeps repeated keys as separate entries
- preserves CRLF

### TOML subset

Mango does not read full TOML. The reader accepts the same subset:

- `[global]`, `[env]`, `[var]`
- `[bind.<mode>]` and flag tables such as `[bind.default.lock.conflict]`
- `[mousebind|axisbind|gesturebind|switchbind.<mode>]`
- `[[rule.<type>]]`
- strings, numbers, booleans, and arrays
- multi-line arrays

Arrays follow mango's rules: `animation_curve_*`,
`scroller_proportion_preset`, and `circle_layout` are joined into a comma list;
other arrays expand into one value per element.

Formatting is preserved through `formatConf` and `formatToml` as long as nodes
are not edited.

## Normalization

`normalize` dispatches on the document format. `normalizeConf` and
`normalizeToml` are available when the format is already known.

Recoverable problems become warnings attached to a source location:

```ts
interface Warning {
  message: string;
  at: { file: string; line: number };
}
```

Warnings cover unknown options, unknown dispatchers, malformed rules, duplicate
bindings, invalid values, and clamped values. A warning never stops the parse.

Values are checked against `GLOBALS`, `RULES`, `DISPATCHERS`, `DISPATCHER_ARGS`,
and `LAYOUTS` from the catalog data, so there is no second copy of the
metadata.

### Rules

- canonical keeps variables unresolved (`$name`, `${name}`)
- `key_mode` is state, not a global option
- `bind` flags nest under `sym`, `lock`, `release`, `pass`, `conflict`
- repeated `bindc` lines with the same trigger accumulate into one action array
- tag `0` is exclusive; `-1` and `00` expand to `[1..31]`
- boolean rule overrides set to `-1` are omitted
- out-of-range numbers and presets are clamped with a warning

## Serialization

`serializeConf` and `serializeToml` write a clean document from canonical. They
do not preserve the comments of the source they came from; use the document
model when editing in place.

The serializers emit the same constructs the readers accept:

- `.conf`: `key_mode` before each binding group, `bind[lrpc]` flags, one line
  per conflicting action
- TOML: `[global]`, `[env]`, `[var]`, binding tables, `[[rule.<type>]]`, and
  arrays for directives and conflicting actions

## Scope

The canonical model describes one file. `source` and `source_optional` stay in
the object and includes are not merged. Resolving the final configuration is a
separate step.

This package does not read files or render UI. It validates text with
`validateText`, exposes the canonical schema at `./schema`, and exposes the
config definitions at `./catalog`. File I/O belongs to the caller.
