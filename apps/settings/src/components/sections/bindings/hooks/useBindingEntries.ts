import { useMemo } from "react";
import { parseKeybindingsFromFiles } from "@/lib/keybind-parse";
import type { SourceFile } from "@/lib/config-types";
import type { Keybinding } from "@/lib/keybind-types";

export function useBindingEntries(files: SourceFile[]): Keybinding[] {
  return useMemo(() => parseKeybindingsFromFiles(files), [files]);
}
