import { MODIFIER_KEYS } from "./xkb-keys";

const JS_TO_XKB: Record<string, string> = {
  " ": "space",
  Enter: "Return",
  Tab: "Tab",

  ArrowLeft: "Left",
  ArrowRight: "Right",
  ArrowUp: "Up",
  ArrowDown: "Down",
  Home: "Home",
  End: "End",
  PageUp: "Page_Up",
  PageDown: "Page_Down",

  Backspace: "BackSpace",
  Delete: "Delete",
  Insert: "Insert",

  Escape: "Escape",
  ContextMenu: "Menu",

  CapsLock: "Caps_Lock",
  NumLock: "Num_Lock",
  ScrollLock: "Scroll_Lock",

  PrintScreen: "Print",
  Pause: "Pause",

  "-": "minus",
  "=": "equal",
  "[": "bracketleft",
  "]": "bracketright",
  ";": "semicolon",
  "'": "apostrophe",
  ",": "comma",
  ".": "period",
  "/": "slash",
  "\\": "backslash",
  "`": "grave",

  _: "underscore",
  "+": "plus",
  "{": "braceleft",
  "}": "braceright",
  ":": "colon",
  '"': "quotedbl",
  "<": "less",
  ">": "greater",
  "?": "question",
  "|": "bar",
  "~": "asciitilde",
  "!": "exclam",
  "@": "at",
  "#": "numbersign",
  $: "dollar",
  "%": "percent",
  "^": "asciicircum",
  "&": "ampersand",
  "*": "asterisk",
  "(": "parenleft",
  ")": "parenright",
};

export function jsKeyToXkb(jsKey: string): string | null {
  if (MODIFIER_KEYS.has(jsKey)) return null;

  const mapped = JS_TO_XKB[jsKey];
  if (mapped) return mapped;

  if (jsKey.length === 1 && jsKey >= "A" && jsKey <= "Z") {
    return jsKey.toLowerCase();
  }

  return jsKey;
}
