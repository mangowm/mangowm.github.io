import { create } from "zustand";
import { parseConfig, serializeConfig } from "./config-parse";
import { readConfigFile, writeConfigFile, reloadMango } from "./config-file";
import type { ConfigData, ParsedConfig, MangoConfigKey } from "./config-types";

interface ConfigStore {
  data: ConfigData;
  lines: ParsedConfig["lines"];
  loading: boolean;
  applying: boolean;
  dirty: boolean;
  error: string | null;

  load: () => Promise<void>;

  addEntry: (key: MangoConfigKey, value: string) => void;
  updateEntry: (key: MangoConfigKey, index: number, value: string) => void;
  removeEntry: (key: MangoConfigKey, index: number) => void;

  apply: () => Promise<void>;
}

export const useConfigStore = create<ConfigStore>((set, get) => ({
  data: {},
  lines: [],
  loading: false,
  applying: false,
  dirty: false,
  error: null,

  load: async () => {
    set({ loading: true, error: null });
    try {
      const text = await readConfigFile();
      if (text === null) {
        set({ data: {}, lines: [], loading: false, dirty: false });
        return;
      }
      const parsed = parseConfig(text);
      set({
        data: parsed.data,
        lines: parsed.lines,
        loading: false,
        dirty: false,
      });
    } catch (e: any) {
      set({ error: e.message || String(e), loading: false });
    }
  },

  addEntry: (key, value) =>
    set((state) => {
      const current = state.data[key] || [];
      return {
        data: { ...state.data, [key]: [...current, value] },
        dirty: true,
      };
    }),

  updateEntry: (key, index, value) =>
    set((state) => {
      const current = state.data[key] || [];
      if (index < 0 || index >= current.length) return state;

      const next = [...current];
      next[index] = value;
      return {
        data: { ...state.data, [key]: next },
        dirty: true,
      };
    }),

  removeEntry: (key, index) =>
    set((state) => {
      const current = state.data[key] || [];
      if (index < 0 || index >= current.length) return state;

      return {
        data: { ...state.data, [key]: current.filter((_, i) => i !== index) },
        dirty: true,
      };
    }),

  apply: async () => {
    set({ applying: true, error: null });
    try {
      const { data, lines } = get();
      const text = serializeConfig({ data, lines });

      await writeConfigFile(text);
      await reloadMango();

      set({ applying: false, dirty: false });
    } catch (e: any) {
      set({ error: e.message || String(e), applying: false });
    }
  },
}));
