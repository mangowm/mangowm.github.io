import { useMemo } from "react";
import type { Keybinding } from "@/lib/keybind-types";
import { parseModifiers, serializeModifiers } from "@/lib/keybind-parse";

function normalizeMods(m: string): string {
  return serializeModifiers(parseModifiers(m));
}

export function useConflictCheck(
  entries: Keybinding[],
  mode: string,
  mods: string,
  key: string,
  editingId?: string | null,
): Keybinding[] {
  return useMemo(() => {
    if (!key.trim()) return [];
    const needle = normalizeMods(mods);
    return entries.filter((e) => {
      if (e.type !== "keyboard") return false;
      if (editingId && e.id === editingId) return false;
      return e.mode === mode && normalizeMods(e.mods) === needle && e.key === key;
    });
  }, [entries, mode, mods, key, editingId]);
}
