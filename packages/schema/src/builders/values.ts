// oxlint-disable unicorn/no-thenable
import Type, { type TSchema } from "typebox";

import {
  COLOR_PATTERN,
  CURVE_STRING_PATTERN,
  LAYOUT_LIST_PATTERN,
  NUMBER_LIST_PATTERN,
  TAG_ID_STRINGS,
  TAG_MASK_PATTERN,
  VariableString,
  bindingMap,
  enumSchema,
  withVariable,
} from "../core";
import { GLOBAL_KEY_BINDING_PATTERN } from "../data/bindingKeys";
import { GLOBALS } from "../data/globals";
import { LAYOUTS } from "../data/layouts";
import { RULES } from "../data/rules";
import type { GlobalDef, RuleDef, RuleFieldDef } from "../data/types";
import type { SchemaMode } from "./mode";

type Metadata = Record<string, unknown>;

const ENV_STRING_PATTERN = "^[^,]+,[\\s\\S]*$";
const VAR_STRING_PATTERN = "^[A-Za-z_][A-Za-z0-9_]*,[\\s\\S]*$";

function globalMetadata(
  mode: SchemaMode,
  option: GlobalDef,
  examples: readonly unknown[] | undefined,
): Metadata {
  const defaultValue =
    option.type === "preset" || option.type === "layout-array"
      ? option.default.length > 0
        ? option.default
        : undefined
      : option.default;

  return {
    title: option.label,
    description:
      mode === "toml" ? (option.tomlDescription ?? option.description) : option.description,
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

function globalProperty(mode: SchemaMode, option: GlobalDef): TSchema {
  const examples = mode === "toml" ? (option.tomlExamples ?? option.examples) : option.examples;
  const metadata = globalMetadata(mode, option, examples);

  switch (option.type) {
    case "bool":
      return mode === "canonical"
        ? withVariable(Type.Boolean(), metadata)
        : Type.Union([Type.Boolean(), Type.Integer({ enum: [0, 1] }), VariableString], metadata);
    case "int": {
      const bounds = {
        ...(option.min === undefined ? {} : { minimum: option.min }),
        ...(option.max === undefined ? {} : { maximum: option.max }),
      };
      const base =
        mode === "toml" && option.tomlNumber ? Type.Number(bounds) : Type.Integer(bounds);
      return withVariable(base, metadata);
    }
    case "float": {
      const base = Type.Number({
        ...(option.min === undefined ? {} : { minimum: option.min }),
        ...(option.max === undefined ? {} : { maximum: option.max }),
      });
      return withVariable(base, metadata);
    }
    case "string":
      return Type.String(metadata);
    case "color":
      return mode === "canonical"
        ? withVariable(Type.String({ pattern: COLOR_PATTERN }), metadata)
        : Type.Union(
            [
              Type.String({ pattern: COLOR_PATTERN }),
              Type.Integer({ minimum: 0, maximum: 0xffffffff }),
              VariableString,
            ],
            metadata,
          );
    case "curve": {
      const array = Type.Array(Type.Number({ minimum: 0 }), {
        minItems: 4,
        maxItems: 4,
      });
      return mode === "canonical"
        ? withVariable(array, metadata)
        : Type.Union(
            [array, Type.String({ pattern: CURVE_STRING_PATTERN }), VariableString],
            metadata,
          );
    }
    case "preset": {
      const array = Type.Array(Type.Number({ minimum: 0.1, maximum: 1 }), {
        minItems: 1,
      });
      return mode === "canonical"
        ? withVariable(array, metadata)
        : Type.Union(
            [
              array,
              Type.String({ pattern: NUMBER_LIST_PATTERN }),
              Type.Number({ minimum: 0.1, maximum: 1 }),
              VariableString,
            ],
            metadata,
          );
    }
    case "layout-array": {
      const array = Type.Array(Type.String({ enum: LAYOUTS }), {
        minItems: 1,
      });
      return mode === "canonical"
        ? withVariable(array, metadata)
        : Type.Union(
            [array, Type.String({ pattern: LAYOUT_LIST_PATTERN }), VariableString],
            metadata,
          );
    }
    case "enum": {
      const values = option.options;
      const base = enumSchema(
        values.map((value) => value.value),
        option.numeric === true,
        values.map((value) => value.label),
      );
      return withVariable(base, metadata);
    }
  }
}

export function globalDefs(mode: SchemaMode): Record<string, TSchema> {
  return Object.fromEntries(
    GLOBALS.map((option) => [`GlobalOption.${option.key}`, globalProperty(mode, option)]),
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

function directive(mode: SchemaMode, title: string, description: string): TSchema {
  const string = Type.String({ minLength: 1 });
  if (mode === "canonical") {
    return Type.Array(string, { title, description });
  }
  return Type.Union([string, Type.Array(string)], { title, description });
}

function directiveProperties(mode: SchemaMode): Record<string, TSchema> {
  return {
    exec: Type.Optional(
      directive(mode, "Run on load and reload", "Commands run at startup and on each reload."),
    ),
    exec_once: Type.Optional(directive(mode, "Run Once", "Commands run once at startup.")),
    source: Type.Optional(directive(mode, "Includes", "Loads other config files.")),
    source_optional: Type.Optional(
      directive(mode, "Optional Includes", "Loads other config files when they exist."),
    ),
  };
}

function envMap(mode: SchemaMode): TSchema {
  const value =
    mode === "canonical"
      ? Type.String({ minLength: 1 })
      : Type.Union([Type.String({ minLength: 1 }), Type.Number(), Type.Boolean()]);

  return Type.Unsafe<TSchema>({
    type: "object",
    title: "Environment",
    description: "Environment variables set at startup and after each config reload.",
    additionalProperties: value,
    propertyNames: { minLength: 1 },
  });
}

function varMap(mode: SchemaMode): TSchema {
  const value =
    mode === "canonical"
      ? Type.String()
      : Type.Union([Type.String({ minLength: 1 }), Type.Number(), Type.Boolean()]);

  return Type.Unsafe<TSchema>({
    type: "object",
    title: "Variables",
    description:
      "Variables used as $name or ${name} in values and binding keys. Unknown names stay as written.",
    additionalProperties: value,
    propertyNames: { pattern: "^[A-Za-z_][A-Za-z0-9_]*$" },
  });
}

function compatScalarProperties(): Record<string, TSchema> {
  const properties: Record<string, TSchema> = {
    key_mode: Type.Optional(
      Type.String({
        title: "Key mode",
        description: "Set the key mode for following root-level bindings.",
      }),
    ),
    env: Type.Optional(
      Type.String({
        title: "Environment",
        description: "Environment variable as NAME,value.",
        pattern: ENV_STRING_PATTERN,
      }),
    ),
    var: Type.Optional(
      Type.String({
        title: "Variable",
        description: "Variable as name,value.",
        pattern: VAR_STRING_PATTERN,
      }),
    ),
    bind: Type.Optional(
      Type.String({
        title: "Key binding",
        description: "Key binding as mod,key,dispatcher,args.",
      }),
    ),
    mousebind: Type.Optional(
      Type.String({
        title: "Mouse binding",
        description: "Mouse binding as mod,button,dispatcher,args.",
      }),
    ),
    axisbind: Type.Optional(
      Type.String({
        title: "Axis binding",
        description: "Axis binding as mod,direction,dispatcher,args.",
      }),
    ),
    gesturebind: Type.Optional(
      Type.String({
        title: "Gesture binding",
        description: "Gesture binding as mod,direction,fingers,dispatcher,args.",
      }),
    ),
    switchbind: Type.Optional(
      Type.String({
        title: "Switch binding",
        description: "Switch binding as state,dispatcher,args.",
      }),
    ),
  };

  for (const rule of RULES) {
    properties[rule.key] = Type.Optional(
      Type.String({
        title: rule.label,
        description: rule.description,
      }),
    );
  }

  return properties;
}

function flatGlobalProperties(mode: SchemaMode): Record<string, TSchema> {
  return {
    ...globalProperties(),
    ...directiveProperties(mode),
    ...(mode === "toml" ? compatScalarProperties() : {}),
  };
}

function bindingFlagPatternProperties(): Record<string, TSchema> {
  return {
    "^bind(?:[slrpc]+)$": Type.String({
      title: "Key binding",
      description: "Key binding as mod,key,dispatcher,args.",
    }),
    "^mousebind(?:[slrpc]+)$": Type.String({
      title: "Mouse binding",
      description: "Mouse binding as mod,button,dispatcher,args.",
    }),
    "^axisbind(?:[slrpc]+)$": Type.String({
      title: "Axis binding",
      description: "Axis binding as mod,direction,dispatcher,args.",
    }),
    "^gesturebind(?:[slrpc]+)$": Type.String({
      title: "Gesture binding",
      description: "Gesture binding as mod,direction,fingers,dispatcher,args.",
    }),
    "^switchbind(?:[slrpc]+)$": Type.String({
      title: "Switch binding",
      description: "Switch binding as state,dispatcher,args.",
    }),
  };
}

function globalSchema(mode: SchemaMode): TSchema {
  const object = Type.Object(flatGlobalProperties(mode), {
    title: "Global options",
    description: "Global compositor options.",
    additionalProperties: false,
  });

  if (mode === "canonical") return object;

  return Type.Unsafe<TSchema>({
    ...object,
    patternProperties: bindingFlagPatternProperties(),
  });
}

function tagIdSchema(mode: SchemaMode, metadata: Metadata): TSchema {
  if (mode === "canonical") {
    return Type.Union(
      [
        Type.Integer({ minimum: 0, maximum: 31 }),
        Type.Unsafe<TSchema>({ type: "string", const: "*" }),
        VariableString,
      ],
      metadata,
    );
  }

  return Type.Union(
    [
      Type.Integer({ minimum: 0, maximum: 31 }),
      Type.String({ enum: TAG_ID_STRINGS }),
      VariableString,
    ],
    metadata,
  );
}

function tagMaskSchema(mode: SchemaMode, metadata: Metadata): TSchema {
  if (mode === "canonical") {
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

  return Type.Union(
    [
      Type.Integer({ minimum: -1, maximum: 31 }),
      Type.String({ pattern: TAG_MASK_PATTERN }),
      VariableString,
    ],
    metadata,
  );
}

function ruleField(mode: SchemaMode, field: RuleFieldDef): TSchema {
  const examples = mode === "toml" ? (field.tomlExamples ?? field.examples) : field.examples;
  const metadata = ruleMetadata(field, examples);

  switch (field.type) {
    case "bool":
      return mode === "canonical"
        ? withVariable(Type.Boolean(), metadata)
        : Type.Union(
            [Type.Boolean(), Type.Integer({ enum: [-1, 0, 1] }), VariableString],
            metadata,
          );
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
      return mode === "canonical"
        ? withVariable(Type.String({ pattern: COLOR_PATTERN }), metadata)
        : Type.Union(
            [
              Type.String({ pattern: COLOR_PATTERN }),
              Type.Integer({ minimum: 0, maximum: 0xffffffff }),
              VariableString,
            ],
            metadata,
          );
    case "key-binding":
      return Type.String({ ...metadata, pattern: GLOBAL_KEY_BINDING_PATTERN });
    case "device-name":
      return Type.String({ ...metadata, pattern: "^[^,]+$" });
    case "tag-id":
      return tagIdSchema(mode, metadata);
    case "tag-mask":
      return tagMaskSchema(mode, metadata);
    case "string":
      return Type.String({ ...metadata, pattern: "^[^,]*$" });
    case "enum": {
      const values = field.options;
      const branches: TSchema[] = [];
      if (mode === "toml" && field.tomlBoolean) branches.push(Type.Boolean());
      branches.push(
        enumSchema(
          values.map((value) => value.value),
          field.numeric === true,
          values.map((value) => value.label),
        ),
      );
      branches.push(VariableString);
      return Type.Union(branches, metadata);
    }
  }
}

function ruleSchema(mode: SchemaMode, rule: RuleDef): TSchema {
  const properties = Object.fromEntries(
    rule.fields.map((field) => [field.key, Type.Optional(ruleField(mode, field))]),
  );
  const examples = mode === "toml" ? (rule.tomlExamples ?? rule.examples) : rule.examples;

  const object = Type.Object(properties, {
    title: rule.label,
    description: rule.description,
    ...(examples ? { examples } : {}),
    additionalProperties: false,
  });

  if (rule.key !== "monitor_rule") return object;

  if (mode === "canonical") {
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
              properties: { custom: { anyOf: [{ enum: [false, 0] }, VariableString] } },
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

export function ruleDefs(mode: SchemaMode): Record<string, TSchema> {
  return Object.fromEntries(RULES.map((rule) => [`Rule.${rule.key}`, ruleSchema(mode, rule)]));
}

function ruleEntry(mode: SchemaMode, rule: RuleDef): TSchema {
  const ref = Type.Ref(`#/$defs/Rule.${rule.key}`);
  if (mode === "canonical") return Type.Array(ref);
  return Type.Union([ref, Type.Array(ref)]);
}

function rulesSchema(mode: SchemaMode): TSchema {
  const rules = Object.fromEntries(
    RULES.map((rule) => [rule.key, Type.Optional(ruleEntry(mode, rule))]),
  );

  return Type.Object(rules, {
    title: "Rules",
    description: "Monitor, tag, layer, window, and device rules.",
    additionalProperties: false,
  });
}

export type RootSchema = TSchema & { properties: Record<string, TSchema> };

export function rootSchema(mode: SchemaMode, version: string): RootSchema {
  if (mode === "canonical") {
    return Type.Object(
      {
        $schema: Type.Optional(
          Type.Literal(`https://mangowm.github.io/schema/${version}/schema.json`, {
            title: "Schema",
            description: "Schema URL for editor tooling.",
          }),
        ),
        global: Type.Optional(globalSchema(mode)),
        env: Type.Optional(envMap(mode)),
        var: Type.Optional(varMap(mode)),
        bind: Type.Optional(
          bindingMap("key", "Key bindings", "Keyboard bindings by key mode and key combination."),
        ),
        mousebind: Type.Optional(
          bindingMap(
            "mouse",
            "Mouse bindings",
            "Mouse bindings by key mode and button combination.",
          ),
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
        rule: Type.Optional(rulesSchema(mode)),
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
    ) as RootSchema;
  }

  const properties: Record<string, TSchema> = {
    ...flatGlobalProperties(mode),
    global: Type.Optional(globalSchema(mode)),
    env: Type.Optional(
      Type.Union([envMap(mode), Type.String({ pattern: ENV_STRING_PATTERN })], {
        title: "Environment",
        description: "Environment variables as a table or NAME,value strings.",
      }),
    ),
    var: Type.Optional(
      Type.Union([varMap(mode), Type.String({ pattern: VAR_STRING_PATTERN })], {
        title: "Variables",
        description: "Variables as a table or name,value strings.",
      }),
    ),
    bind: Type.Optional(
      Type.Union(
        [
          bindingMap("key", "Key bindings", "Keyboard bindings by key mode and key combination."),
          Type.String({
            title: "Key binding",
            description: "Key binding as mod,key,dispatcher,args.",
          }),
        ],
        {
          title: "Key bindings",
          description: "Keyboard bindings as a table or mod,key,dispatcher,args strings.",
        },
      ),
    ),
    keybind: Type.Optional(bindingMap("key", "Key bindings", "Alias for bind.")),
    mousebind: Type.Optional(
      Type.Union(
        [
          bindingMap(
            "mouse",
            "Mouse bindings",
            "Mouse bindings by key mode and button combination.",
          ),
          Type.String({
            title: "Mouse binding",
            description: "Mouse binding as mod,button,dispatcher,args.",
          }),
        ],
        {
          title: "Mouse bindings",
          description: "Mouse bindings as a table or mod,button,dispatcher,args strings.",
        },
      ),
    ),
    axisbind: Type.Optional(
      Type.Union(
        [
          bindingMap("axis", "Axis bindings", "Scroll axis bindings by key mode and direction."),
          Type.String({
            title: "Axis binding",
            description: "Axis binding as mod,direction,dispatcher,args.",
          }),
        ],
        {
          title: "Axis bindings",
          description: "Axis bindings as a table or mod,direction,dispatcher,args strings.",
        },
      ),
    ),
    gesturebind: Type.Optional(
      Type.Union(
        [
          bindingMap(
            "gesture",
            "Gesture bindings",
            "Gesture bindings by key mode, direction, and finger count.",
          ),
          Type.String({
            title: "Gesture binding",
            description: "Gesture binding as mod,direction,fingers,dispatcher,args.",
          }),
        ],
        {
          title: "Gesture bindings",
          description:
            "Gesture bindings as a table or mod,direction,fingers,dispatcher,args strings.",
        },
      ),
    ),
    switchbind: Type.Optional(
      Type.Union(
        [
          bindingMap("switch", "Switch bindings", "Switch bindings by key mode and fold state."),
          Type.String({
            title: "Switch binding",
            description: "Switch binding as state,dispatcher,args.",
          }),
        ],
        {
          title: "Switch bindings",
          description: "Switch bindings as a table or state,dispatcher,args strings.",
        },
      ),
    ),
    rule: Type.Optional(rulesSchema(mode)),
  };

  for (const rule of RULES) {
    properties[rule.key] = Type.Optional(
      Type.Union(
        [ruleEntry(mode, rule), Type.String({ title: rule.label, description: rule.description })],
        {
          title: rule.label,
          description: rule.description,
        },
      ),
    );
  }

  const object = Type.Object(properties, {
    description:
      "TOML mangowm configuration. Options belong under [global]; root-level options are accepted for parser compatibility.",
    examples: [
      {
        global: { animations: 1, root_color: "0x323232ff" },
        bind: {
          default: { "SUPER+Return": "spawn,foot" },
        },
      },
    ],
    additionalProperties: false,
  });

  return Type.Unsafe<TSchema>({
    ...object,
    patternProperties: bindingFlagPatternProperties(),
  }) as unknown as RootSchema;
}
