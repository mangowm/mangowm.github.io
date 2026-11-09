import { LAYOUTS, type GlobalDef } from "./schema/data";

import type { OptionValue } from "./types";

/** A value that cannot be normalized. The caller decides whether to warn or stop. */
export class ValueError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValueError";
  }
}

const VARIABLE = /^\$(?:([A-Za-z_][A-Za-z0-9_]*)|\{([A-Za-z_][A-Za-z0-9_]*)\})$/;
const INTEGER = /^[+-]?\d+$/;
const COLOR = /^(?:0x|#)([0-9a-f]{6}|[0-9a-f]{8})$/i;

const TRUE = new Set(["1", "true", "yes", "on"]);
const FALSE = new Set(["0", "false", "no", "off"]);

/** The name of a `$name` or `${name}` reference, without the syntax. */
export function variableName(text: string): string | null {
  const match = VARIABLE.exec(text.trim());
  if (!match) return null;
  return match[1] ?? match[2] ?? null;
}

/** Whether a value is a `$name` or `${name}` reference, which stays unresolved. */
export function isVariable(text: string): boolean {
  return variableName(text) !== null;
}

/** Parse a boolean from `1`/`0` or `true`/`false`. */
export function parseBool(text: string): boolean {
  const value = text.trim().toLowerCase();
  if (TRUE.has(value)) return true;
  if (FALSE.has(value)) return false;
  throw new ValueError(`expected a boolean, got "${text}"`);
}

/** Parse an integer. */
export function parseInteger(text: string): number {
  const value = text.trim();
  if (!INTEGER.test(value)) {
    throw new ValueError(`expected an integer, got "${text}"`);
  }
  return Number(value);
}

/** Parse a finite number. */
export function parseNumber(text: string): number {
  const value = text.trim();
  if (value === "") throw new ValueError("expected a number, got an empty value");
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new ValueError(`expected a number, got "${text}"`);
  }
  return parsed;
}

/** Normalize a color to `0xrrggbbaa`. */
export function parseColor(text: string): string {
  const match = COLOR.exec(text.trim());
  if (!match) {
    throw new ValueError(`expected a color, got "${text}"`);
  }
  const hex = (match[1] ?? "").toLowerCase();
  return `0x${hex.length === 6 ? `${hex}ff` : hex}`;
}

function numbers(text: string): number[] {
  return text
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part !== "")
    .map(parseNumber);
}

/** Parse a four-point animation curve. Mango rejects negative points. */
export function parseCurve(text: string): number[] {
  const curve = numbers(text);
  if (curve.length !== 4) {
    throw new ValueError(`expected four curve points, got ${curve.length}`);
  }
  if (curve.some((point) => point < 0)) {
    throw new ValueError("curve points must not be negative");
  }
  return curve;
}

/** Parse a preset list. The normalizer clamps values to the schema range. */
export function parsePreset(text: string): number[] {
  const preset = numbers(text);
  if (preset.length === 0) {
    throw new ValueError("expected at least one preset value");
  }
  return preset;
}

/** Parse a comma-separated layout list. */
export function parseLayouts(text: string): string[] {
  const layouts = text
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part !== "");

  if (layouts.length === 0) {
    throw new ValueError("expected at least one layout");
  }

  for (const layout of layouts) {
    if (!(LAYOUTS as readonly string[]).includes(layout)) {
      throw new ValueError(`unknown layout "${layout}"`);
    }
  }

  return layouts;
}

/** Parse a string enum, returning a number for numeric enums. */
export function parseEnum(
  text: string,
  options: readonly { value: string }[],
  numeric = false,
): string | number {
  const value = text.trim();

  if (numeric) {
    const parsed = parseInteger(value);
    if (options.some((option) => Number(option.value) === parsed)) return parsed;
  } else if (options.some((option) => option.value === value)) {
    return value;
  }

  const allowed = options.map((option) => option.value).join(", ");
  throw new ValueError(`expected one of ${allowed}, got "${text}"`);
}

/** Parse one global option value from its text form. */
export function parseOption(text: string, def: GlobalDef): OptionValue {
  if (isVariable(text)) return text;

  switch (def.type) {
    case "bool":
      return parseBool(text);
    case "int":
      return parseInteger(text);
    case "float":
      return parseNumber(text);
    case "string":
      return text;
    case "enum":
      return parseEnum(text, def.options, def.numeric ?? false);
    case "color":
      return parseColor(text);
    case "curve":
      return parseCurve(text);
    case "preset":
      return parsePreset(text);
    case "layout-array":
      return parseLayouts(text);
  }
}
