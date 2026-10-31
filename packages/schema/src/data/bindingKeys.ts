export type BindingKind = "key" | "mouse" | "axis" | "gesture" | "switch";

function ci(value: string): string {
  return value
    .split("")
    .map((char) => (/[a-z]/.test(char) ? `[${char}${char.toUpperCase()}]` : char))
    .join("");
}

const VARIABLE = "\\$(?:[A-Za-z_][A-Za-z0-9_]*|\\{[A-Za-z_][A-Za-z0-9_]*\\})";
const MODIFIER = `(?:${[
  ci("super"),
  ci("super_l"),
  ci("super_r"),
  ci("ctrl"),
  ci("ctrl_l"),
  ci("ctrl_r"),
  ci("shift"),
  ci("shift_l"),
  ci("shift_r"),
  ci("alt"),
  ci("alt_l"),
  ci("alt_r"),
  ci("hyper"),
  ci("hyper_l"),
  ci("hyper_r"),
  ci("none"),
].join("|")}|code:[0-9]+|${VARIABLE})`;
const KEYSYM = `(?:[A-Za-z0-9_]+|code:[0-9]+|${VARIABLE})`;
const DIRECTION = `(?:${[ci("left"), ci("right"), ci("up"), ci("down"), ci("alldir")].join("|")}|${VARIABLE})`;
const MOUSE_BUTTON = `(?:${[
  ci("btn_left"),
  ci("btn_right"),
  ci("btn_middle"),
  ci("btn_side"),
  ci("btn_extra"),
  ci("btn_forward"),
  ci("btn_back"),
  ci("btn_task"),
].join("|")}|code:[0-9]+|${VARIABLE})`;
const RESERVED = "(?!(?:sym|lock|release|pass|conflict)$)";

export const BINDING_KEY_PATTERNS: Record<BindingKind, string> = {
  key: `^${RESERVED}(?:${MODIFIER}\\+)*${KEYSYM}$`,
  mouse: `^${RESERVED}(?:${MODIFIER}\\+)*${MOUSE_BUTTON}$`,
  axis: `^${RESERVED}(?:${MODIFIER}\\+)*${DIRECTION}$`,
  gesture: `^${RESERVED}${MODIFIER}\\+${DIRECTION}\\+(?:[0-9]+|${VARIABLE})$`,
  switch: `^${RESERVED}(?:${ci("fold")}|${ci("unfold")}|${VARIABLE})$`,
};
