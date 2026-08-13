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
  editingAllowConflict = false,
): Keybinding[] {
  return useMemo(() => {
    if (!key.trim()) return [];
    const needle = normalizeMods(mods);
    return entries.filter((e) => {
      if (e.type !== "keyboard") return false;
      if (editingId && e.id === editingId) return false;
      if (e.mode !== mode || normalizeMods(e.mods) !== needle || e.key !== key) return false;
      // Mango suppresses the conflict only when BOTH bindings allow it.
      if (editingAllowConflict && e.flags.allowConflict) return false;
      return true;
    });
  }, [entries, mode, mods, key, editingId, editingAllowConflict]);
}
