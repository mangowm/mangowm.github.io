// oxlint-disable unicorn/no-thenable
import Type, { type TSchema } from "typebox";

import {
  BINDING_KEY_PATTERNS,
  GLOBAL_KEY_BINDING_PATTERN,
  type BindingKind,
} from "./data/bindingKeys";
import { tomlActionPattern } from "./data/dispatcherArgs";
import { DISPATCHERS } from "./data/dispatchers";
import { GLOBALS } from "./data/globals";
import { LAYOUTS } from "./data/layouts";
import { RULES } from "./data/rules";
import type { GlobalDef, RuleDef, RuleFieldDef } from "./data/types";
import {
  BINDING_DEFS,
  COLOR_PATTERN,
  CONFLICT_DEF,
  CURVE_STRING_PATTERN,
  LAYOUT_LIST_PATTERN,
  NUMBER_LIST_PATTERN,
  TAG_ID_STRINGS,
  TAG_MASK_PATTERN,
  VARIABLE_PATTERN,
  bindingMap,
  enumSchema,
} from "./core";

const DISPATCHER_PATTERNS = DISPATCHERS.map((name) => tomlActionPattern(name)).join("|");
const ACTION_PATTERN = `^\\s*(?:${DISPATCHER_PATTERNS}|${VARIABLE_PATTERN}(?:\\s*,.*)?)\\s*$`;

const TomlActionName = Type.Unsafe<TSchema>({
  type: "string",
  enum: DISPATCHERS,
  title: "Dispatcher",
  description: "A mangowm dispatcher.",
});

const TomlActionString = Type.Union(
  [
    TomlActionName,
    Type.String({
      title: "Action",
      pattern: ACTION_PATTERN,
    }),
  ],
  {
    title: "Action",
    description: "Dispatcher with arguments, or a variable reference.",
  },
);

const TomlSingleAction = Type.Unsafe<TSchema>({
  title: "Action",
  description: "One action for this binding.",
  anyOf: [
    { $ref: "#/$defs/TomlActionString" },
    {
      type: "array",
      items: { $ref: "#/$defs/TomlActionString" },
      minItems: 1,
      maxItems: 1,
    },
  ],
});

const TomlMultipleActions = Type.Unsafe<TSchema>({
  title: "Actions",
  description: "Actions for the same binding.",
  anyOf: [
    { $ref: "#/$defs/TomlActionString" },
    {
      type: "array",
      items: { $ref: "#/$defs/TomlActionString" },
      minItems: 1,
    },
  ],
});

function globalProperty(option: GlobalDef): TSchema {
  const metadata = { title: option.label, description: option.description };
  switch (option.type) {
    case "bool":
      return Type.Union([Type.Boolean(), Type.Integer({ enum: [0, 1] })], {
        ...metadata,
        default: option.default,
      });
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
        default: option.default,
        ...(option.min === undefined ? {} : { minimum: option.min }),
        ...(option.max === undefined ? {} : { maximum: option.max }),
      });
    case "string":
      return Type.String({ ...metadata, default: option.default });
    case "color":
      return Type.Union(
        [
          Type.String({ pattern: COLOR_PATTERN }),
          Type.Integer({ minimum: 0, maximum: 0xffffffff }),
        ],
        { ...metadata, default: option.default },
      );
    case "curve": {
      const array = Type.Array(Type.Number({ minimum: 0 }), {
        ...metadata,
        default: option.default,
        minItems: 4,
        maxItems: 4,
      });
      return Type.Union([array, Type.String({ pattern: CURVE_STRING_PATTERN })], {
        ...metadata,
        default: option.default,
      });
    }
    case "preset": {
      const hasDefault = option.default.length > 0;
      const array = Type.Array(Type.Number({ minimum: 0.1, maximum: 1 }), {
        ...metadata,
        ...(hasDefault ? { default: option.default } : {}),
        minItems: 1,
      });
      return Type.Union(
        [
          array,
          Type.String({ pattern: NUMBER_LIST_PATTERN }),
          Type.Number({ minimum: 0.1, maximum: 1 }),
        ],
        {
          ...metadata,
          ...(hasDefault ? { default: option.default } : {}),
        },
      );
    }
    case "layout-array": {
      const hasDefault = option.default.length > 0;
      const array = Type.Array(Type.String({ enum: LAYOUTS }), {
        ...metadata,
        ...(hasDefault ? { default: option.default } : {}),
        minItems: 1,
      });
      return Type.Union([array, Type.String({ pattern: LAYOUT_LIST_PATTERN })], {
        ...metadata,
        ...(hasDefault ? { default: option.default } : {}),
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

const EnvValue = Type.Union([Type.String({ minLength: 1 }), Type.Number(), Type.Boolean()]);

function envMap() {
  return Type.Unsafe<TSchema>({
    type: "object",
    title: "Environment",
    description: "Environment variables set at startup and after each config reload.",
    additionalProperties: EnvValue,
    propertyNames: { minLength: 1 },
  });
}

function varMap() {
  return Type.Unsafe<TSchema>({
    type: "object",
    title: "Variables",
    description:
      "Variables used as $name or ${name} in values and binding keys. Unknown names stay as written.",
    additionalProperties: EnvValue,
    propertyNames: { pattern: "^[A-Za-z_][A-Za-z0-9_]*$" },
  });
}

function directive(title: string, description: string) {
  return Type.Union([Type.String({ minLength: 1 }), Type.Array(Type.String({ minLength: 1 }))], {
    title,
    description,
  });
}

function globalSchema() {
  return Type.Object(
    {
      ...globalProperties(),
      exec: Type.Optional(
        directive("Run on load and reload", "Commands run at startup and on each reload."),
      ),
      exec_once: Type.Optional(directive("Run Once", "Commands run once at startup.")),
      source: Type.Optional(directive("Includes", "Loads other config files.")),
      source_optional: Type.Optional(
        directive("Optional Includes", "Loads other config files when they exist."),
      ),
    },
    {
      title: "Global options",
      description: "Global compositor options.",
      additionalProperties: false,
    },
  );
}

function bindingNode(kind: BindingKind, conflict = false): TSchema {
  const description = "Maps input combinations to actions. Flag sub-tables are optional.";

  const nodeDef = kind === "key" && conflict ? CONFLICT_DEF : BINDING_DEFS[kind];
  const conflictDef = kind === "key" ? CONFLICT_DEF : BINDING_DEFS[kind];
  const ref = `#/$defs/${nodeDef}`;
  const valueSchema = {
    $ref: nodeDef === CONFLICT_DEF ? "#/$defs/TomlMultipleActions" : "#/$defs/TomlSingleAction",
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

function ruleField(field: RuleFieldDef): TSchema {
  const metadata = { title: field.label, description: field.description };

  switch (field.type) {
    case "bool":
      return Type.Union([Type.Boolean(), Type.Integer({ enum: [-1, 0, 1] })], metadata);
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
      return Type.Union(
        [
          Type.String({ pattern: COLOR_PATTERN }),
          Type.Integer({ minimum: 0, maximum: 0xffffffff }),
        ],
        metadata,
      );
    case "key-binding":
      return Type.String({ ...metadata, pattern: GLOBAL_KEY_BINDING_PATTERN });
    case "device-name":
      return Type.String({ ...metadata, pattern: "^[^,]+$" });
    case "tag-id":
      return tagIdSchema(metadata);
    case "tag-mask":
      return tagMaskSchema(metadata);
    case "string":
      return Type.String({ ...metadata, pattern: "^[^,]*$" });
    case "enum": {
      const values = field.options;
      const schema = enumSchema(
        values.map((value) => value.value),
        field.numeric === true,
        metadata,
        undefined,
        values.map((value) => value.label),
      );
      if (field.tomlBoolean) {
        return Type.Union([Type.Boolean(), schema], metadata);
      }
      return schema;
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
    allOf: [
      {
        if: { properties: { width: {} }, required: ["width"] },
        then: { properties: { height: {}, refresh: {} }, required: ["height", "refresh"] },
      },
      {
        if: { properties: { height: {} }, required: ["height"] },
        then: { properties: { width: {}, refresh: {} }, required: ["width", "refresh"] },
      },
      {
        if: { properties: { refresh: {} }, required: ["refresh"] },
        then: { properties: { width: {}, height: {} }, required: ["width", "height"] },
      },
      {
        if: { properties: { x: {} }, required: ["x"] },
        then: { properties: { y: {} }, required: ["y"] },
      },
      {
        if: { properties: { y: {} }, required: ["y"] },
        then: { properties: { x: {} }, required: ["x"] },
      },
      {
        if: { properties: { custom: {} }, required: ["custom"] },
        then: {
          anyOf: [
            {
              properties: { custom: { enum: [false, 0] } },
              required: ["custom"],
            },
            {
              properties: { width: {}, height: {}, refresh: {} },
              required: ["width", "height", "refresh"],
            },
          ],
        },
      },
    ],
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

function rootSchema() {
  return Type.Object(
    {
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
          "Gesture bindings by key mode, direction, and finger count.",
        ),
      ),
      switchbind: Type.Optional(
        bindingMap("switch", "Switch bindings", "Switch bindings by key mode and fold state."),
      ),
      rule: Type.Optional(rulesSchema()),
    },
    {
      description: "TOML mangowm configuration.",
      additionalProperties: false,
    },
  );
}

export function buildTomlSchema(version: string) {
  return {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    $id: `https://mangowm.github.io/schema/${version}/toml.schema.json`,
    $defs: {
      TomlActionString,
      TomlSingleAction,
      TomlMultipleActions,
      KeyBindingNode: bindingNode("key", false),
      KeyConflictBindingNode: bindingNode("key", true),
      MouseBindingNode: bindingNode("mouse", false),
      AxisBindingNode: bindingNode("axis", false),
      GestureBindingNode: bindingNode("gesture", false),
      SwitchBindingNode: bindingNode("switch", false),
    },
    ...rootSchema(),
    title: `mangowm TOML configuration ${version}`,
  } as const;
}
