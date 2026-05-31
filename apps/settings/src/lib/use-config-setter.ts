import { useCallback } from "react";
import { useConfigStore } from "@/lib/config-store";
import type { MangoConfigKey } from "@/lib/config-types";

export function useConfigSetter() {
  const { data, addEntry, updateEntry } = useConfigStore();
  return useCallback(
    (key: string, value: string) => {
      const k = key as MangoConfigKey;
      if (data[k]?.[0] !== undefined) {
        updateEntry(k, 0, value);
      } else {
        addEntry(k, value);
      }
    },
    [data, addEntry, updateEntry],
  );
}
