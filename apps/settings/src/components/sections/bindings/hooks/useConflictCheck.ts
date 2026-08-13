import { useMemo } from "react";
import type { Keybinding } from "@/lib/keybind-types";
import { parseModifiers, serializeModifiers, bindingsConflict } from "@/lib/keybind-parse";

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
    const editing = { mode, flags: { allowConflict: editingAllowConflict } };
    return entries.filter((e) => {
      if (e.type !== "keyboard") return false;
      if (editingId && e.id === editingId) return false;
      if (normalizeMods(e.mods) !== needle || e.key !== key) return false;
      return bindingsConflict(editing, e);
    });
  }, [entries, mode, mods, key, editingId, editingAllowConflict]);
}
