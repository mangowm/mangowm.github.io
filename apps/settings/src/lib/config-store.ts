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
// 5. undo/redo via zundo is limited to the config data shape and excludes
//    transient UI state (loading, applying, error).
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
          const data = mergeFileData(files);
          set({ files, data, loading: false, dirty: false });
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
          useConfigStore.temporal.getState().clear();
          set({ applying: false, dirty: false });
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
              // Update the first (and expected only) occurrence.
              const next = [...current];
              next[0] = value;
              return { ...prev, [key]: next };
            }
            // Key is new — append.
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
          // New interactive entries always go to the root file (index 0).
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
      // Only track the parts that affect config state.
      // Transient UI flags (loading, applying, error) are not undo-able.
      partialize: (state) => ({
        data: state.data,
        files: state.files,
        dirty: state.dirty,
      }),
      limit: 100,
      // Deep equality via JSON keeps undo from creating entries for
      // no-op state transitions. Acceptable cost given config file sizes.
      equality: (a, b) =>
        a.dirty === b.dirty &&
        JSON.stringify(a.data) === JSON.stringify(b.data) &&
        JSON.stringify(a.files) === JSON.stringify(b.files),
    },
  ),
);
