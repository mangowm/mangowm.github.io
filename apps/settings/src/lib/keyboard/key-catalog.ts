export interface KeyNameInfo {
  name: string;
  aliases?: string[];
}

export interface KeyGroup {
  label: string;
  keys: KeyNameInfo[];
}

export const KEY_GROUPS: KeyGroup[] = [
  {
    label: "Most Common",
    keys: [
      { name: "Return", aliases: ["Enter", "CR"] },
      { name: "Escape", aliases: ["Esc"] },
      { name: "Tab" },
      { name: "space", aliases: ["Space", "SPC"] },
      { name: "BackSpace", aliases: ["Backspace", "Bksp", "BS"] },
      { name: "Delete", aliases: ["Del"] },
    ],
  },
  {
    label: "Letters",
    keys: "abcdefghijklmnopqrstuvwxyz".split("").map((c) => ({
      name: c,
      aliases: [c.toUpperCase()],
    })),
  },
  {
    label: "Numbers",
    keys: "0123456789".split("").map((c) => ({ name: c })),
  },
  {
    label: "Function Keys",
    keys: Array.from({ length: 24 }, (_, i) => ({
      name: `F${i + 1}`,
    })),
  },
  {
    label: "Navigation",
    keys: [
      { name: "Up", aliases: ["ArrowUp"] },
      { name: "Down", aliases: ["ArrowDown"] },
      { name: "Left", aliases: ["ArrowLeft"] },
      { name: "Right", aliases: ["ArrowRight"] },
      { name: "Home" },
      { name: "End" },
      { name: "Page_Up", aliases: ["Prior", "PgUp", "PageUp"] },
      { name: "Page_Down", aliases: ["Next", "PgDn", "PageDown"] },
    ],
  },
  {
    label: "Editing",
    keys: [
      { name: "Insert", aliases: ["Ins"] },
      { name: "Print", aliases: ["PrtSc", "PrintScreen"] },
      { name: "Sys_Req", aliases: ["SysReq"] },
      { name: "Pause" },
      { name: "Break" },
      { name: "Menu", aliases: ["Application", "ContextMenu"] },
      { name: "Clear", aliases: ["Cancel"] },
      { name: "Help" },
      { name: "Undo" },
      { name: "Redo", aliases: ["Again"] },
    ],
  },
  {
    label: "Lock Keys",
    keys: [
      { name: "Caps_Lock", aliases: ["Caps", "CapsLock"] },
      { name: "Num_Lock", aliases: ["Num", "NumLock"] },
      { name: "Scroll_Lock", aliases: ["Scroll", "ScrollLock"] },
    ],
  },
  {
    label: "Keypad",
    keys: [
      ...Array.from({ length: 10 }, (_, i) => ({
        name: `KP_${i}`,
      })),
      { name: "KP_Add", aliases: ["KP_Plus", "+"] },
      { name: "KP_Subtract", aliases: ["KP_Minus", "-"] },
      { name: "KP_Multiply", aliases: ["KP_Asterisk", "*"] },
      { name: "KP_Divide", aliases: ["KP_Slash", "/"] },
      { name: "KP_Enter" },
      { name: "KP_Decimal", aliases: ["KP_Period", "."] },
      { name: "KP_Equal" },
    ],
  },
  {
    label: "Symbols",
    keys: [
      { name: "grave", aliases: ["`", "backtick", "backquote"] },
      { name: "minus", aliases: ["-"] },
      { name: "equal", aliases: ["="] },
      { name: "bracketleft", aliases: ["["] },
      { name: "bracketright", aliases: ["]"] },
      { name: "backslash", aliases: ["\\"] },
      { name: "semicolon", aliases: [";"] },
      { name: "apostrophe", aliases: ["'", "quote"] },
      { name: "comma", aliases: [","] },
      { name: "period", aliases: [".", "dot"] },
      { name: "slash", aliases: ["/"] },
    ],
  },
  {
    label: "Shifted Symbols",
    keys: [
      { name: "asciitilde", aliases: ["~", "tilde"] },
      { name: "exclam", aliases: ["!", "exclamation"] },
      { name: "at", aliases: ["@"] },
      { name: "numbersign", aliases: ["#", "hash", "pound"] },
      { name: "dollar", aliases: ["$"] },
      { name: "percent", aliases: ["%"] },
      { name: "asciicircum", aliases: ["^", "caret"] },
      { name: "ampersand", aliases: ["&"] },
      { name: "asterisk", aliases: ["*"] },
      { name: "parenleft", aliases: ["("] },
      { name: "parenright", aliases: [")"] },
      { name: "underscore", aliases: ["_"] },
      { name: "plus", aliases: ["+"] },
      { name: "braceleft", aliases: ["{"] },
      { name: "braceright", aliases: ["}"] },
      { name: "bar", aliases: ["|", "pipe"] },
      { name: "colon", aliases: [":"] },
      { name: "quotedbl", aliases: ['"', "doublequote"] },
      { name: "less", aliases: ["<"] },
      { name: "greater", aliases: [">"] },
      { name: "question", aliases: ["?"] },
    ],
  },
  {
    label: "Multimedia",
    keys: [
      { name: "XF86AudioRaiseVolume", aliases: ["VolumeUp"] },
      { name: "XF86AudioLowerVolume", aliases: ["VolumeDown"] },
      { name: "XF86AudioMute", aliases: ["Mute"] },
      { name: "XF86AudioPlay", aliases: ["Play"] },
      { name: "XF86AudioPause", aliases: ["MediaPause"] },
      { name: "XF86AudioStop", aliases: ["Stop"] },
      { name: "XF86AudioNext", aliases: ["NextTrack"] },
      { name: "XF86AudioPrev", aliases: ["PrevTrack"] },
      { name: "XF86MonBrightnessUp", aliases: ["BrightnessUp"] },
      { name: "XF86MonBrightnessDown", aliases: ["BrightnessDown"] },
      { name: "XF86PowerOff", aliases: ["Power"] },
      { name: "XF86Sleep", aliases: ["Sleep"] },
      { name: "XF86Search", aliases: ["Search"] },
      { name: "XF86Mail", aliases: ["Mail"] },
      { name: "XF86WWW", aliases: ["Browser", "Web"] },
      { name: "XF86Calculator", aliases: ["Calc"] },
      { name: "XF86Display", aliases: ["Display"] },
      { name: "XF86Eject", aliases: ["Eject"] },
      { name: "XF86Tools", aliases: ["Tools"] },
    ],
  },
];

export function searchKeyNames(
  query: string,
): { name: string; groupLabel: string }[] {
  if (!query.trim()) return [];
  const lower = query.toLowerCase();
  const results: { name: string; groupLabel: string }[] = [];
  for (const group of KEY_GROUPS) {
    for (const key of group.keys) {
      if (
        key.name.toLowerCase().includes(lower) ||
        key.aliases?.some((a) => a.toLowerCase().includes(lower))
      ) {
        results.push({ name: key.name, groupLabel: group.label });
      }
    }
  }
  return results;
}
