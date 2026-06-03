import { create } from "zustand";
import { temporal } from "zundo";
import { readAllConfigFiles, writeAllConfigFiles, reloadMango } from "./config-file";
import { type ConfigData, type SourceFile, countLines } from "./config-types";
import { makeEntryLine } from "./config-parse";

// `data` is the merged view across all files (UI reads this).
// `files` is the authoritative source (written to disk).
// `data` is ALWAYS derived from `files[].lines` — never stored separately.

function mergeFileData(files: SourceFile[]): ConfigData {
  const merged: ConfigData = {};
  for (const file of files) {
    for (const line of file.lines) {
      if (line.type === "entry") {
        (merged[line.key] ??= []).push(line.value);
      }
    }
  }
  return merged;
}

function fileIndexForKey(files: SourceFile[], key: string): number {
  for (let i = 0; i < files.length; i++) {
    if (files[i].lines.some((l) => l.type === "entry" && l.key === key)) return i;
  }
  return 0;
}

function resolveGlobalIndex(
  files: SourceFile[],
  key: string,
  globalIndex: number,
): { fileIdx: number; localIdx: number } | null {
  let seen = 0;
  for (let i = 0; i < files.length; i++) {
    const n = countLines(files[i].lines, key);
    if (seen + n > globalIndex) {
      return { fileIdx: i, localIdx: globalIndex - seen };
    }
    seen += n;
  }
  return null;
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
  // (bind=, exec-once=, env=, …).  All mutations operate on `file.lines`
  // only — `data` is re-derived from lines automatically.
  addEntry: (key: string, value: string) => void;
  /** Insert a new entry at a specific line position in a specific file. */
  insertEntry: (
    key: string,
    value: string,
    options: { fileIdx: number; afterLineIdx: number },
  ) => void;
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
          const files = state.files.map((f, i) => {
            if (i !== fileIdx) return f;
            const newLines = [...f.lines];
            const idx = newLines.findIndex((l) => l.type === "entry" && l.key === key);
            if (idx >= 0) {
              newLines[idx] = makeEntryLine(key, value);
            } else {
              newLines.push(makeEntryLine(key, value));
            }
            return { ...f, lines: newLines };
          });
          return { files, data: mergeFileData(files), dirty: true };
        }),

      setValues: (entries) =>
        set((state) => {
          let files = state.files;
          for (const [key, value] of Object.entries(entries)) {
            const fileIdx = fileIndexForKey(files, key);
            files = files.map((f, i) => {
              if (i !== fileIdx) return f;
              const newLines = [...f.lines];
              const idx = newLines.findIndex((l) => l.type === "entry" && l.key === key);
              if (idx >= 0) {
                newLines[idx] = makeEntryLine(key, value);
              } else {
                newLines.push(makeEntryLine(key, value));
              }
              return { ...f, lines: newLines };
            });
          }
          return { files, data: mergeFileData(files), dirty: true };
        }),

      addEntry: (key, value) =>
        set((state) => {
          const fileIdx = fileIndexForKey(state.files, key);
          const files = state.files.map((f, i) =>
            i === fileIdx ? { ...f, lines: [...f.lines, makeEntryLine(key, value)] } : f,
          );
          return { files, data: mergeFileData(files), dirty: true };
        }),

      insertEntry: (key, value, { fileIdx, afterLineIdx }) =>
        set((state) => {
          const file = state.files[fileIdx];
          if (!file) return state;
          const newLines = [...file.lines];
          newLines.splice(afterLineIdx + 1, 0, makeEntryLine(key, value));
          const files = state.files.map((f, i) => (i === fileIdx ? { ...f, lines: newLines } : f));
          return { files, data: mergeFileData(files), dirty: true };
        }),

      updateEntry: (key, index, value) =>
        set((state) => {
          const target = resolveGlobalIndex(state.files, key, index);
          if (!target) return state;
          const files = state.files.map((f, i) => {
            if (i !== target.fileIdx) return f;
            let count = -1;
            const newLines = f.lines.map((l) => {
              if (l.type === "entry" && l.key === key) {
                count++;
                if (count === target.localIdx) return makeEntryLine(key, value);
              }
              return l;
            });
            return { ...f, lines: newLines };
          });
          return { files, data: mergeFileData(files), dirty: true };
        }),

      removeEntry: (key, index) =>
        set((state) => {
          const target = resolveGlobalIndex(state.files, key, index);
          if (!target) return state;
          const files = state.files.map((f, i) => {
            if (i !== target.fileIdx) return f;
            let count = -1;
            const newLines = f.lines.filter((l) => {
              if (l.type === "entry" && l.key === key) {
                count++;
                return count !== target.localIdx;
              }
              return true;
            });
            return { ...f, lines: newLines };
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
            return f.absPath === g.absPath && f.lines === g.lines;
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
