import Type, { type TSchema } from "typebox";

export const COLOR_PATTERN = "^0[xX][0-9a-fA-F]{8}$";

export const VARIABLE_PATTERN = "\\$(?:[A-Za-z_][A-Za-z0-9_]*|\\{[A-Za-z_][A-Za-z0-9_]*\\})";

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
