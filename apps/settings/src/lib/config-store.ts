import { create } from "zustand";
import { parseConfig, serializeConfig } from "./config-parse";
import { readConfigFile, writeConfigFile, reloadMango } from "./config-file";
import type { MangoConfig, ParsedConfig } from "./config-types";

interface ConfigStore {
  typed: MangoConfig;
  lines: ParsedConfig["lines"];
  raw: ParsedConfig["raw"];
  loading: boolean;
  applying: boolean;
  error: string | null;

  load: () => Promise<void>;
  addExecOnce: (cmd: string) => void;
  removeExecOnce: (i: number) => void;
  updateExecOnce: (i: number, cmd: string) => void;
  apply: () => Promise<void>;
}

const defaultTyped: MangoConfig = { exec_once: [] };

export const useConfigStore = create<ConfigStore>((set, get) => ({
  typed: { ...defaultTyped },
  lines: [],
  raw: {},
  loading: false,
  applying: false,
  error: null,

  load: async () => {
    set({ loading: true, error: null });
    try {
      const text = await readConfigFile();
      if (text === null) {
        set({ typed: { ...defaultTyped }, lines: [], raw: {}, loading: false });
        return;
      }
      const parsed = parseConfig(text);
      set({ typed: parsed.typed, lines: parsed.lines, raw: parsed.raw, loading: false });
    } catch (e) {
      set({ error: String(e), loading: false });
    }
  },

  addExecOnce: (cmd) =>
    set((s) => ({ typed: { ...s.typed, exec_once: [...s.typed.exec_once, cmd] } })),

  removeExecOnce: (i) =>
    set((s) => ({
      typed: { ...s.typed, exec_once: s.typed.exec_once.filter((_, j) => j !== i) },
    })),

  updateExecOnce: (i, cmd) =>
    set((s) => {
      if (i >= s.typed.exec_once.length) return s;
      const next = [...s.typed.exec_once];
      next[i] = cmd;
      return { typed: { ...s.typed, exec_once: next } };
    }),

  apply: async () => {
    set({ applying: true, error: null });
    try {
      const { typed, raw, lines } = get();
      const text = serializeConfig({ typed, raw, lines });
      await writeConfigFile(text);
      await reloadMango();
      set({ applying: false });
    } catch (e) {
      set({ error: String(e), applying: false });
    }
  },
}));
