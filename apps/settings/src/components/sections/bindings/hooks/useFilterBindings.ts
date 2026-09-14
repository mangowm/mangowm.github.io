import { useMemo } from "react";
import type { Keybinding } from "@/lib/keybind-types";
import { DISPATCHER_MAP } from "@/lib/dispatchers";

export function useFilterBindings(
  entries: Keybinding[],
  search: string,
  category: string,
  mode: string,
): Keybinding[] {
  return useMemo(() => {
    const q = search.toLowerCase().trim();
    return entries.filter((e) => {
      if (category !== "All") {
        const info = DISPATCHER_MAP.get(e.func);
        if ((info?.category ?? "other") !== category) return false;
      }
      // Mode filter applies to every binding type
      if (mode !== "All" && e.mode !== mode) return false;
      if (!q) return true;
      const desc = DISPATCHER_MAP.get(e.func)?.description ?? "";
      return (
        e.func.toLowerCase().includes(q) ||
        desc.toLowerCase().includes(q) ||
        e.key.toLowerCase().includes(q) ||
        e.mods.toLowerCase().includes(q) ||
        e.mode.toLowerCase().includes(q) ||
        e.args.toLowerCase().includes(q) ||
        e.type.toLowerCase().includes(q) ||
        (e.type === "gesture" && e.fingers.toLowerCase().includes(q))
      );
    });
  }, [entries, search, category, mode]);
}
