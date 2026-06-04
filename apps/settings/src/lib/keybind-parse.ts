import type { ConfigData, ConfigLine, SourceFile } from "./config-types";
import type { Keybinding, KeybindFlags } from "./keybind-types";

/** Deterministic hash of (keyword, mode, mods, key, func, args). Same inputs → same id. */
export function makeKeybindingId(
  keyword: string,
  mode: string,
  mods: string,
  key: string,
  func: string,
  args: string,
): string {
  let h = 5381;
  const s = `${keyword}|${mode}|${mods}|${key}|${func}|${args}`;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) + h + s.charCodeAt(i);
    h = h & h;
  }
  return (h >>> 0).toString(36);
}

const BIND_KEY_RE = /^bind[slrp]*$/;

export function isBindKey(key: string): boolean {
  return BIND_KEY_RE.test(key);
}

function tokenizeBinding(value: string): {
  mods: string;
  key: string;
  func: string;
  args: string;
} | null {
  const parts = value.split(",");
  if (parts.length < 3) return null;
  return {
    mods: parts[0],
    key: parts[1],
    func: parts[2],
    args: parts.slice(3).join(","),
  };
}

export function parseSingleBinding(
  keyword: string,
  ordinal: number,
  value: string,
  mode = "default",
): Keybinding | null {
  const tokens = tokenizeBinding(value);
  if (!tokens) return null;
  return {
    id: makeKeybindingId(keyword, mode, tokens.mods, tokens.key, tokens.func, tokens.args),
    keyword,
    ordinal,
    mods: tokens.mods,
    key: tokens.key,
    func: tokens.func,
    args: tokens.args,
    mode,
    flags: parseFlagsFromKey(keyword),
  };
}

export function serializeBinding(b: Keybinding): string {
  const parts = [b.mods, b.key, b.func];
  if (b.args) parts.push(b.args);
  return parts.join(",");
}

/** Parse bindings from a flat ConfigData map (mode-less, for search engine). */
export function parseKeybindings(data: ConfigData): Keybinding[] {
  const entries: Keybinding[] = [];
  const keys = Object.keys(data).filter(isBindKey).sort();
  for (const key of keys) {
    const values = data[key];
    for (let i = 0; i < values.length; i++) {
      const entry = parseSingleBinding(key, i, values[i]);
      if (entry) entries.push(entry);
    }
  }
  return entries;
}

/** Parse bindings from SourceFiles, tracking keymode= lines for mode context. */
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
      if (!isBindKey(key)) continue;
      const ordinal = globalIdx[key] ?? 0;
      const entry = parseSingleBinding(key, ordinal, value, currentMode);
      if (entry) entries.push(entry);
      globalIdx[key] = ordinal + 1;
    }
  }
  return entries;
}

/** Effective mode at the end of all loaded files (the last keymode= value). */
export function getActiveModeAtEnd(files: SourceFile[]): string {
  let mode = "default";
  for (const file of files) {
    for (const line of file.lines) {
      if (line.type === "entry" && line.key === "keymode") mode = line.value;
    }
  }
  return mode;
}

/** Index of the last `keymode=<mode>` line, or -1. */
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

/** Find the first file containing an entry matching the given key.
 *  For bind keys (bind, binds, bindlr, etc.), matches any bind variant.
 *  For other keys, uses exact match. */
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
 * Insert a keybinding entry respecting mode blocks.
 * Handles bind-key pattern matching for file discovery.
 * When `knownFileIdx` is provided, uses that file directly.
 *
 * This is a utility that composes the store's generic `insertEntry`.
 * It lives here to keep the store configuration-agnostic.
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
    // No existing block for this mode — create it at the end of the file.
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

const RAW_KEYCODE_RE = /^code:(\d+)$/;

/** Check whether a key string is a raw keycode like "code:133". */
export function isRawKeycode(key: string): boolean {
  return RAW_KEYCODE_RE.test(key);
}

/** Extract the numeric keycode from "code:133". Returns null if not a raw keycode. */
export function parseRawKeycode(key: string): number | null {
  const m = key.match(RAW_KEYCODE_RE);
  return m ? parseInt(m[1], 10) : null;
}
