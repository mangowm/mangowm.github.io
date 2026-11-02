import Type, { type TSchema } from "typebox";

import { argsPattern } from "../data/dispatcherArgs";
import { DISPATCHERS } from "../data/dispatchers";

const CANONICAL_ACTION_VARIANTS = [
  ...DISPATCHERS.map((name) => ({
    properties: {
      dispatcher: { const: name },
      args: { type: "string", pattern: argsPattern(name) },
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

const Action: TSchema = Type.Unsafe<TSchema>({
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

const SingleAction = Type.Array(Action, {
  title: "Action",
  description: "The action for this binding.",
  minItems: 1,
  maxItems: 1,
});

const ConflictActions = Type.Array(Action, {
  title: "Actions",
  description: "Actions for the same binding.",
  minItems: 1,
});

export function actionDefs(): Record<string, TSchema> {
  return {
    Action,
    SingleAction,
    ConflictActions,
  };
}
