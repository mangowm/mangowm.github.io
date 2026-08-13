import type { ConfigData, ConfigLine, SourceFile } from "./config-types";
import type { Keybinding, KeybindFlags, BindingType } from "./keybind-types";

type TokenResult = {
  mods: string;
  trigger: string;
  func: string;
  args: string;
  fingers?: string;
};

/** Stable hash of (keyword, type, mods, trigger, func, args, fingers). */
export function makeBindingId(
  keyword: string,
  type: BindingType,
  mods: string,
  trigger: string,
  func: string,
  args: string,
  fingers = "",
): string {
  let h = 5381;
  const s = `${keyword}|${type}|${mods}|${trigger}|${func}|${args}|${fingers}`;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) + h + s.charCodeAt(i);
    h = h & h;
  }
  return (h >>> 0).toString(36);
}

const BIND_KEY_RE = /^bind[slrpc]*$/;
const MOUSEBIND_KEY = "mousebind";
const AXISBIND_KEY = "axisbind";
const SWITCHBIND_KEY = "switchbind";
const GESTUREBIND_KEY = "gesturebind";

export const NON_KEYBOARD_KEYS = [
  MOUSEBIND_KEY,
  AXISBIND_KEY,
  SWITCHBIND_KEY,
  GESTUREBIND_KEY,
] as const;

/** All 32 canonical bind key variants (s→l→r→p→c flag order). */
export const ALL_BIND_VARIANTS: readonly string[] = (() => {
  const letters = ["s", "l", "r", "p", "c"] as const;
  const keys: string[] = ["bind"];
  for (let mask = 1; mask < 32; mask++) {
    let key = "bind";
    for (let i = 0; i < 5; i++) {
      if (mask & (1 << i)) key += letters[i];
    }
    keys.push(key);
  }
  return keys;
})();

export function isBindKey(key: string): boolean {
  return BIND_KEY_RE.test(key);
}

export function isMouseBindKey(key: string): boolean {
  return key === MOUSEBIND_KEY;
}

export function isAxisBindKey(key: string): boolean {
  return key === AXISBIND_KEY;
}

export function isSwitchBindKey(key: string): boolean {
  return key === SWITCHBIND_KEY;
}

export function isGestureBindKey(key: string): boolean {
  return key === GESTUREBIND_KEY;
}

export function isNonKeyboardBindKey(key: string): boolean {
  return (NON_KEYBOARD_KEYS as readonly string[]).includes(key);
}

const KEYWORD_TO_TYPE: Record<string, BindingType> = {
  mousebind: "mouse",
  axisbind: "axis",
  switchbind: "switch",
  gesturebind: "gesture",
};

export function detectBindingType(keyword: string): BindingType {
  return KEYWORD_TO_TYPE[keyword] ?? "keyboard";
}

export const TYPE_TO_KEYWORD: Record<BindingType, string> = {
  keyboard: "bind",
  mouse: "mousebind",
  axis: "axisbind",
  switch: "switchbind",
  gesture: "gesturebind",
};

/**
 * Tokenise a comma-separated binding value.
 * Structure varies by type:
 *   keyboard/mouse/axis: mods, trigger, func, args…
 *   switch:              trigger (no mods), func, args…
 *   gesture:             mods, motion, fingers, func, args…
 */
function tokenizeBinding(keyword: string, value: string): TokenResult | null {
  const parts = value.split(",");
  const type = detectBindingType(keyword);

  switch (type) {
    case "switch": {
      if (parts.length < 2) return null;
      return { mods: "none", trigger: parts[0], func: parts[1], args: parts.slice(2).join(",") };
    }
    case "gesture": {
      if (parts.length < 4) return null;
      return {
        mods: parts[0],
        trigger: parts[1],
        func: parts[3],
        args: parts.slice(4).join(","),
        fingers: parts[2],
      };
    }
    default: {
      if (parts.length < 3) return null;
      return { mods: parts[0], trigger: parts[1], func: parts[2], args: parts.slice(3).join(",") };
    }
  }
}

export function parseSingleBinding(
  keyword: string,
  ordinal: number,
  value: string,
  mode = "default",
): Keybinding | null {
  const tokens = tokenizeBinding(keyword, value);
  if (!tokens) return null;

  const type = detectBindingType(keyword);
  const isKbd = type === "keyboard";

  return {
    id: makeBindingId(
      keyword,
      type,
      tokens.mods,
      tokens.trigger,
      tokens.func,
      tokens.args,
      tokens.fingers ?? "",
    ),
    keyword,
    ordinal,
    type,
    mods: tokens.mods,
    key: tokens.trigger,
    func: tokens.func,
    args: tokens.args,
    mode,
    flags: isKbd
      ? parseFlagsFromKey(keyword)
      : { symOnly: false, onLock: false, onRelease: false, pass: false, allowConflict: false },
    fingers: tokens.fingers ?? "",
  };
}

export function serializeBinding(b: Keybinding): string {
  const parts: string[] = [];

  if (b.type === "switch") {
    parts.push(b.key, b.func);
  } else if (b.type === "gesture") {
    parts.push(b.mods, b.key, b.fingers || "3", b.func);
  } else {
    parts.push(b.mods, b.key, b.func);
  }

  if (b.args) parts.push(b.args);
  return parts.join(",");
}

/** Parse bindings from a flat ConfigData map (mode-less, for search engine). */
export function parseKeybindings(data: ConfigData): Keybinding[] {
  const entries: Keybinding[] = [];
  const keys = Object.keys(data)
    .filter((k) => isBindKey(k) || isNonKeyboardBindKey(k))
    .sort();
  for (const key of keys) {
    const values = data[key];
    for (let i = 0; i < values.length; i++) {
      const entry = parseSingleBinding(key, i, values[i]);
      if (entry) entries.push(entry);
    }
  }
  return entries;
}

/** Parse bindings from SourceFiles, tracking `keymode` entries for mode context. */
export function parseKeybindingsFromFiles(files: SourceFile[]): Keybinding[] {
  const entries: Keybinding[] = [];
  let currentMode = "default";
  const globalIdx: Record<string, number> = {};
  for (const file of files) {
    for (const line of file.lines) {
      if (line.type !== "entry") continue;
      const { key, value } = line;
      if (key === "keymode") {
        currentMode = value;
        continue;
      }
      if (!isBindKey(key) && !isNonKeyboardBindKey(key)) continue;
      const ordinal = globalIdx[key] ?? 0;
      const entry = parseSingleBinding(key, ordinal, value, currentMode);
      if (entry) entries.push(entry);
      globalIdx[key] = ordinal + 1;
    }
  }
  return entries;
}

/** Effective mode at the end of all loaded files (the last `keymode` value). */
export function getActiveModeAtEnd(files: SourceFile[]): string {
  let mode = "default";
  for (const file of files) {
    for (const line of file.lines) {
      if (line.type === "entry" && line.key === "keymode") mode = line.value;
    }
  }
  return mode;
}

/** Index of the last `keymode <mode>` line, or -1. */
export function findLastKeymodeLine(lines: ConfigLine[], mode?: string): number {
  for (let i = lines.length - 1; i >= 0; i--) {
    const ln = lines[i];
    if (ln.type === "entry" && ln.key === "keymode") {
      if (mode === undefined || ln.value === mode) return i;
    }
  }
  return -1;
}

/** Last line of the mode block starting at keymodeIdx. */
export function findBlockEnd(lines: ConfigLine[], keymodeIdx: number): number {
  for (let i = keymodeIdx + 1; i < lines.length; i++) {
    const ln = lines[i];
    if (ln.type === "entry" && ln.key === "keymode") return i - 1;
  }
  return lines.length - 1;
}

/**
 * Find where to insert a binding in `targetMode`.
 * Returns null when the caller should append or create the block.
 */
export function findInsertPosition(
  lines: ConfigLine[],
  targetMode: string,
): { afterLineIdx: number } | null {
  if (targetMode === "default") {
    const firstKm = lines.findIndex((ln) => ln.type === "entry" && ln.key === "keymode");
    if (firstKm >= 0) return { afterLineIdx: firstKm - 1 };
    return null;
  }
  const kmIdx = findLastKeymodeLine(lines, targetMode);
  if (kmIdx >= 0) return { afterLineIdx: findBlockEnd(lines, kmIdx) };
  return null;
}

/** Build a bind keyword from flags, e.g. { symOnly: true, onRelease: true } → "bindsr". */
export function bindKeyFromFlags(flags: KeybindFlags): string {
  let key = "bind";
  if (flags.symOnly) key += "s";
  if (flags.onLock) key += "l";
  if (flags.onRelease) key += "r";
  if (flags.pass) key += "p";
  if (flags.allowConflict) key += "c";
  return key;
}

/** Parse a bind keyword into flags, e.g. "bindsr" → { symOnly: true, onRelease: true, … }. */
export function parseFlagsFromKey(key: string): KeybindFlags {
  const suffix = key.startsWith("bind") ? key.slice(4) : "";
  return {
    symOnly: suffix.includes("s"),
    onLock: suffix.includes("l"),
    onRelease: suffix.includes("r"),
    pass: suffix.includes("p"),
    allowConflict: suffix.includes("c"),
  };
}

/** Canonical modifier order used for serialization and display. */
export const MODIFIER_ORDER = ["super", "ctrl", "alt", "shift", "hyper"] as const;

/** Split "super+ctrl" into ["super", "ctrl"]. Empty/none → []. */
export function parseModifiers(modStr: string): string[] {
  if (!modStr || modStr.toLowerCase() === "none") return [];
  return modStr
    .split("+")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

/** Find the first file containing an entry matching the given key. */
function findFileForConfigKey(files: SourceFile[], key: string): number {
  const isBind = isBindKey(key);
  for (let i = 0; i < files.length; i++) {
    for (const line of files[i].lines) {
      if (line.type === "entry" && (isBind ? isBindKey(line.key) : line.key === key)) {
        return i;
      }
    }
  }
  return 0;
}

/**
 * Insert a binding respecting its mode: default-mode bindings go into the
 * leading block (before the first `keymode=` line), named-mode bindings go
 * into their `keymode=` block, creating it when needed.
 */
export function insertModeAwareBinding(
  files: SourceFile[],
  insertEntry: (
    key: string,
    value: string,
    options: { fileIdx: number; afterLineIdx: number },
  ) => void,
  key: string,
  value: string,
  mode: string,
  knownFileIdx?: number,
): void {
  const targetFileIdx = knownFileIdx ?? findFileForConfigKey(files, key);
  const file = files[targetFileIdx];
  if (!file) return;

  const pos = findInsertPosition(file.lines, mode);

  if (pos) {
    insertEntry(key, value, { fileIdx: targetFileIdx, ...pos });
  } else if (mode !== "default") {
    insertEntry("keymode", mode, {
      fileIdx: targetFileIdx,
      afterLineIdx: file.lines.length - 1,
    });
    insertEntry(key, value, {
      fileIdx: targetFileIdx,
      afterLineIdx: file.lines.length,
    });
  } else {
    insertEntry(key, value, {
      fileIdx: targetFileIdx,
      afterLineIdx: file.lines.length - 1,
    });
  }
}

/** Join ["super", "ctrl"] into "super+ctrl" in canonical order. Empty → "none". */
export function serializeModifiers(mods: string[]): string {
  if (mods.length === 0) return "none";
  const ordered = [...mods].sort(
    (a, b) => MODIFIER_ORDER.indexOf(a as any) - MODIFIER_ORDER.indexOf(b as any),
  );
  return ordered.join("+");
}

const RAW_CODE_RE = /^code:(\d+)$/;

/** Check whether a string is a raw numeric code like "code:133" (keys, buttons, etc.). */
export function isRawCode(code: string): boolean {
  return RAW_CODE_RE.test(code);
}

/** Extract the numeric value from "code:133". Returns null if not a raw code. */
export function parseRawCode(code: string): number | null {
  const m = code.match(RAW_CODE_RE);
  return m ? parseInt(m[1], 10) : null;
}
