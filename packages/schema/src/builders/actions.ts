import Type, { type TSchema } from "typebox";

import { VARIABLE_PATTERN } from "../core";
import { canonicalArgsPattern, tomlActionPattern } from "../data/dispatcherArgs";
import { DISPATCHERS } from "../data/dispatchers";

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
    examples: ["spawn,foot", "focusdir,left", "$term"],
  },
);

const TomlSingleAction = Type.Union(
  [
    Type.Ref("#/$defs/TomlActionString"),
    Type.Array(Type.Ref("#/$defs/TomlActionString"), {
      minItems: 1,
      maxItems: 1,
    }),
  ],
  {
    title: "Action",
    description: "One action for this binding.",
  },
);

const TomlMultipleActions = Type.Union(
  [
    Type.Ref("#/$defs/TomlActionString"),
    Type.Array(Type.Ref("#/$defs/TomlActionString"), {
      minItems: 1,
    }),
  ],
  {
    title: "Actions",
    description: "Actions for the same binding.",
  },
);

export function canonicalActionDefs(): Record<string, TSchema> {
  return {
    CanonicalAction,
    CanonicalSingleAction,
    CanonicalConflictActions,
  };
}

export function tomlActionDefs(): Record<string, TSchema> {
  return {
    TomlActionString,
    TomlSingleAction,
    TomlMultipleActions,
  };
}
