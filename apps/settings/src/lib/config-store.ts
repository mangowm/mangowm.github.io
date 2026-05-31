import { create } from "zustand";
import { temporal } from "zundo";
import {
  readAllConfigFiles,
  writeAllConfigFiles,
  reloadMango,
} from "./config-file";
import type {
  ConfigData,
  SourceFile,
  MangoConfigKey,
} from "./config-types";

/** Merge the data from all SourceFiles into a single ConfigData. */
function mergeFileData(files: SourceFile[]): ConfigData {
  const merged: ConfigData = {};
  for (const file of files) {
    for (const [key, values] of Object.entries(file.data)) {
      if (!merged[key]) {
        merged[key] = [];
      }
      merged[key].push(...values);
    }
  }
  return merged;
}

/** Find the index of the first SourceFile that owns the given key. */
function findFileForKey(files: SourceFile[], key: string): number {
  for (let i = 0; i < files.length; i++) {
    if (key in files[i].data) return i;
  }
  return 0; // fallback to main file
}

interface ConfigStore {
  /** Merged data from all files – used by the UI panels. */
  data: ConfigData;
  /** All config files with their own data & lines. */
  files: SourceFile[];

  loading: boolean;
  applying: boolean;
  dirty: boolean;
  error: string | null;

  load: () => Promise<void>;

  addEntry: (key: MangoConfigKey, value: string) => void;
  updateEntry: (key: MangoConfigKey, index: number, value: string) => void;
  removeEntry: (key: MangoConfigKey, index: number) => void;
  bulkUpdateEntries: (entries: Array<{ key: MangoConfigKey; value: string }>) => void;

  apply: () => Promise<void>;
}

export const useConfigStore = create<ConfigStore>()(
  temporal(
    (set, get) => ({
      data: {},
      files: [],
      loading: false,
      applying: false,
      dirty: false,
      error: null,

      load: async () => {
        set({ loading: true, error: null });
        try {
          const files = await readAllConfigFiles();
          if (files.length === 0) {
            set({ data: {}, files: [], loading: false, dirty: false });
            return;
          }

          const data = mergeFileData(files);

          set({
            data,
            files,
            loading: false,
            dirty: false,
          });
          useConfigStore.temporal.getState().clear();
        } catch (e: any) {
          set({ error: e.message || String(e), loading: false });
        }
      },

      addEntry: (key, value) =>
        set((state) => {
          const files = state.files.map((f) => ({ ...f, data: { ...f.data } }));
          // New entries go to the main file (index 0)
          const main = files[0];
          const current = main.data[key] || [];
          main.data = { ...main.data, [key]: [...current, value] };

          const data = mergeFileData(files);
          return { data, files, dirty: true };
        }),

      updateEntry: (key, index, value) =>
        set((state) => {
          const fileIdx = findFileForKey(state.files, key);
          const files = state.files.map((f) => ({ ...f, data: { ...f.data } }));
          const file = files[fileIdx];
          const current = file.data[key] || [];
          if (index < 0 || index >= current.length) return state;
          const next = [...current];
          next[index] = value;
          file.data = { ...file.data, [key]: next };

          const data = mergeFileData(files);
          return { data, files, dirty: true };
        }),

      removeEntry: (key, index) =>
        set((state) => {
          const fileIdx = findFileForKey(state.files, key);
          const files = state.files.map((f) => ({ ...f, data: { ...f.data } }));
          const file = files[fileIdx];
          const current = file.data[key] || [];
          if (index < 0 || index >= current.length) return state;
          const next = current.filter((_, i) => i !== index);
          if (next.length === 0) {
            const { [key]: _, ...rest } = file.data;
            file.data = rest;
          } else {
            file.data = { ...file.data, [key]: next };
          }

          const data = mergeFileData(files);
          return { data, files, dirty: true };
        }),

      bulkUpdateEntries: (entries) =>
        set((state) => {
          const files = state.files.map((f) => ({ ...f, data: { ...f.data } }));

          for (const { key, value } of entries) {
            const fileIdx = findFileForKey(files, key);
            const file = files[fileIdx];
            const current = file.data[key] || [];
            const next = [...current];
            next[0] = value;
            file.data = { ...file.data, [key]: next };
          }

          const data = mergeFileData(files);
          return { data, files, dirty: true };
        }),

      apply: async () => {
        set({ applying: true, error: null });
        try {
          const { files } = get();

          // Write each file back using its own data & lines template
          await writeAllConfigFiles(files);
          await reloadMango();

          useConfigStore.temporal.getState().clear();
          set({ applying: false, dirty: false });
        } catch (e: any) {
          set({ error: e.message || String(e), applying: false });
        }
      },
    }),
    {
      partialize: (state) => ({
        data: state.data,
        files: state.files,
        dirty: state.dirty,
      }),
      limit: 50,
      equality: (a, b) =>
        a.dirty === b.dirty &&
        JSON.stringify(a.data) === JSON.stringify(b.data) &&
        JSON.stringify(a.files) === JSON.stringify(b.files),
    },
  ),
);
