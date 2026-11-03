import { GLOBALS } from "@mangowm.github.io/schema";

import type { ConfigData } from "./config-types";

function toText(value: unknown): string {
  if (typeof value === "boolean") return value ? "1" : "0";
  if (Array.isArray(value)) return value.join(",");
  return String(value);
}

export const DEFAULTS: ConfigData = Object.fromEntries(
  GLOBALS.map((option) => [option.key, [toText(option.default)]]),
);
