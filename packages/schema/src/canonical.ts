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
import { COLOR_PATTERN, bindingMap, enumSchema } from "./core";

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
        description: "Config variable name.",
      },
      args: {
        type: "string",
        title: "Arguments",
        description: "Text after the first comma.",
      },
    },
    required: ["variable"],
  },
];

const CanonicalAction: TSchema = Type.Unsafe<TSchema>({
  title: "Action",
  description: "Dispatcher call or variable reference.",
  examples: [
    { dispatcher: "spawn", args: "foot" },
    { dispatcher: "focusdir", args: "left" },
    { variable: "term", args: "--hold" },
  ],
  type: "object",
  properties: {
    dispatcher: { type: "string", enum: DISPATCHERS, title: "Dispatcher" },
    variable: {
      type: "string",
      pattern: "^[A-Za-z_][A-Za-z0-9_]*$",
      title: "Variable",
      description: "Config variable name.",
    },
    args: {
      type: "string",
      title: "Arguments",
      description: "Text after the first comma.",
    },
  },
  additionalProperties: false,
  oneOf: CANONICAL_ACTION_VARIANTS,
});

const CanonicalSingleAction = Type.Array(CanonicalAction, {
  title: "Action",
  description: "The action for this binding.",
  minItems: 1,
  maxItems: 1,
});

const CanonicalConflictActions = Type.Array(CanonicalAction, {
  title: "Actions",
  description: "Actions for the same binding.",
  minItems: 1,
});

function globalProperty(option: GlobalDef): TSchema {
  const metadata = {
    title: option.label,
    description: option.description,
    ...(option.examples ? { examples: option.examples } : {}),
  };
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
    description: "Environment variables set at startup and after each config reload.",
    additionalProperties: Type.String({ minLength: 1 }),
    propertyNames: { minLength: 1 },
  });
}

function varMap() {
  return Type.Unsafe<TSchema>({
    type: "object",
    title: "Variables",
    description:
      "Variables used as $name or ${name} in values and binding keys. Unknown names stay as written.",
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

const KEY_FLAGS = ["sym", "lock", "release", "pass", "conflict"] as const;
const KEY_FLAG_DEFS = [
  "KeyBindingNode",
  "KeySymBindingNode",
  "KeyLockBindingNode",
  "KeyReleaseBindingNode",
  "KeyPassBindingNode",
  "KeyConflictBindingNode",
] as const;

function keyBindingNode(start: number): TSchema {
  const properties = Object.fromEntries(
    KEY_FLAGS.map((flag, index) => [flag, index] as const)
      .filter(([, index]) => index >= start)
      .map(([flag, index]) => [flag, { $ref: `#/$defs/${KEY_FLAG_DEFS[index + 1]}` }]),
  );

  return Type.Unsafe<TSchema>({
    title: start === 0 ? "Binding node" : `Binding node after ${KEY_FLAGS[start - 1]}`,
    description: "Maps key combinations to actions. Flag sub-tables are optional.",
    type: "object",
    properties,
    patternProperties: {
      [BINDING_KEY_PATTERNS.key]: {
        $ref:
          start === KEY_FLAGS.length
            ? "#/$defs/CanonicalConflictActions"
            : "#/$defs/CanonicalSingleAction",
      },
    },
    additionalProperties: false,
  });
}

function plainBindingNode(kind: BindingKind): TSchema {
  return Type.Unsafe<TSchema>({
    title: "Binding node",
    description: "Maps input combinations to actions.",
    type: "object",
    patternProperties: {
      [BINDING_KEY_PATTERNS[kind]]: { $ref: "#/$defs/CanonicalSingleAction" },
    },
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
  const metadata = {
    title: field.label,
    description: field.description,
    ...(field.examples ? { examples: field.examples } : {}),
  };

  switch (field.type) {
    case "bool":
      return Type.Union([Type.Boolean(), Type.Integer({ const: -1 })], metadata);
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
        description: "Tags to assign as an array. Use [0] for the special workspace overlay.",
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
    ...(rule.examples ? { examples: rule.examples } : {}),
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
          description: "Schema URL for editor tooling.",
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
          "Gesture bindings by key mode, direction, and finger count.",
        ),
      ),
      switchbind: Type.Optional(
        bindingMap("switch", "Switch bindings", "Switch bindings by key mode and fold state."),
      ),
      rule: Type.Optional(rulesSchema()),
    },
    {
      description: "Canonical mangowm configuration.",
      examples: [
        {
          global: { animations: true, root_color: "0x323232ff" },
          bind: {
            default: {
              "SUPER+Return": [{ dispatcher: "spawn", args: "foot" }],
            },
          },
        },
      ],
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
      KeyBindingNode: keyBindingNode(0),
      KeySymBindingNode: keyBindingNode(1),
      KeyLockBindingNode: keyBindingNode(2),
      KeyReleaseBindingNode: keyBindingNode(3),
      KeyPassBindingNode: keyBindingNode(4),
      KeyConflictBindingNode: keyBindingNode(5),
      MouseBindingNode: plainBindingNode("mouse"),
      AxisBindingNode: plainBindingNode("axis"),
      GestureBindingNode: plainBindingNode("gesture"),
      SwitchBindingNode: plainBindingNode("switch"),
    },
    ...rootSchema(version),
    title: `mangowm configuration ${version}`,
  } as const;
}
