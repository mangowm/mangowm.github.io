import {
  BINDING_BARE_MODIFIERS,
  BINDING_DIRECTIONS,
  BINDING_FLAGS,
  BINDING_FOLD_STATES,
  BINDING_MODIFIER_CODES,
  BINDING_MODIFIERS,
  MOUSE_BUTTONS,
  type BindingKind,
} from "./bindings";

export type { BindingKind };

function ci(value: string): string {
  return value
    .split("")
    .map((char) => (/[a-z]/.test(char) ? `[${char}${char.toUpperCase()}]` : char))
    .join("");
}

const VARIABLE = "\\$(?:[A-Za-z_][A-Za-z0-9_]*|\\{[A-Za-z_][A-Za-z0-9_]*\\})";
const MODIFIER = `(?:${BINDING_MODIFIERS.map(ci).join("|")}|code:(?:${BINDING_MODIFIER_CODES.join(
  "|",
)})|${VARIABLE})`;
const BARE_MODIFIER = `(?:${BINDING_BARE_MODIFIERS.map(ci).join("|")})`;
const KEYSYM = `(?!${BARE_MODIFIER}\\s*$)(?:[A-Za-z0-9_]+|code:[0-9]+|${VARIABLE})`;
const DIRECTION = `(?:${BINDING_DIRECTIONS.map(ci).join("|")}|${VARIABLE})`;
const MOUSE_BUTTON = `(?:${MOUSE_BUTTONS.map(ci).join("|")}|code:[0-9]+|${VARIABLE})`;
const RESERVED = `(?!(?:${BINDING_FLAGS.join("|")})$)`;

export const BINDING_KEY_PATTERNS: Record<BindingKind, string> = {
  key: `^${RESERVED}(?:${MODIFIER}\\s*\\+\\s*)*${KEYSYM}$`,
  mouse: `^${RESERVED}(?:${MODIFIER}\\s*\\+\\s*)*${MOUSE_BUTTON}$`,
  axis: `^${RESERVED}(?:${MODIFIER}\\s*\\+\\s*)*${DIRECTION}$`,
  gesture: `^${RESERVED}${MODIFIER}\\s*\\+\\s*${DIRECTION}\\s*\\+\\s*(?:[0-9]+|${VARIABLE})$`,
  switch: `^${RESERVED}(?:${BINDING_FOLD_STATES.map(ci).join("|")}|${VARIABLE})$`,
};

export const GLOBAL_KEY_BINDING_PATTERN = `^${MODIFIER}(?:\\s*\\+\\s*${MODIFIER})*\\s*-\\s*${KEYSYM}$`;
