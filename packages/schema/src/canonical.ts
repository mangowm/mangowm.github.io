import Type, { type TSchema } from "typebox";

import {
  BINDING_KEY_PATTERNS,
  GLOBAL_KEY_BINDING_PATTERN,
  type BindingKind,
} from "./data/bindingKeys";
import { canonicalArgsPattern } from "./data/dispatcherArgs";
import { DISPATCHERS } from "./data/dispatchers";
import { GLOBALS } from "./data/globals";
import { LAYOUTS } from "./data/layouts";
import { RULES } from "./data/rules";
import type { GlobalDef, RuleDef, RuleFieldDef } from "./data/types";
import { BINDING_DEFS, COLOR_PATTERN, CONFLICT_DEF, bindingMap, enumSchema } from "./core";

const CANONICAL_ACTION_VARIANTS = [
  ...DISPATCHERS.map((name) => ({
    properties: {
      dispatcher: { const: name },
      args: { type: "string", pattern: canonicalArgsPattern(name) },
    },
    required: ["dispatcher"],
  })),
  {
    properties: {
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
    required: ["variable"],
  },
];

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
  oneOf: CANONICAL_ACTION_VARIANTS,
});

const CanonicalSingleAction = Type.Array(CanonicalAction, {
  title: "Action",
  description: "The action for this key combination.",
  minItems: 1,
  maxItems: 1,
});

const CanonicalConflictActions = Type.Array(CanonicalAction, {
  title: "Actions",
  description: "One or more actions for the same key combination.",
  minItems: 1,
});

function globalProperty(option: GlobalDef): TSchema {
  const metadata = { title: option.label, description: option.description };
  switch (option.type) {
    case "bool":
      return Type.Boolean({ ...metadata, default: option.default });
    case "int":
      return Type.Integer({
        ...metadata,
        default: option.default,
        ...(option.min === undefined ? {} : { minimum: option.min }),
        ...(option.max === undefined ? {} : { maximum: option.max }),
      });
    case "float":
      return Type.Number({
        ...metadata,
        default: option.canonicalDefault ?? option.default,
        ...(option.min === undefined ? {} : { minimum: option.min }),
        ...((option.canonicalMax ?? option.max) === undefined
          ? {}
          : { maximum: option.canonicalMax ?? option.max }),
      });
    case "string":
      return Type.String({ ...metadata, default: option.default });
    case "color":
      return Type.String({ ...metadata, default: option.default, pattern: COLOR_PATTERN });
    case "curve":
      return Type.Array(Type.Number({ minimum: 0 }), {
        ...metadata,
        default: option.default,
        minItems: 4,
        maxItems: 4,
      });
    case "preset": {
      const hasDefault = option.default.length > 0;
      return Type.Array(Type.Number({ minimum: 0.1, maximum: 1 }), {
        ...metadata,
        ...(hasDefault ? { default: option.default } : {}),
        minItems: 1,
      });
    }
    case "layout-array": {
      const hasDefault = option.default.length > 0;
      return Type.Array(Type.String({ enum: LAYOUTS }), {
        ...metadata,
        ...(hasDefault ? { default: option.default } : {}),
        minItems: 1,
      });
    }
    case "enum": {
      const values = option.options;
      return enumSchema(
        values.map((value) => value.value),
        option.numeric === true,
        metadata,
        option.default,
        values.map((value) => value.label),
      );
    }
  }
}

function globalProperties() {
  return Object.fromEntries(
    GLOBALS.map((option) => [option.key, Type.Optional(globalProperty(option))]),
  );
}

function envMap() {
  return Type.Unsafe<TSchema>({
    type: "object",
    title: "Environment",
    description:
      "Environment variables exported before startup and re-applied on every config reload.",
    additionalProperties: Type.String({ minLength: 1 }),
    propertyNames: { minLength: 1 },
  });
}

function varMap() {
  return Type.Unsafe<TSchema>({
    type: "object",
    title: "Variables",
    description:
      "User-defined variables referenced as $name or ${name} in config values and binding keys; undefined names are left untouched.",
    additionalProperties: Type.String(),
    propertyNames: { pattern: "^[A-Za-z_][A-Za-z0-9_]*$" },
  });
}

function directive(title: string, description: string) {
  return Type.Array(Type.String({ minLength: 1 }), { title, description });
}

function globalSchema() {
  return Type.Object(
    {
      ...globalProperties(),
      exec: Type.Optional(
        directive(
          "Run on Load/Reload",
          "Commands run at startup and every time the config is reloaded.",
        ),
      ),
      exec_once: Type.Optional(directive("Run Once", "Commands run once at startup.")),
      source: Type.Optional(directive("Includes", "Config files loaded as part of this config.")),
      source_optional: Type.Optional(
        directive(
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

function bindingNode(kind: BindingKind, conflict = false): TSchema {
  const description =
    "A map from a key, button, axis, gesture, or fold state to actions, with optional flag sub-tables.";

  const nodeDef = kind === "key" && conflict ? CONFLICT_DEF : BINDING_DEFS[kind];
  const conflictDef = kind === "key" ? CONFLICT_DEF : BINDING_DEFS[kind];
  const ref = `#/$defs/${nodeDef}`;
  const valueSchema = {
    $ref:
      nodeDef === CONFLICT_DEF
        ? "#/$defs/CanonicalConflictActions"
        : "#/$defs/CanonicalSingleAction",
  };

  return Type.Unsafe<TSchema>({
    title: conflict ? "Conflict binding node" : "Binding node",
    description,
    type: "object",
    properties: {
      sym: { $ref: ref },
      lock: { $ref: ref },
      release: { $ref: ref },
      pass: { $ref: ref },
      conflict: { $ref: `#/$defs/${conflictDef}` },
    },
    patternProperties: { [BINDING_KEY_PATTERNS[kind]]: valueSchema },
    additionalProperties: false,
  });
}

function tagIdSchema(metadata: Record<string, unknown>): TSchema {
  return Type.Union(
    [
      Type.Integer({ minimum: 0, maximum: 31 }),
      Type.Unsafe<TSchema>({ type: "string", const: "*" }),
    ],
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

function ruleField(field: RuleFieldDef): TSchema {
  const metadata = { title: field.label, description: field.description };

  switch (field.type) {
    case "bool":
      return Type.Boolean(metadata);
    case "int":
      return Type.Integer({
        ...metadata,
        ...("min" in field && field.min !== undefined ? { minimum: field.min } : {}),
        ...("max" in field && field.max !== undefined ? { maximum: field.max } : {}),
      });
    case "float":
      return Type.Number({
        ...metadata,
        ...("min" in field && field.min !== undefined ? { minimum: field.min } : {}),
        ...("max" in field && field.max !== undefined ? { maximum: field.max } : {}),
      });
    case "color":
      return Type.String({ ...metadata, pattern: COLOR_PATTERN });
    case "key-binding":
      return Type.String({ ...metadata, pattern: GLOBAL_KEY_BINDING_PATTERN });
    case "device-name":
      return Type.String({ ...metadata, pattern: "^[^,]+$" });
    case "tag-id":
      return tagIdSchema(metadata);
    case "tag-mask":
      return tagArraySchema({
        ...metadata,
        description:
          "Tags to assign as an array. Use [0] for the special workspace; tag 0 cannot be combined with other tags.",
      });
    case "string":
      return Type.String({ ...metadata, pattern: "^[^,]*$" });
    case "enum": {
      const values = field.options;
      return enumSchema(
        values.map((value) => value.value),
        field.numeric === true,
        metadata,
        undefined,
        values.map((value) => value.label),
      );
    }
  }
}

function ruleSchema(rule: RuleDef): TSchema {
  const properties = Object.fromEntries(
    rule.fields.map((field) => [field.key, Type.Optional(ruleField(field))]),
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
            properties: { custom: { const: false } },
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

function rulesSchema() {
  const rules = Object.fromEntries(
    RULES.map((rule) => [rule.key, Type.Optional(Type.Array(ruleSchema(rule)))]),
  );

  return Type.Object(rules, {
    title: "Rules",
    description: "Monitor, tag, layer, window, and device rules.",
    additionalProperties: false,
  });
}

function rootSchema(version: string) {
  return Type.Object(
    {
      $schema: Type.Optional(
        Type.Literal(`https://mangowm.github.io/schema/${version}/schema.json`, {
          title: "Schema",
          description: "Canonical schema URL for editor tooling.",
        }),
      ),
      global: Type.Optional(globalSchema()),
      env: Type.Optional(envMap()),
      var: Type.Optional(varMap()),
      bind: Type.Optional(
        bindingMap("key", "Key bindings", "Keyboard bindings by key mode and key combination."),
      ),
      mousebind: Type.Optional(
        bindingMap("mouse", "Mouse bindings", "Mouse bindings by key mode and button combination."),
      ),
      axisbind: Type.Optional(
        bindingMap("axis", "Axis bindings", "Scroll axis bindings by key mode and direction."),
      ),
      gesturebind: Type.Optional(
        bindingMap(
          "gesture",
          "Gesture bindings",
          "Gesture bindings by key mode and gesture combination.",
        ),
      ),
      switchbind: Type.Optional(
        bindingMap("switch", "Switch bindings", "Switch bindings by key mode and fold state."),
      ),
      rule: Type.Optional(rulesSchema()),
    },
    {
      description: "Canonical JSON representation of a mangowm configuration.",
      additionalProperties: false,
    },
  );
}

export function buildCanonicalSchema(version: string) {
  return {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    $id: `https://mangowm.github.io/schema/${version}/schema.json`,
    $defs: {
      CanonicalAction,
      CanonicalSingleAction,
      CanonicalConflictActions,
      KeyBindingNode: bindingNode("key", false),
      KeyConflictBindingNode: bindingNode("key", true),
      MouseBindingNode: bindingNode("mouse", false),
      AxisBindingNode: bindingNode("axis", false),
      GestureBindingNode: bindingNode("gesture", false),
      SwitchBindingNode: bindingNode("switch", false),
    },
    ...rootSchema(version),
    title: `mangowm configuration ${version}`,
  } as const;
}
