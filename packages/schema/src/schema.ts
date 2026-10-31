import Type, { type TSchema } from "typebox";

import { DISPATCHERS } from "./data/dispatchers";
import { GLOBALS } from "./data/globals";
import { RULES } from "./data/rules";
import type { GlobalDef, RuleDef, RuleFieldDef } from "./data/types";
import { MANGO_VERSION } from "./version";

const COLOR_PATTERN = "^0x[0-9a-fA-F]{8}$";

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
  "device_rule.scroll_button": { min: 272, max: 279 },
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
    case "string-array":
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
    case "float":
      return Type.Number({
        ...metadata,
        default: defaultValue,
        ...(option.min === undefined ? {} : { minimum: option.min }),
        ...(option.max === undefined ? {} : { maximum: option.max }),
      });
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
    case "curve":
      return Type.Array(Type.Number(), {
        ...metadata,
        default: defaultValue,
        minItems: 4,
        maxItems: 4,
      });
    case "preset":
      return Type.Array(Type.Number({ minimum: 0.1, maximum: 1 }), {
        ...metadata,
        default: defaultValue,
      });
    case "string-array":
      return Type.Array(Type.String(), { ...metadata, default: defaultValue });
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
  return Type.Record(Type.String(), mode === "canonical" ? Type.String() : EnvValue, {
    title: "Environment",
    description: "Environment variables exported before startup.",
  });
}

function varMap(mode: SchemaMode) {
  return Type.Record(Type.String(), mode === "canonical" ? Type.String() : EnvValue, {
    title: "Variables",
    description: "User-defined variables expanded as $name in config values.",
  });
}

const ExecList = Type.Array(Type.String(), {
  title: "Run on Reload",
  description: "Commands run every time the config is reloaded.",
});

const ExecOnceList = Type.Array(Type.String(), {
  title: "Run Once",
  description: "Commands run once at startup.",
});

const SourceList = Type.Array(Type.String(), {
  title: "Includes",
  description: "Config files loaded as part of this config.",
});

const SourceOptionalList = Type.Array(Type.String(), {
  title: "Optional Includes",
  description: "Config files loaded if they exist; missing files are ignored.",
});

function globalSchema(mode: SchemaMode) {
  return Type.Object(
    {
      ...globalProperties(mode),
      exec: Type.Optional(ExecList),
      exec_once: Type.Optional(ExecOnceList),
      source: Type.Optional(SourceList),
      source_optional: Type.Optional(SourceOptionalList),
    },
    {
      title: "Global options",
      description: "Top-level mangowm options.",
      additionalProperties: false,
    },
  );
}

const ACTION_PATTERN = `^(?:${DISPATCHERS.join("|")}|\\$[A-Za-z_][A-Za-z0-9_]*)(?:,.*)?$`;

const ActionString = Type.String({
  title: "Action",
  description: "A dispatcher name followed by optional comma-separated arguments.",
  pattern: ACTION_PATTERN,
});

const Action = Type.Union([ActionString, Type.Array(ActionString)], {
  title: "Action",
  description: "One action, or an array of actions for the same key combination.",
});

const BindingNode: TSchema = Type.Unsafe<TSchema>({
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
  additionalProperties: Action,
});

const BindingRef: TSchema = Type.Unsafe<TSchema>({ $ref: "#/$defs/BindingNode" });

function bindingMap(title: string, description: string): TSchema {
  return Type.Record(Type.String(), BindingRef, { title, description });
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
    case "mask":
      return Type.Union([Type.Integer({ minimum: 0, maximum: 31 }), Type.String()], metadata);
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
    $defs: { BindingNode },
    ...rootSchema(mode),
    title:
      mode === "canonical"
        ? `mangowm configuration ${version}`
        : `mangowm TOML configuration ${version}`,
  } as const;
}

export const schema = buildSchema(MANGO_VERSION, "canonical");
export const tomlSchema = buildSchema(MANGO_VERSION, "toml");
