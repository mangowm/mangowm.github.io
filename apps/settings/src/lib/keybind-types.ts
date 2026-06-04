/** `s` forces keysym matching, `l` works while locked, `r` fires on release, `p` passes through */
export interface KeybindFlags {
  symOnly: boolean;
  onLock: boolean;
  onRelease: boolean;
  pass: boolean;
}

/**
 * A keybinding parsed from the config file.
 * The value after `=` is split on commas: [mods, key, func, …args].
 */
export interface Keybinding {
  /** Stable content hash of (keyword, mode, mods, key, func, args) */
  readonly id: string;
  /** The config key, e.g. "bind", "binds", "bindlr" */
  readonly keyword: string;
  /** Nth binding with this keyword across all loaded files */
  readonly ordinal: number;

  /** Modifier string like "super+ctrl" or "none" */
  readonly mods: string;
  /** XKB key name like "Return", "Left", "a" */
  readonly key: string;
  /** Dispatch function name like "spawn", "focusdir" */
  readonly func: string;
  /** Comma-joined argument tokens after func; empty if none */
  readonly args: string;

  /** "default", "common", or a custom submap name */
  readonly mode: string;
  /** Flags parsed from the keyword suffix */
  readonly flags: KeybindFlags;
}
