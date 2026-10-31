import Type, { type TSchema } from "typebox";

import { DISPATCHERS } from "./data/dispatchers";
import { GLOBALS } from "./data/globals";
import { LAYOUTS } from "./data/layouts";
import { RULES } from "./data/rules";
import type { GlobalDef, RuleDef, RuleFieldDef } from "./data/types";
import { MANGO_VERSION } from "./version";

const COLOR_PATTERN = "^0[xX][0-9a-fA-F]{8}$";

const NUMERIC_ENUMS = new Set([
  "tag_animation_direction",
  "allow_tearing",
  "hdr_depth",
  "hotarea_corner",
  "mouse_accel_profile",
  "trackpad_accel_profile",
  "mouse_scroll_method",
  "trackpad_scroll_method",
  "mouse_click_method",
  "trackpad_click_method",
  "send_events_mode",
  "mouse_send_events_mode",
  "trackpad_send_events_mode",
  "button_map",
  "dwindle_vertical_split",
  "dwindle_horizontal_split",
]);

const NUMERIC_RULE_ENUMS = new Set([
  "rr",
  "accel_profile",
  "scroll_method",
  "click_method",
  "send_events_mode",
  "button_map",
  "force_tearing",
]);

const RULE_RANGES: Record<string, { min?: number; max?: number }> = {
  "monitor_rule.width": { min: 1 },
  "monitor_rule.height": { min: 1 },
  "monitor_rule.scale": { min: 0.001, max: 1000 },
  "monitor_rule.refresh": { min: 0.001, max: 1000 },
  "monitor_rule.hdr_min_lum": { min: 0, max: 10000 },
  "monitor_rule.hdr_max_lum": { min: 0, max: 10000 },
  "monitor_rule.hdr_max_avg_lum": { min: 0, max: 10000 },
  "tag_rule.master_count": { min: 1, max: 99 },
  "tag_rule.master_factor": { min: 0.1, max: 0.9 },
  "tag_rule.scroller_default_proportion": { min: 0, max: 1 },
  "tag_rule.scroller_default_proportion_single": { min: 0, max: 1 },
  "device_rule.repeat_rate": { min: 0, max: 1000 },
  "device_rule.repeat_delay": { min: 0, max: 10000 },
  "device_rule.accel_speed": { min: -1, max: 1 },
};

function parseDefault(option: GlobalDef): unknown {
  switch (option.type) {
    case "bool":
      return option.default === "1";
    case "int":
      return Number.parseInt(option.default, 10);
    case "float":
      return Number.parseFloat(option.default);
    case "curve":
    case "preset":
      return option.default ? option.default.split(",").map(Number) : [];
    case "layout-array":
      return option.default ? option.default.split(",").map((value) => value.trim()) : [];
    case "enum":
      return NUMERIC_ENUMS.has(option.key) ? Number(option.default) : option.default;
    default:
      return option.default;
  }
}

function enumSchema(
  values: readonly string[],
  numeric: boolean,
  metadata: Record<string, unknown>,
  defaultValue?: unknown,
): TSchema {
  return Type.Unsafe<TSchema>({
    type: numeric ? "integer" : "string",
    enum: numeric ? values.map(Number) : [...values],
    ...metadata,
    ...(defaultValue === undefined ? {} : { default: defaultValue }),
  });
}

type SchemaMode = "canonical" | "toml";

function globalProperty(option: GlobalDef, mode: SchemaMode): TSchema {
  const metadata = { title: option.label, description: option.description };
  const defaultValue = parseDefault(option);

  switch (option.type) {
    case "bool":
      if (mode === "canonical") {
        return Type.Boolean({ ...metadata, default: defaultValue });
      }
      return Type.Union([Type.Boolean(), Type.Integer({ enum: [0, 1] })], {
        ...metadata,
        default: defaultValue,
      });
    case "int":
      return Type.Integer({
        ...metadata,
        default: defaultValue,
        ...(option.min === undefined ? {} : { minimum: option.min }),
        ...(option.max === undefined ? {} : { maximum: option.max }),
      });
    case "float": {
      // The source default is 1.2, but the runtime clamps it to 1.
      const saturation = option.key === "blur_params_saturation";
      const canonicalSaturation = saturation && mode === "canonical";
      const maximum = canonicalSaturation ? 1 : option.max;
      return Type.Number({
        ...(canonicalSaturation
          ? { ...metadata, description: "Saturation multiplier for the blurred layer (0-1)." }
          : metadata),
        default: canonicalSaturation ? 1 : defaultValue,
        ...(option.min === undefined ? {} : { minimum: option.min }),
        ...(maximum === undefined ? {} : { maximum }),
      });
    }
    case "string":
      return Type.String({ ...metadata, default: defaultValue });
    case "color":
      if (mode === "canonical") {
        return Type.String({ ...metadata, default: defaultValue, pattern: COLOR_PATTERN });
      }
      return Type.Union(
        [
          Type.String({ pattern: COLOR_PATTERN }),
          Type.Integer({ minimum: 0, maximum: 0xffffffff }),
        ],
        { ...metadata, default: defaultValue },
      );
    case "curve": {
      const array = Type.Array(Type.Number({ minimum: 0 }), {
        ...metadata,
        default: defaultValue,
        minItems: 4,
        maxItems: 4,
      });
      if (mode === "canonical") return array;
      return Type.Union([array, Type.String()], { ...metadata, default: defaultValue });
    }
    case "preset": {
      const hasDefault = Array.isArray(defaultValue) && defaultValue.length > 0;
      const array = Type.Array(Type.Number({ minimum: 0.1, maximum: 1 }), {
        ...metadata,
        ...(hasDefault ? { default: defaultValue } : {}),
        minItems: 1,
      });
      if (mode === "canonical") return array;
      return Type.Union([array, Type.String(), Type.Number({ minimum: 0.1, maximum: 1 })], {
        ...metadata,
        ...(hasDefault ? { default: defaultValue } : {}),
      });
    }
    case "layout-array": {
      const hasDefault = Array.isArray(defaultValue) && defaultValue.length > 0;
      const array = Type.Array(Type.String({ enum: LAYOUTS }), {
        ...metadata,
        ...(hasDefault ? { default: defaultValue } : {}),
        minItems: 1,
      });
      if (mode === "canonical") return array;
      return Type.Union([array, Type.String()], {
        ...metadata,
        ...(hasDefault ? { default: defaultValue } : {}),
      });
    }
    case "enum": {
      const values = option.options ?? [];
      return enumSchema(
        values.map((value) => value.value),
        NUMERIC_ENUMS.has(option.key),
        metadata,
        defaultValue,
      );
    }
  }
}

function globalProperties(mode: SchemaMode) {
  return Object.fromEntries(
    GLOBALS.map((option) => [option.key, Type.Optional(globalProperty(option, mode))]),
  );
}

const EnvValue = Type.Union([Type.String(), Type.Number(), Type.Boolean()]);

function envMap(mode: SchemaMode) {
  return Type.Unsafe<TSchema>({
    type: "object",
    title: "Environment",
    description: "Environment variables exported before startup.",
    additionalProperties: mode === "canonical" ? Type.String() : EnvValue,
    propertyNames: { minLength: 1 },
  });
}

function varMap(mode: SchemaMode) {
  return Type.Unsafe<TSchema>({
    type: "object",
    title: "Variables",
    description: "User-defined variables expanded as $name in config values.",
    additionalProperties: mode === "canonical" ? Type.String() : EnvValue,
    propertyNames: { pattern: "^[A-Za-z_][A-Za-z0-9_]*$" },
  });
}

function directive(mode: SchemaMode, title: string, description: string) {
  if (mode === "canonical") return Type.Array(Type.String(), { title, description });
  return Type.Union([Type.String(), Type.Array(Type.String())], { title, description });
}

function globalSchema(mode: SchemaMode) {
  return Type.Object(
    {
      ...globalProperties(mode),
      exec: Type.Optional(
        directive(mode, "Run on Reload", "Commands run every time the config is reloaded."),
      ),
      exec_once: Type.Optional(directive(mode, "Run Once", "Commands run once at startup.")),
      source: Type.Optional(
        directive(mode, "Includes", "Config files loaded as part of this config."),
      ),
      source_optional: Type.Optional(
        directive(
          mode,
          "Optional Includes",
          "Config files loaded if they exist; missing files are ignored.",
        ),
      ),
    },
    {
      title: "Global options",
      description: "Top-level mangowm options.",
      additionalProperties: false,
    },
  );
}

// Generated from DISPATCHERS. JSON Schema has no prefix-enum keyword.
const VARIABLE_PATTERN = "\\$(?:[A-Za-z_][A-Za-z0-9_]*|\\{[A-Za-z_][A-Za-z0-9_]*\\})";
const ACTION_PATTERN = `^\\s*(?:${DISPATCHERS.join("|")}|${VARIABLE_PATTERN})(?:\\s*,.*)?\\s*$`;

const TAG_NUMBER_PATTERN = "(?:[0-9]|[12][0-9]|3[01])";
const TAG_MASK_PATTERN = `^\\s*${TAG_NUMBER_PATTERN}\\s*(?:\\|\\s*${TAG_NUMBER_PATTERN}\\s*)*$`;
const TAG_ID_STRINGS = ["*", ...Array.from({ length: 32 }, (_, index) => String(index))];

const TomlActionString = Type.String({
  title: "Action",
  description: "A dispatcher name followed by optional comma-separated arguments.",
  pattern: ACTION_PATTERN,
});

const TomlAction = Type.Union([TomlActionString, Type.Array(TomlActionString)], {
  title: "Action",
  description: "One action, or an array of actions for the same key combination.",
});

const CanonicalAction: TSchema = Type.Unsafe<TSchema>({
  title: "Action",
  description: "A dispatcher call or a variable reference.",
  type: "object",
  properties: {
    dispatcher: { type: "string", enum: DISPATCHERS, title: "Dispatcher" },
    variable: {
      type: "string",
      pattern: "^[A-Za-z_][A-Za-z0-9_]*$",
      title: "Variable",
      description: "Name of a config variable.",
    },
    args: {
      type: "string",
      title: "Arguments",
      description: "Raw text after the first comma.",
    },
  },
  additionalProperties: false,
  oneOf: [
    { properties: { dispatcher: {} }, required: ["dispatcher"] },
    { properties: { variable: {} }, required: ["variable"] },
  ],
});

const CanonicalActions = Type.Array(CanonicalAction, {
  title: "Actions",
  description: "One or more actions for the same key combination.",
  minItems: 1,
});

function bindingNode(mode: SchemaMode): TSchema {
  return Type.Unsafe<TSchema>({
    title: "Binding node",
    description: "A key combination map with optional flag sub-tables.",
    type: "object",
    properties: {
      sym: { $ref: "#/$defs/BindingNode" },
      lock: { $ref: "#/$defs/BindingNode" },
      release: { $ref: "#/$defs/BindingNode" },
      pass: { $ref: "#/$defs/BindingNode" },
      conflict: { $ref: "#/$defs/BindingNode" },
    },
    additionalProperties: mode === "canonical" ? CanonicalActions : TomlAction,
  });
}

function bindingMap(title: string, description: string): TSchema {
  return Type.Record(Type.String(), Type.Unsafe<TSchema>({ $ref: "#/$defs/BindingNode" }), {
    title,
    description,
  });
}

function tagIdSchema(mode: SchemaMode, metadata: Record<string, unknown>): TSchema {
  const wildcard = Type.Unsafe<TSchema>({ type: "string", const: "*" });

  if (mode === "canonical") {
    return Type.Union([Type.Integer({ minimum: 0, maximum: 31 }), wildcard], metadata);
  }

  return Type.Union(
    [Type.Integer({ minimum: 0, maximum: 31 }), Type.String({ enum: TAG_ID_STRINGS })],
    metadata,
  );
}

function tagMaskSchema(metadata: Record<string, unknown>): TSchema {
  return Type.Union(
    [Type.Integer({ minimum: 0, maximum: 31 }), Type.String({ pattern: TAG_MASK_PATTERN })],
    metadata,
  );
}

function tagArraySchema(metadata: Record<string, unknown>): TSchema {
  return Type.Union(
    [
      Type.Unsafe<TSchema>({ const: [0] }),
      Type.Unsafe<TSchema>({
        type: "array",
        items: { type: "integer", minimum: 1, maximum: 31 },
        minItems: 1,
        uniqueItems: true,
      }),
    ],
    metadata,
  );
}

function ruleField(field: RuleFieldDef, ruleKey: string, mode: SchemaMode): TSchema {
  const metadata = { title: field.label, description: field.description };
  const range = RULE_RANGES[`${ruleKey}.${field.key}`];

  switch (field.type) {
    case "bool":
      if (mode === "canonical") return Type.Boolean(metadata);
      return Type.Union([Type.Boolean(), Type.Integer({ enum: [0, 1] })], metadata);
    case "int":
      return Type.Integer({
        ...metadata,
        ...(range?.min === undefined ? {} : { minimum: range.min }),
        ...(range?.max === undefined ? {} : { maximum: range.max }),
      });
    case "float":
      return Type.Number({
        ...metadata,
        ...(range?.min === undefined ? {} : { minimum: range.min }),
        ...(range?.max === undefined ? {} : { maximum: range.max }),
      });
    case "color":
      if (mode === "canonical") return Type.String({ ...metadata, pattern: COLOR_PATTERN });
      return Type.Union(
        [
          Type.String({ pattern: COLOR_PATTERN }),
          Type.Integer({ minimum: 0, maximum: 0xffffffff }),
        ],
        metadata,
      );
    case "key-binding":
      return Type.String({ ...metadata, pattern: "^[^-]+\\s*-\\s*\\S+" });
    case "tag-id":
      return tagIdSchema(mode, metadata);
    case "tag-mask":
      if (mode === "canonical") {
        return tagArraySchema({
          ...metadata,
          description:
            "Tags to assign as an array. Use [0] for the special workspace; tag 0 cannot be combined with other tags.",
        });
      }
      return tagMaskSchema(metadata);
    case "string":
      return Type.String(metadata);
    case "enum": {
      const values = field.options ?? [];
      return enumSchema(values, NUMERIC_RULE_ENUMS.has(field.key), metadata);
    }
  }
}

function ruleSchema(rule: RuleDef, mode: SchemaMode): TSchema {
  const properties = Object.fromEntries(
    rule.fields.map((field) => [field.key, Type.Optional(ruleField(field, rule.key, mode))]),
  );

  const object = Type.Object(properties, {
    title: rule.label,
    description: rule.description,
    additionalProperties: false,
  });

  if (rule.key !== "monitor_rule") return object;

  return Type.Unsafe<TSchema>({
    ...object,
    anyOf: [
      { properties: { name: {} }, required: ["name"] },
      { properties: { make: {} }, required: ["make"] },
      { properties: { model: {} }, required: ["model"] },
      { properties: { serial: {} }, required: ["serial"] },
    ],
    dependentRequired: {
      width: ["height", "refresh"],
      height: ["width", "refresh"],
      refresh: ["width", "height"],
      x: ["y"],
      y: ["x"],
    },
    dependentSchemas: {
      custom: {
        anyOf: [
          {
            properties: {
              custom: mode === "canonical" ? { const: false } : { enum: [false, 0] },
            },
            required: ["custom"],
          },
          {
            properties: { width: {}, height: {}, refresh: {} },
            required: ["width", "height", "refresh"],
          },
        ],
      },
    },
  });
}

function rulesSchema(mode: SchemaMode) {
  const rules = Object.fromEntries(
    RULES.map((rule) => [rule.key, Type.Optional(Type.Array(ruleSchema(rule, mode)))]),
  );

  return Type.Object(rules, {
    title: "Rules",
    description: "Monitor, tag, layer, window, and device rules.",
    additionalProperties: false,
  });
}

function rootSchema(mode: SchemaMode) {
  return Type.Object(
    {
      global: Type.Optional(globalSchema(mode)),
      env: Type.Optional(envMap(mode)),
      var: Type.Optional(varMap(mode)),
      bind: Type.Optional(
        bindingMap("Key bindings", "Keyboard bindings by key mode and key combination."),
      ),
      mousebind: Type.Optional(
        bindingMap("Mouse bindings", "Mouse bindings by key mode and button combination."),
      ),
      axisbind: Type.Optional(
        bindingMap("Axis bindings", "Scroll axis bindings by key mode and direction."),
      ),
      gesturebind: Type.Optional(
        bindingMap("Gesture bindings", "Gesture bindings by key mode and gesture combination."),
      ),
      switchbind: Type.Optional(
        bindingMap("Switch bindings", "Switch bindings by key mode and fold state."),
      ),
      rule: Type.Optional(rulesSchema(mode)),
    },
    {
      description:
        mode === "canonical"
          ? "Canonical JSON representation of a mangowm configuration."
          : "TOML representation of a mangowm configuration.",
      additionalProperties: false,
    },
  );
}

export function buildSchema(version: string, mode: SchemaMode = "canonical") {
  const file = mode === "canonical" ? "schema.json" : "toml.schema.json";

  return {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    $id: `https://mangowm.github.io/schema/${version}/${file}`,
    $defs: { BindingNode: bindingNode(mode) },
    ...rootSchema(mode),
    title:
      mode === "canonical"
        ? `mangowm configuration ${version}`
        : `mangowm TOML configuration ${version}`,
  } as const;
}

export const schema = buildSchema(MANGO_VERSION, "canonical");
export const tomlSchema = buildSchema(MANGO_VERSION, "toml");
