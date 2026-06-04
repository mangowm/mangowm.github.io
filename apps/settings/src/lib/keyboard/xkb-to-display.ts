const XKB_TO_DISPLAY: Record<string, string> = {
  space: "Space",

  Left: "←",
  Right: "→",
  Up: "↑",
  Down: "↓",

  minus: "−",
  equal: "=",
  bracketleft: "[",
  bracketright: "]",
  semicolon: ";",
  apostrophe: "'",
  comma: ",",
  period: ".",
  slash: "/",
  backslash: "\\",
  grave: "`",
  underscore: "_",
  plus: "+",
  braceleft: "{",
  braceright: "}",
  colon: ":",
  quotedbl: '"',
  less: "<",
  greater: ">",
  question: "?",
  bar: "|",
  asciitilde: "~",
  exclam: "!",
  at: "@",
  numbersign: "#",
  dollar: "$",
  percent: "%",
  asciicircum: "^",
  ampersand: "&",
  asterisk: "*",
  parenleft: "(",
  parenright: ")",
};

export function xkbToDisplay(xkbKey: string): string {
  const mapped = XKB_TO_DISPLAY[xkbKey];
  if (mapped) return mapped;

  if (xkbKey.length === 1 && xkbKey >= "a" && xkbKey <= "z") {
    return xkbKey.toUpperCase();
  }

  if (xkbKey.includes("_")) {
    return xkbKey.replace(/_/g, " ");
  }

  return xkbKey;
}
