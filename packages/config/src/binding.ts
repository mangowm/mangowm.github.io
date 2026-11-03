import { formatAction, parseAction } from "./dispatch";
import type { Action } from "./types";
import { ValueError } from "./value";

/** The five binding families, matching the config keywords. */
export type BindingKind = "key" | "mouse" | "axis" | "gesture" | "switch";

/** `bind` flags, in canonical nesting order. */
export interface BindingFlags {
  sym: boolean;
  lock: boolean;
  release: boolean;
  pass: boolean;
  conflict: boolean;
}

/** A binding parsed from one config line. */
export interface ParsedBinding {
  kind: BindingKind;
  flags: BindingFlags;
  mods: string;
  trigger: string;
  fingers: string;
  action: Action;
}

const KEY_BIND = /^bind[slrpc]*$/;

const FLAG_BY_SUFFIX: Record<string, keyof BindingFlags> = {
  s: "sym",
  l: "lock",
  r: "release",
  p: "pass",
  c: "conflict",
};

const KEYWORD_BY_KIND: Record<BindingKind, string> = {
  key: "bind",
  mouse: "mousebind",
  axis: "axisbind",
  gesture: "gesturebind",
  switch: "switchbind",
};

/** The binding family for a config keyword. */
export function bindingKind(keyword: string): BindingKind {
  if (KEY_BIND.test(keyword)) return "key";

  for (const [kind, name] of Object.entries(KEYWORD_BY_KIND)) {
    if (name === keyword) return kind as BindingKind;
  }

  throw new ValueError(`unknown binding keyword "${keyword}"`);
}

/** Read the `s`/`l`/`r`/`p`/`c` flags from a `bind` keyword. */
export function parseFlags(keyword: string): BindingFlags {
  const flags: BindingFlags = {
    sym: false,
    lock: false,
    release: false,
    pass: false,
    conflict: false,
  };

  if (!KEY_BIND.test(keyword)) return flags;

  for (const char of keyword.slice(4)) {
    const flag = FLAG_BY_SUFFIX[char];
    if (!flag) throw new ValueError(`unknown bind flag "${char}"`);
    flags[flag] = true;
  }

  return flags;
}

/** Parse one binding line. */
export function parseBinding(keyword: string, value: string): ParsedBinding {
  const kind = bindingKind(keyword);
  const flags = parseFlags(keyword);
  const fields = value.split(",").map((field) => field.trim());

  if (kind === "switch") {
    const [trigger, ...rest] = fields;
    if (!trigger || rest.length === 0) {
      throw new ValueError(`expected state,action in "${value}"`);
    }
    return { kind, flags, mods: "", trigger, fingers: "", action: parseAction(rest.join(",")) };
  }

  if (kind === "gesture") {
    const [mods, motion, fingers, ...rest] = fields;
    if (!mods || !motion || !fingers || rest.length === 0) {
      throw new ValueError(`expected mods,motion,fingers,action in "${value}"`);
    }
    return {
      kind,
      flags,
      mods,
      trigger: motion,
      fingers,
      action: parseAction(rest.join(",")),
    };
  }

  const [mods, trigger, ...rest] = fields;
  if (mods === undefined || !trigger || rest.length === 0) {
    throw new ValueError(`expected mods,key,action in "${value}"`);
  }

  return { kind, flags, mods, trigger, fingers: "", action: parseAction(rest.join(",")) };
}

/** The config keyword for a parsed binding, including key flags. */
export function bindKeyword(binding: ParsedBinding): string {
  if (binding.kind !== "key") return KEYWORD_BY_KIND[binding.kind];

  const flags = binding.flags;
  return `bind${flags.sym ? "s" : ""}${flags.lock ? "l" : ""}${flags.release ? "r" : ""}${
    flags.pass ? "p" : ""
  }${flags.conflict ? "c" : ""}`;
}

/** Format a parsed binding back to the value after `=`. */
export function formatBinding(binding: ParsedBinding): string {
  const action = formatAction(binding.action);

  if (binding.kind === "switch") return `${binding.trigger},${action}`;
  if (binding.kind === "gesture") {
    return `${binding.mods},${binding.trigger},${binding.fingers},${action}`;
  }
  return `${binding.mods},${binding.trigger},${action}`;
}
