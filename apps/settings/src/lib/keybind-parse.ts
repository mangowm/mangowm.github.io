import {
  bindKeyword,
  bindingKind,
  formatBinding,
  parseBinding,
  parseFlags,
  type Action,
  type BindingFlags,
  type BindingKind,
  type ParsedBinding,
} from "@mangowm.github.io/config";

import type { ConfigData, ConfigLine, SourceFile } from "./config/types";
import type { Keybinding, KeybindFlags, BindingType } from "./keybind-types";

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

const EMPTY_FLAGS: BindingFlags = {
  sym: false,
  lock: false,
  release: false,
  pass: false,
  conflict: false,
};

const KIND_BY_TYPE: Record<BindingType, BindingKind> = {
  keyboard: "key",
  mouse: "mouse",
  axis: "axis",
  switch: "switch",
  gesture: "gesture",
};

function keywordForKind(kind: BindingKind): string {
  return bindKeyword({
    kind,
    flags: EMPTY_FLAGS,
    mods: "",
    trigger: "",
    fingers: "",
    action: { dispatcher: "" },
  });
}

export const TYPE_TO_KEYWORD: Record<BindingType, string> = {
  keyboard: keywordForKind("key"),
  mouse: keywordForKind("mouse"),
  axis: keywordForKind("axis"),
  switch: keywordForKind("switch"),
  gesture: keywordForKind("gesture"),
};

export const NON_KEYBOARD_KEYS: readonly string[] = (
  ["mouse", "axis", "switch", "gesture"] as BindingKind[]
).map(keywordForKind);

/** All 32 canonical bind key variants (s→l→r→p→c flag order). */
export const ALL_BIND_VARIANTS: readonly string[] = Array.from({ length: 32 }, (_, mask) =>
  bindKeyword({
    kind: "key",
    flags: {
      sym: Boolean(mask & 1),
      lock: Boolean(mask & 2),
      release: Boolean(mask & 4),
      pass: Boolean(mask & 8),
      conflict: Boolean(mask & 16),
    },
    mods: "",
    trigger: "",
    fingers: "",
    action: { dispatcher: "" },
  }),
);

export function isBindKey(key: string): boolean {
  try {
    return bindingKind(key) === "key";
  } catch {
    return false;
  }
}

export function isMouseBindKey(key: string): boolean {
  try {
    return bindingKind(key) === "mouse";
  } catch {
    return false;
  }
}

export function isAxisBindKey(key: string): boolean {
  try {
    return bindingKind(key) === "axis";
  } catch {
    return false;
  }
}

export function isSwitchBindKey(key: string): boolean {
  try {
    return bindingKind(key) === "switch";
  } catch {
    return false;
  }
}

export function isGestureBindKey(key: string): boolean {
  try {
    return bindingKind(key) === "gesture";
  } catch {
    return false;
  }
}

export function isNonKeyboardBindKey(key: string): boolean {
  try {
    return bindingKind(key) !== "key";
  } catch {
    return false;
  }
}

export function detectBindingType(keyword: string): BindingType {
  try {
    const kind = bindingKind(keyword);
    return kind === "key" ? "keyboard" : kind;
  } catch {
    return "keyboard";
  }
}

export function parseSingleBinding(
  keyword: string,
  ordinal: number,
  value: string,
  mode = "default",
): Keybinding | null {
  let parsed: ParsedBinding;

  try {
    parsed = parseBinding(keyword, value);
  } catch {
    return null;
  }

  const type = parsed.kind === "key" ? "keyboard" : parsed.kind;
  const action = parsed.action;
  const func = "dispatcher" in action ? action.dispatcher : `$${action.variable}`;
  const args = action.args ?? "";

  return {
    id: makeBindingId(keyword, type, parsed.mods, parsed.trigger, func, args, parsed.fingers),
    keyword,
    ordinal,
    type,
    mods: parsed.kind === "switch" ? "none" : parsed.mods,
    key: parsed.trigger,
    func,
    args,
    mode,
    flags: {
      symOnly: parsed.flags.sym,
      onLock: parsed.flags.lock,
      onRelease: parsed.flags.release,
      pass: parsed.flags.pass,
      allowConflict: parsed.flags.conflict,
    },
    fingers: parsed.fingers,
  };
}

export function serializeBinding(b: Keybinding): string {
  const action: Action = b.func.startsWith("$")
    ? { variable: b.func.slice(1), ...(b.args ? { args: b.args } : {}) }
    : { dispatcher: b.func, ...(b.args ? { args: b.args } : {}) };

  return formatBinding({
    kind: KIND_BY_TYPE[b.type],
    flags: {
      sym: b.flags.symOnly,
      lock: b.flags.onLock,
      release: b.flags.onRelease,
      pass: b.flags.pass,
      conflict: b.flags.allowConflict,
    },
    mods: b.mods,
    trigger: b.key,
    fingers: b.fingers,
    action,
  });
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

/** Parse bindings from SourceFiles, tracking `key_mode` entries for mode context. */
export function parseKeybindingsFromFiles(files: SourceFile[]): Keybinding[] {
  const entries: Keybinding[] = [];
  let currentMode = "default";
  const globalIdx: Record<string, number> = {};
  for (const file of files) {
    for (const line of file.lines) {
      if (line.type !== "entry") continue;
      const { key, value } = line;
      if (key === "key_mode") {
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

/** Effective mode at the end of all loaded files (the last `key_mode` value). */
export function getActiveModeAtEnd(files: SourceFile[]): string {
  let mode = "default";
  for (const file of files) {
    for (const line of file.lines) {
      if (line.type === "entry" && line.key === "key_mode") mode = line.value;
    }
  }
  return mode;
}

/** Index of the last `key_mode <mode>` line, or -1. */
export function findLastKeyModeLine(lines: ConfigLine[], mode?: string): number {
  for (let i = lines.length - 1; i >= 0; i--) {
    const ln = lines[i];
    if (ln.type === "entry" && ln.key === "key_mode") {
      if (mode === undefined || ln.value === mode) return i;
    }
  }
  return -1;
}

/** Last line of the mode block starting at keyModeIdx. */
export function findBlockEnd(lines: ConfigLine[], keyModeIdx: number): number {
  for (let i = keyModeIdx + 1; i < lines.length; i++) {
    const ln = lines[i];
    if (ln.type === "entry" && ln.key === "key_mode") return i - 1;
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
    const firstKm = lines.findIndex((ln) => ln.type === "entry" && ln.key === "key_mode");
    if (firstKm >= 0) return { afterLineIdx: firstKm - 1 };
    return null;
  }
  const kmIdx = findLastKeyModeLine(lines, targetMode);
  if (kmIdx >= 0) return { afterLineIdx: findBlockEnd(lines, kmIdx) };
  return null;
}

/** Build a bind keyword from flags, e.g. { symOnly: true, onRelease: true } → "bindsr". */
export function bindKeyFromFlags(flags: KeybindFlags): string {
  return bindKeyword({
    kind: "key",
    flags: {
      sym: flags.symOnly,
      lock: flags.onLock,
      release: flags.onRelease,
      pass: flags.pass,
      conflict: flags.allowConflict,
    },
    mods: "",
    trigger: "",
    fingers: "",
    action: { dispatcher: "" },
  });
}

/** Parse a bind keyword into flags, e.g. "bindsr" → { symOnly: true, onRelease: true, … }. */
export function parseFlagsFromKey(key: string): KeybindFlags {
  try {
    const flags = parseFlags(key);
    return {
      symOnly: flags.sym,
      onLock: flags.lock,
      onRelease: flags.release,
      pass: flags.pass,
      allowConflict: flags.conflict,
    };
  } catch {
    return {
      symOnly: false,
      onLock: false,
      onRelease: false,
      pass: false,
      allowConflict: false,
    };
  }
}

/**
 * Mango's key-binding conflict rule (parse_config.h): two same-key bindings
 * conflict when they share a mode OR either is `common` (active in every
 * mode), unless BOTH carry the allow-conflict flag.
 */
export function bindingsConflict(
  a: { mode: string; flags: Pick<KeybindFlags, "allowConflict"> },
  b: { mode: string; flags: Pick<KeybindFlags, "allowConflict"> },
): boolean {
  const sameMode = a.mode === b.mode;
  const anyCommon = a.mode === "common" || b.mode === "common";
  const bothAllow = a.flags.allowConflict && b.flags.allowConflict;
  return (sameMode || anyCommon) && !bothAllow;
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
 * leading block (before the first `key_mode=` line), named-mode bindings go
 * into their `key_mode=` block, creating it when needed.
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
    insertEntry("key_mode", mode, {
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
