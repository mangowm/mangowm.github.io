import Type, { type TSchema } from "typebox";

import { type BindingKind } from "./data/bindingKeys";
import { LAYOUTS } from "./data/layouts";

export const COLOR_PATTERN = "^0[xX][0-9a-fA-F]{8}$";

export const VARIABLE_PATTERN = "\\$(?:[A-Za-z_][A-Za-z0-9_]*|\\{[A-Za-z_][A-Za-z0-9_]*\\})";
export const TAG_NUMBER_PATTERN = "(?:[0-9]|[12][0-9]|3[01])";
export const TAG_MASK_PATTERN = `^\\s*${TAG_NUMBER_PATTERN}\\s*(?:\\|\\s*${TAG_NUMBER_PATTERN}\\s*)*$`;
export const TAG_ID_STRINGS = ["*", ...Array.from({ length: 32 }, (_, index) => String(index))];
export const NUMBER_PATTERN = "[+]?[0-9]+(?:\\.[0-9]+)?(?:[eE][+-]?[0-9]+)?";
export const CURVE_STRING_PATTERN = `^\\s*${NUMBER_PATTERN}(?:\\s*,\\s*${NUMBER_PATTERN}){3}\\s*$`;
export const NUMBER_LIST_PATTERN = `^\\s*${NUMBER_PATTERN}(?:\\s*,\\s*${NUMBER_PATTERN})*\\s*$`;
export const LAYOUT_LIST_PATTERN = `^\\s*(?:${LAYOUTS.join("|")})(?:\\s*,\\s*(?:${LAYOUTS.join("|")}))*\\s*$`;

export const BINDING_DEFS: Record<BindingKind, string> = {
  key: "KeyBindingNode",
  mouse: "MouseBindingNode",
  axis: "AxisBindingNode",
  gesture: "GestureBindingNode",
  switch: "SwitchBindingNode",
};

export const TRIGGER_DEFS: Record<BindingKind, string> = {
  key: "KeyTrigger",
  mouse: "MouseTrigger",
  axis: "AxisTrigger",
  gesture: "GestureTrigger",
  switch: "SwitchTrigger",
};

export function enumSchema(
  values: readonly string[],
  numeric: boolean,
  metadata: Record<string, unknown>,
  defaultValue?: unknown,
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
    ...metadata,
    ...(defaultValue === undefined ? {} : { default: defaultValue }),
  });
}

export function bindingMap(kind: BindingKind, title: string, description: string): TSchema {
  const ref = `#/$defs/${BINDING_DEFS[kind]}`;
  return Type.Record(Type.String(), Type.Unsafe<TSchema>({ $ref: ref }), {
    title,
    description,
  });
}
