import Type, { type TSchema } from "typebox";

import { type BindingKind } from "./data/bindingKeys";

export const COLOR_PATTERN = "^0[xX][0-9a-fA-F]{8}$";

export const VARIABLE_PATTERN = "\\$(?:[A-Za-z_][A-Za-z0-9_]*|\\{[A-Za-z_][A-Za-z0-9_]*\\})";

export const BINDING_DEFS: Record<BindingKind, string> = {
  key: "KeyBindingNode",
  mouse: "MouseBindingNode",
  axis: "AxisBindingNode",
  gesture: "GestureBindingNode",
  switch: "SwitchBindingNode",
};

export const VariableString = Type.String({
  pattern: `^(?:${VARIABLE_PATTERN})$`,
});

export function withVariable(schema: TSchema, metadata: Record<string, unknown> = {}): TSchema {
  return Type.Union([schema, VariableString], metadata);
}

export function enumSchema(
  values: readonly string[],
  numeric: boolean,
  labels?: readonly string[],
): TSchema {
  const hasLabels = labels?.some((label) => Boolean(label)) ?? false;
  const branches = values.map((value, index) => ({
    type: numeric ? "integer" : "string",
    const: numeric ? Number(value) : value,
    ...(labels?.[index] ? { title: labels[index] } : {}),
  }));

  return Type.Unsafe<TSchema>({
    type: numeric ? "integer" : "string",
    enum: numeric ? values.map(Number) : [...values],
    ...(hasLabels ? { oneOf: branches } : {}),
  });
}

export function bindingMap(kind: BindingKind, title: string, description: string): TSchema {
  return Type.Record(Type.String(), Type.Ref(`#/$defs/${BINDING_DEFS[kind]}`), {
    title,
    description,
  });
}
