import type { ArgType, DispatcherArg } from "./types";

export function oneArg(
  type: ArgType,
  label: string,
  description: string,
  extra?: Partial<DispatcherArg>,
): DispatcherArg[] {
  return [{ name: type, type, label, description, ...extra }];
}

export function namedArg(
  name: string,
  type: ArgType,
  label: string,
  description: string,
  extra?: Partial<DispatcherArg>,
): DispatcherArg[] {
  return [{ name, type, label, description, ...extra }];
}
