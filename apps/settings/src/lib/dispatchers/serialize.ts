import type { DispatcherArg } from "./types";

export function parseArgValues(args: string, schema: DispatcherArg[]): Record<string, string> {
  const parts = args ? args.split(",") : [];
  const values: Record<string, string> = {};
  schema.forEach((arg, i) => {
    values[arg.name] = i < parts.length ? parts[i] : "";
  });
  return values;
}

export function serializeArgValues(
  values: Record<string, string>,
  schema: DispatcherArg[],
): string {
  return schema.map((arg) => values[arg.name] ?? "").join(",");
}
