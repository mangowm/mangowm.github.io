import {
  BINDING_FLAG_LETTERS,
  BINDING_FLAGS,
  BINDING_KEYWORDS,
  type BindingKind,
} from "./schema/data";

import { formatAction, parseAction } from "./dispatch";
import type { Action } from "./types";
import { ValueError } from "./value";

export type { BindingKind };

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

const BIND_FLAG_LETTERS = BINDING_FLAGS.map((flag) => BINDING_FLAG_LETTERS[flag]).join("");
const KEY_BIND = new RegExp(`^bind[${BIND_FLAG_LETTERS}]*$`);

const FLAG_BY_SUFFIX = Object.fromEntries(
  BINDING_FLAGS.map((flag) => [BINDING_FLAG_LETTERS[flag], flag]),
) as Record<string, keyof BindingFlags>;

const LETTER_BY_FLAG = BINDING_FLAGS.map((flag) => [flag, BINDING_FLAG_LETTERS[flag]] as const);

/** The `s`/`l`/`r`/`p`/`c` suffix for a set of flags. */
export function flagLetters(flags: BindingFlags): string {
  return LETTER_BY_FLAG.filter(([flag]) => flags[flag])
    .map(([, letter]) => letter)
    .join("");
}

/** The binding family for a config keyword. */
export function bindingKind(keyword: string): BindingKind {
  if (KEY_BIND.test(keyword)) return "key";

  for (const [kind, name] of Object.entries(BINDING_KEYWORDS) as [BindingKind, string][]) {
    if (name === keyword) return kind;
  }

  throw new ValueError(`unknown binding keyword "${keyword}"`);
}

/** Read the `s`/`l`/`r`/`p`/`c` flags from a `bind` keyword. */
export function parseFlags(keyword: string): BindingFlags {
  const flags = Object.fromEntries(
    BINDING_FLAGS.map((flag) => [flag, false]),
  ) as unknown as BindingFlags;

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

/** The canonical trigger key: modifiers, key, and gesture finger count joined by `+`. */
export function bindingTrigger(binding: ParsedBinding): string {
  if (binding.kind === "switch") return binding.trigger;

  const head = binding.mods ? `${binding.mods}+` : "";
  if (binding.kind === "gesture") {
    return `${head}${binding.trigger}+${binding.fingers}`;
  }
  return `${head}${binding.trigger}`;
}

/** Split a canonical trigger back into modifiers, key, and finger count. */
export function splitTrigger(
  kind: BindingKind,
  trigger: string,
): { mods: string; key: string; fingers: string } {
  if (kind === "switch") return { mods: "", key: trigger, fingers: "" };

  const parts = trigger.split("+");

  if (kind === "gesture") {
    const fingers = parts.pop() ?? "";
    const motion = parts.pop() ?? "";
    return { mods: parts.join("+"), key: motion, fingers };
  }

  const key = parts.pop() ?? "";
  return { mods: parts.join("+"), key, fingers: "" };
}

/** The config keyword for a parsed binding, including key flags. */
export function bindKeyword(binding: ParsedBinding): string {
  if (binding.kind !== "key") return BINDING_KEYWORDS[binding.kind];

  const letters = BINDING_FLAGS.filter((flag) => binding.flags[flag])
    .map((flag) => BINDING_FLAG_LETTERS[flag])
    .join("");
  return `bind${letters}`;
}

/** Format a parsed binding back to the value after `=`. */
export function formatBinding(binding: ParsedBinding): string {
  const action = formatAction(binding.action);

  if (binding.kind === "switch") return `${binding.trigger},${action}`;

  const mods = binding.mods || "NONE";
  if (binding.kind === "gesture") {
    return `${mods},${binding.trigger},${binding.fingers},${action}`;
  }
  return `${mods},${binding.trigger},${action}`;
}
