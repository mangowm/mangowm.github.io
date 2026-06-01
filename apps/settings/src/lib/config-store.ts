import { create } from "zustand";
import { temporal } from "zundo";
import { readAllConfigFiles, writeAllConfigFiles, reloadMango } from "./config-file";
import type { ConfigData, SourceFile } from "./config-types";

// `data` is the merged view across all files (UI reads this).
// `files` is the authoritative source (written to disk).
// Mutations always go into `files`; `data` is re-derived.

function mergeFileData(files: SourceFile[]): ConfigData {
  const merged: ConfigData = {};
  for (const file of files) {
    for (const [key, values] of Object.entries(file.data)) {
      if (!merged[key]) merged[key] = [];
      merged[key].push(...values);
    }
  }
  return merged;
}

function fileIndexForKey(files: SourceFile[], key: string): number {
  const idx = files.findIndex((f) => key in f.data);
  return idx === -1 ? 0 : idx;
}

function resolveGlobalIndex(
  files: SourceFile[],
  key: string,
  globalIndex: number,
): { fileIdx: number; localIdx: number } | null {
  let seen = 0;
  for (let i = 0; i < files.length; i++) {
    const current = files[i].data[key];
    if (current) {
      if (seen + current.length > globalIndex) {
        return { fileIdx: i, localIdx: globalIndex - seen };
      }
      seen += current.length;
    }
  }
  return null;
}

function patchFile(
  files: SourceFile[],
  fileIdx: number,
  patchData: (prev: ConfigData) => ConfigData,
): SourceFile[] {
  return files.map((f, i) => (i === fileIdx ? { ...f, data: patchData(f.data) } : f));
}

function syncDerivedState() {
  const { files } = useConfigStore.getState();
  const { pastStates } = useConfigStore.temporal.getState();
  useConfigStore.setState({
    data: mergeFileData(files),
    dirty: pastStates.length > 0,
  });
}

interface ConfigStore {
  data: ConfigData; // merged — read by UI
  files: SourceFile[]; // per-file — written to disk
  loading: boolean;
  applying: boolean;
  dirty: boolean;
  error: string | null;

  load: () => Promise<void>;
  apply: () => Promise<void>;

  // Scalar upsert: sets exactly one value for a key.
  // Use for singletons (blur_radius, borderpx, …).
  setValue: (key: string, value: string) => void;
  // Atomic batch update for multiple scalar keys (one history entry).
  setValues: (entries: Record<string, string>) => void;

  // Multi-value list ops: use for keys where every line is a distinct entry
  // (bind=, exec-once=, env=, …).
  addEntry: (key: string, value: string) => void;
  updateEntry: (key: string, index: number, value: string) => void;
  removeEntry: (key: string, index: number) => void;
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
          set({ files, data: mergeFileData(files), loading: false, dirty: false });
          useConfigStore.temporal.getState().clear();
        } catch (e: unknown) {
          set({ error: String(e instanceof Error ? e.message : e), loading: false });
        }
      },

      apply: async () => {
        set({ applying: true, error: null });
        try {
          await writeAllConfigFiles(get().files);
          await reloadMango();
          set({ applying: false, dirty: false });
          useConfigStore.temporal.getState().clear();
        } catch (e: unknown) {
          set({ error: String(e instanceof Error ? e.message : e), applying: false });
        }
      },

      setValue: (key, value) =>
        set((state) => {
          const fileIdx = fileIndexForKey(state.files, key);
          const files = patchFile(state.files, fileIdx, (prev) => {
            const current = prev[key];
            if (current && current.length > 0) {
              const next = [...current];
              next[0] = value;
              return { ...prev, [key]: next };
            }
            return { ...prev, [key]: [value] };
          });
          return { files, data: mergeFileData(files), dirty: true };
        }),

      setValues: (entries) =>
        set((state) => {
          let files = state.files;
          for (const [key, value] of Object.entries(entries)) {
            const fileIdx = fileIndexForKey(files, key);
            files = patchFile(files, fileIdx, (prev) => {
              const current = prev[key];
              if (current && current.length > 0) {
                const next = [...current];
                next[0] = value;
                return { ...prev, [key]: next };
              }
              return { ...prev, [key]: [value] };
            });
          }
          return { files, data: mergeFileData(files), dirty: true };
        }),

      addEntry: (key, value) =>
        set((state) => {
          const files = patchFile(state.files, 0, (prev) => ({
            ...prev,
            [key]: [...(prev[key] ?? []), value],
          }));
          return { files, data: mergeFileData(files), dirty: true };
        }),

      updateEntry: (key, index, value) =>
        set((state) => {
          const target = resolveGlobalIndex(state.files, key, index);
          if (!target) return state;
          const files = patchFile(state.files, target.fileIdx, (prev) => {
            const current = prev[key] ?? [];
            const next = [...current];
            next[target.localIdx] = value;
            return { ...prev, [key]: next };
          });
          return { files, data: mergeFileData(files), dirty: true };
        }),

      removeEntry: (key, index) =>
        set((state) => {
          const target = resolveGlobalIndex(state.files, key, index);
          if (!target) return state;
          const files = patchFile(state.files, target.fileIdx, (prev) => {
            const current = prev[key] ?? [];
            const next = current.filter((_, i) => i !== target.localIdx);
            if (next.length === 0) {
              const { [key]: _dropped, ...rest } = prev;
              return rest;
            }
            return { ...prev, [key]: next };
          });
          return { files, data: mergeFileData(files), dirty: true };
        }),
    }),

    {
      partialize: (state) => ({ files: state.files }),
      limit: 100,
      equality: (a, b) => {
        const fa = a.files;
        const fb = b.files;
        return (
          fa.length === fb.length &&
          fa.every((f, i) => {
            const g = fb[i];
            return f.absPath === g.absPath && f.data === g.data;
          })
        );
      },
    },
  ),
);

export function undo() {
  useConfigStore.temporal.getState().undo();
  syncDerivedState();
}

export function redo() {
  useConfigStore.temporal.getState().redo();
  syncDerivedState();
}
