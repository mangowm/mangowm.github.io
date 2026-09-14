import type { DispatcherArg } from "./types";
import {
  DIRECTION_OPTS,
  CIRCLE_DIR_OPTS,
  LAYOUT_NAMES,
  MOUSE_ACTION_OPTS,
  TAG_COUNT_MAX,
} from "./types";

function isValidTagNumber(value: string): boolean {
  if (!/^\d+$/.test(value)) return false;
  const n = Number(value);
  return n >= 1 && n <= TAG_COUNT_MAX;
}

export function validateArgValue(value: string, arg: DispatcherArg): string | null {
  if (arg.required && !value) return `${arg.label} is required`;
  if (!value) return null;

  switch (arg.type) {
    case "none":
    case "string":
    case "command":
    case "monitor":
      break;

    case "direction":
      if (!DIRECTION_OPTS.includes(value as any)) return "Must be left, right, up, or down";
      break;
    case "circle-dir":
      if (!CIRCLE_DIR_OPTS.includes(value as any)) return "Must be next or prev";
      break;
    case "int":
      if (!/^-?\d+$/.test(value)) return "Must be an integer";
      break;
    case "uint":
      if (!/^\d+$/.test(value)) return "Must be a positive integer";
      break;
    case "float":
      if (isNaN(Number(value))) return "Must be a number";
      break;
    case "tag":
      if (!isValidTagNumber(value)) return `Must be a tag number 1–${TAG_COUNT_MAX}`;
      break;
    case "tag-mask": {
      if (value === "-1" || value === "0") break;
      if (!/^\d+(\|\d+)*$/.test(value)) return "Use numbers separated by |, e.g. 1|3|5";
      const nums = value.split("|");
      if (nums.some((n) => !isValidTagNumber(n))) return `Each tag must be 1–${TAG_COUNT_MAX}`;
      break;
    }
    case "bool-flag":
      if (value !== "0" && value !== "1") return "Must be 0 or 1";
      break;
    case "mouse-action":
      if (!MOUSE_ACTION_OPTS.includes(value as any)) return "Must be curmove or curresize";
      break;
    case "layout":
      if (!LAYOUT_NAMES.includes(value as any)) return `Must be one of: ${LAYOUT_NAMES.join(", ")}`;
      break;
    default:
      arg.type satisfies never;
  }
  return null;
}

export function validateAllArgs(
  values: Record<string, string>,
  schema: DispatcherArg[],
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const arg of schema) {
    const error = validateArgValue(values[arg.name] ?? "", arg);
    if (error) errors[arg.name] = error;
  }
  return errors;
}
