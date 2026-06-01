// ---------------------------------------------------------------------------
// config-store.ts
// Single Zustand store for the entire mango config state.
//
// Key design decisions:
//
// 1. `data` is the merged view across all files — what the UI reads.
// 2. `files` is the authoritative source — what gets written to disk.
//    Mutations always go into `files`; `data` is always re-derived from them.
//
// 3. Multi-value keys are fully supported.
//    bind=, exec-once=, env= etc. all have multiple entries in their
//    string[] array. The index in that array is the stable handle for
//    update and remove operations.
//
// 4. Two mutation modes exist for a reason:
//    - `setValue(key, value)`   — scalar upsert. Sets exactly one value
//      for a key. Use this for every key where only one value makes sense
//      (blur_radius, borderpx, focused_opacity, …). Always reads the live
//      store state so it is safe to call multiple times in one event.
//    - `addEntry / updateEntry / removeEntry` — multi-value list ops.
//      Use these for keys like bind=, exec-once=, env= where every line
//      is a distinct item.
//
// 5. undo/redo via zundo — partialize tracks only `files`; `data`/`dirty`
//    re-synced via exported `undo()` / `redo()` wrappers.
// ---------------------------------------------------------------------------

import { create } from "zustand";
import { temporal } from "zundo";
import { readAllConfigFiles, writeAllConfigFiles, reloadMango } from "./config-file";
import type { ConfigData, SourceFile } from "./config-types";

// ---------------------------------------------------------------------------
// Internal helpers (not exported — store callers never need them)
// ---------------------------------------------------------------------------

/** Merge all SourceFile data maps into a single flat ConfigData. */
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

/**
 * Returns the index of the first SourceFile that owns the given key.
 * Falls back to 0 (root file) for keys that don't exist yet.
 */
function fileIndexForKey(files: SourceFile[], key: string): number {
  const idx = files.findIndex((f) => key in f.data);
  return idx === -1 ? 0 : idx;
}

/**
 * Produce a new files array with one file's data replaced.
 * All other files are shallow-cloned; only the target file gets a new
 * data object so Zustand sees the change.
 */
function patchFile(
  files: SourceFile[],
  fileIdx: number,
  patchData: (prev: ConfigData) => ConfigData,
): SourceFile[] {
  return files.map((f, i) => (i === fileIdx ? { ...f, data: patchData(f.data) } : f));
}

/** Re-sync `data` and `dirty` after the temporal store moves to a new snapshot. */
function syncDerivedState() {
  const { files } = useConfigStore.getState();
  const { pastStates } = useConfigStore.temporal.getState();
  useConfigStore.setState({
    data: mergeFileData(files),
    dirty: pastStates.length > 0,
  });
}

// ---------------------------------------------------------------------------
// Store interface
// ---------------------------------------------------------------------------

interface ConfigStore {
  // ---- state ---------------------------------------------------------------
  data: ConfigData; // merged view across all files — read by UI
  files: SourceFile[]; // per-file state — written to disk
  loading: boolean;
  applying: boolean;
  dirty: boolean;
  error: string | null;

  // ---- lifecycle -----------------------------------------------------------
  load: () => Promise<void>;
  apply: () => Promise<void>;

  // ---- scalar mutations (single-value keys) --------------------------------
  /**
   * Set exactly one value for a key.
   * If the key already exists the first occurrence is updated in-place.
   * If the key is absent a new entry is appended to the root file.
   * Safe to call multiple times per event — always reads live store state.
   */
  setValue: (key: string, value: string) => void;

  /**
   * Set multiple scalar keys in one atomic store update.
   * Equivalent to calling setValue() for each pair but produces a single
   * undo history entry and a single re-render.
   */
  setValues: (entries: Record<string, string>) => void;

  // ---- multi-value mutations (list keys) -----------------------------------
  /**
   * Append a new value for `key`.
   * Always goes to the root file so sourced files are not polluted with
   * entries that the user added interactively.
   */
  addEntry: (key: string, value: string) => void;
  /**
   * Replace the value at position `index` within `key`'s value list.
   * The index is into the merged `data` array.
   */
  updateEntry: (key: string, index: number, value: string) => void;
  /**
   * Remove the entry at position `index` from `key`'s value list.
   */
  removeEntry: (key: string, index: number) => void;
}

// ---------------------------------------------------------------------------
// Store implementation
// ---------------------------------------------------------------------------

export const useConfigStore = create<ConfigStore>()(
  temporal(
    (set, get) => ({
      data: {},
      files: [],
      loading: false,
      applying: false,
      dirty: false,
      error: null,

      // ---- load ------------------------------------------------------------
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

      // ---- apply -----------------------------------------------------------
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

      // ---- scalar: setValue ------------------------------------------------
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

      // ---- scalar: setValues -----------------------------------------------
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

      // ---- multi-value: addEntry -------------------------------------------
      addEntry: (key, value) =>
        set((state) => {
          const files = patchFile(state.files, 0, (prev) => ({
            ...prev,
            [key]: [...(prev[key] ?? []), value],
          }));
          return { files, data: mergeFileData(files), dirty: true };
        }),

      // ---- multi-value: updateEntry ----------------------------------------
      updateEntry: (key, index, value) =>
        set((state) => {
          const fileIdx = fileIndexForKey(state.files, key);
          const files = patchFile(state.files, fileIdx, (prev) => {
            const current = prev[key] ?? [];
            if (index < 0 || index >= current.length) return prev;
            const next = [...current];
            next[index] = value;
            return { ...prev, [key]: next };
          });
          return { files, data: mergeFileData(files), dirty: true };
        }),

      // ---- multi-value: removeEntry ----------------------------------------
      removeEntry: (key, index) =>
        set((state) => {
          const fileIdx = fileIndexForKey(state.files, key);
          const files = patchFile(state.files, fileIdx, (prev) => {
            const current = prev[key] ?? [];
            if (index < 0 || index >= current.length) return prev;
            const next = current.filter((_, i) => i !== index);
            if (next.length === 0) {
              const { [key]: _dropped, ...rest } = prev;
              return rest;
            }
            return { ...prev, [key]: next };
          });
          return { files, data: mergeFileData(files), dirty: true };
        }),
    }),

    // ---- zundo options -----------------------------------------------------
    {
      // Only `files` in history — `data` re-derived after undo/redo via
      // the exported wrappers. Transient flags excluded.
      partialize: (state) => ({ files: state.files }),

      limit: 100,

      // Identity check — patchFile returns same ref when nothing changes,
      // so no-op transitions don't create history entries.
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

// ---------------------------------------------------------------------------
// Undo / redo — wrappers keep `syncDerivedState` in one place.
// ---------------------------------------------------------------------------

export function undo() {
  useConfigStore.temporal.getState().undo();
  syncDerivedState();
}

export function redo() {
  useConfigStore.temporal.getState().redo();
  syncDerivedState();
}
