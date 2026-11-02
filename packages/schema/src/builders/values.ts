// oxlint-disable unicorn/no-thenable
import Type, { type TSchema } from "typebox";

import { COLOR_PATTERN, VariableString, bindingMap, enumSchema, withVariable } from "../core";
import { GLOBAL_KEY_BINDING_PATTERN } from "../data/bindingKeys";
import { GLOBALS } from "../data/globals";
import { LAYOUTS } from "../data/layouts";
import { RULES } from "../data/rules";
import type { GlobalDef, RuleDef, RuleFieldDef } from "../data/types";

type Metadata = Record<string, unknown>;

function globalMetadata(option: GlobalDef, examples: readonly unknown[] | undefined): Metadata {
  const defaultValue =
    option.type === "preset" || option.type === "layout-array"
      ? option.default.length > 0
        ? option.default
        : undefined
      : option.default;

  return {
    title: option.label,
    description: option.description,
    ...(examples ? { examples } : {}),
    ...(defaultValue === undefined ? {} : { default: defaultValue }),
  };
}

function ruleMetadata(field: RuleFieldDef, examples: readonly unknown[] | undefined): Metadata {
  return {
    title: field.label,
    description: field.description,
    ...(examples ? { examples } : {}),
  };
}

function globalProperty(option: GlobalDef): TSchema {
  const metadata = globalMetadata(option, option.examples);

  switch (option.type) {
    case "bool":
      return withVariable(Type.Boolean(), metadata);
    case "int":
      return withVariable(
        Type.Integer({
          ...(option.min === undefined ? {} : { minimum: option.min }),
          ...(option.max === undefined ? {} : { maximum: option.max }),
        }),
        metadata,
      );
    case "float":
      return withVariable(
        Type.Number({
          ...(option.min === undefined ? {} : { minimum: option.min }),
          ...(option.max === undefined ? {} : { maximum: option.max }),
        }),
        metadata,
      );
    case "string":
      return Type.String(metadata);
    case "color":
      return withVariable(Type.String({ pattern: COLOR_PATTERN }), metadata);
    case "curve":
      return withVariable(
        Type.Array(Type.Number({ minimum: 0 }), {
          minItems: 4,
          maxItems: 4,
        }),
        metadata,
      );
    case "preset":
      return withVariable(
        Type.Array(Type.Number({ minimum: 0.1, maximum: 1 }), {
          minItems: 1,
        }),
        metadata,
      );
    case "layout-array":
      return withVariable(
        Type.Array(Type.String({ enum: LAYOUTS }), {
          minItems: 1,
        }),
        metadata,
      );
    case "enum": {
      const values = option.options;
      return withVariable(
        enumSchema(
          values.map((value) => value.value),
          option.numeric === true,
          values.map((value) => value.label),
        ),
        metadata,
      );
    }
  }
}

export function globalDefs(): Record<string, TSchema> {
  return Object.fromEntries(
    GLOBALS.map((option) => [`GlobalOption.${option.key}`, globalProperty(option)]),
  );
}

function globalProperties(): Record<string, TSchema> {
  return Object.fromEntries(
    GLOBALS.map((option) => [
      option.key,
      Type.Optional(Type.Ref(`#/$defs/GlobalOption.${option.key}`)),
    ]),
  );
}

function directive(title: string, description: string): TSchema {
  return Type.Array(Type.String({ minLength: 1 }), { title, description });
}

function directiveProperties(): Record<string, TSchema> {
  return {
    exec: Type.Optional(
      directive("Run on load and reload", "Commands run at startup and on each reload."),
    ),
    exec_once: Type.Optional(directive("Run Once", "Commands run once at startup.")),
    source: Type.Optional(directive("Includes", "Loads other config files.")),
    source_optional: Type.Optional(
      directive("Optional Includes", "Loads other config files when they exist."),
    ),
  };
}

function envMap(): TSchema {
  return Type.Unsafe<TSchema>({
    type: "object",
    title: "Environment",
    description: "Environment variables set at startup and after each config reload.",
    additionalProperties: Type.String({ minLength: 1 }),
    propertyNames: { minLength: 1 },
  });
}

function varMap(): TSchema {
  return Type.Unsafe<TSchema>({
    type: "object",
    title: "Variables",
    description:
      "Variables used as $name or ${name} in values and binding keys. Unknown names stay as written.",
    additionalProperties: Type.String(),
    propertyNames: { pattern: "^[A-Za-z_][A-Za-z0-9_]*$" },
  });
}

function flatGlobalProperties(): Record<string, TSchema> {
  return {
    ...globalProperties(),
    ...directiveProperties(),
  };
}

function globalSchema(): TSchema {
  return Type.Object(flatGlobalProperties(), {
    title: "Global options",
    description: "Global compositor options.",
    additionalProperties: false,
  });
}

function tagIdSchema(metadata: Metadata): TSchema {
  return Type.Union(
    [
      Type.Integer({ minimum: 0, maximum: 31 }),
      Type.Unsafe<TSchema>({ type: "string", const: "*" }),
      VariableString,
    ],
    metadata,
  );
}

function tagMaskSchema(metadata: Metadata): TSchema {
  return Type.Union(
    [
      Type.Unsafe<TSchema>({ const: [0] }),
      Type.Array(Type.Integer({ minimum: 1, maximum: 31 }), {
        minItems: 1,
        uniqueItems: true,
      }),
      VariableString,
    ],
    metadata,
  );
}

function ruleField(field: RuleFieldDef): TSchema {
  const metadata = ruleMetadata(field, field.examples);

  switch (field.type) {
    case "bool":
      return withVariable(Type.Boolean(), metadata);
    case "int":
      return withVariable(
        Type.Integer({
          ...("min" in field && field.min !== undefined ? { minimum: field.min } : {}),
          ...("max" in field && field.max !== undefined ? { maximum: field.max } : {}),
        }),
        metadata,
      );
    case "float":
      return withVariable(
        Type.Number({
          ...("min" in field && field.min !== undefined ? { minimum: field.min } : {}),
          ...("max" in field && field.max !== undefined ? { maximum: field.max } : {}),
        }),
        metadata,
      );
    case "color":
      return withVariable(Type.String({ pattern: COLOR_PATTERN }), metadata);
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
      return withVariable(
        enumSchema(
          values.map((value) => value.value),
          field.numeric === true,
          values.map((value) => value.label),
        ),
        metadata,
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
            properties: { custom: { anyOf: [{ const: false }, VariableString] } },
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

export function ruleDefs(): Record<string, TSchema> {
  return Object.fromEntries(RULES.map((rule) => [`Rule.${rule.key}`, ruleSchema(rule)]));
}

function ruleEntry(rule: RuleDef): TSchema {
  return Type.Array(Type.Ref(`#/$defs/Rule.${rule.key}`));
}

function rulesSchema(): TSchema {
  const rules = Object.fromEntries(RULES.map((rule) => [rule.key, Type.Optional(ruleEntry(rule))]));

  return Type.Object(rules, {
    title: "Rules",
    description: "Monitor, tag, layer, window, and device rules.",
    additionalProperties: false,
  });
}

export type RootSchema = TSchema & { properties: Record<string, TSchema> };

export function rootSchema(version: string): RootSchema {
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
      description: "mangowm configuration.",
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
  ) as RootSchema;
}
