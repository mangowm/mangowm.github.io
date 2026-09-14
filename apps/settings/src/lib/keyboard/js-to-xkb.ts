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

  /* Multimedia / media keys */
  AudioVolumeMute: "XF86AudioMute",
  AudioVolumeDown: "XF86AudioLowerVolume",
  AudioVolumeUp: "XF86AudioRaiseVolume",
  MediaPlayPause: "XF86AudioPlay",
  MediaTrackNext: "XF86AudioNext",
  MediaTrackPrevious: "XF86AudioPrev",
  MediaStop: "XF86AudioStop",

  /* Brightness */
  BrightnessDown: "XF86MonBrightnessDown",
  BrightnessUp: "XF86MonBrightnessUp",

  /* Launch / application keys */
  LaunchMail: "XF86Mail",
  LaunchApplication1: "XF86WWW",
  LaunchApplication2: "XF86Calculator",
  LaunchMediaPlayer: "XF86AudioMedia",

  /* Other common system keys */
  Eject: "XF86Eject",
  Sleep: "XF86Sleep",
  Power: "XF86PowerOff",
  Search: "XF86Search",
  Tools: "XF86Tools",
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
