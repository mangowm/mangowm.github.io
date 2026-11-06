import { GLOBALS, type GlobalDef } from "@mangowm.github.io/schema";

export const GLOBAL_META: ReadonlyMap<string, GlobalDef> = new Map(
  GLOBALS.map((option) => [option.key, option]),
);

export function globalMeta(key: string): GlobalDef | undefined {
  return GLOBAL_META.get(key);
}

export function globalOptions(
  key: string,
): readonly { value: string; label: string }[] | undefined {
  const definition = GLOBAL_META.get(key);
  return definition?.type === "enum" ? definition.options : undefined;
}

export function globalMin(key: string): number | undefined {
  const definition = GLOBAL_META.get(key);
  return definition && "min" in definition ? definition.min : undefined;
}

export function globalMax(key: string): number | undefined {
  const definition = GLOBAL_META.get(key);
  return definition && "max" in definition ? definition.max : undefined;
}
