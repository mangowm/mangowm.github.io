import { create } from "zustand";
import { temporal } from "zundo";
import {
  applyChange,
  bindingKind,
  bindingTrigger,
  parseBinding,
  parseOption,
  validateText,
  type Change,
  type RuleKey,
} from "@mangowm.github.io/config";
import { DIRECTIVES, RULES } from "@mangowm.github.io/config/catalog";
import { getHost, isTauri } from "../platform";
import type { RawConfigFile } from "../platform";
import { type ConfigData, type FileFormat, type SourceFile, countLines } from "./types";
import { detectFormat, documentLines, formatDocument, parseDocument } from "./parse";
import { cfgBool, cfgInt, cfgFloat, cfgStr } from "./helpers";
import { convertDocument, convertFile, convertName } from "./convert";
import { DEFAULTS } from "./defaults";
import { GLOBAL_META as GLOBAL_BY_KEY, globalMax, globalMin } from "./schema-meta";

const EMPTY_VALUES: readonly string[] = Object.freeze([]);

function toSourceFile(file: RawConfigFile): SourceFile {
  const format = detectFormat(file.absPath || file.refPath, file.text);
  const document = parseDocument(file.text, format);
  return {
    absPath: file.absPath,
    refPath: file.refPath,
    format,
    document,
    lines: documentLines(document),
    original: file.text,
  };
}

function updateDocument(file: SourceFile, change: Change): SourceFile {
  const document = applyChange(file.document, change);
  return { ...file, document, lines: documentLines(document) };
}

function updateScalar(file: SourceFile, key: string, value: string): SourceFile {
  const definition = GLOBAL_BY_KEY.get(key);

  return updateDocument(file, {
    kind: "option",
    key,
    value: definition ? parseOption(value, definition) : value,
  });
}

const DIRECTIVE_KEYS = new Set<string>(DIRECTIVES.map((directive) => directive.key));
const RULE_KEYS = new Set<string>(RULES.map((rule) => rule.key));

function isBindingKeyword(key: string): boolean {
  try {
    bindingKind(key);
    return true;
  } catch {
    return false;
  }
}

function modeAt(lines: SourceFile["lines"], lineIndex: number): string {
  let mode = "default";
  for (let index = 0; index < lineIndex; index++) {
    const line = lines[index];
    if (line?.type === "entry" && line.key === "key_mode") mode = line.value;
  }
  return mode;
}

function lineIndexForKey(
  lines: SourceFile["lines"],
  key: string,
  localIndex: number,
): number | null {
  let seen = -1;
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    if (line?.type !== "entry" || line.key !== key) continue;
    seen++;
    if (seen === localIndex) return index;
  }
  return null;
}

function bindingChange(key: string, value: string, mode: string): Change {
  const parsed = parseBinding(key, value);
  return {
    kind: "binding",
    binding: parsed.kind,
    mode,
    flags: parsed.flags,
    trigger: bindingTrigger(parsed),
    actions: [parsed.action],
    append: parsed.flags.conflict,
  };
}

function bindingAt(
  file: SourceFile,
  key: string,
  localIndex: number,
): { mode: string; change: Change } | null {
  const index = lineIndexForKey(file.lines, key, localIndex);
  if (index === null) return null;

  const line = file.lines[index];
  if (line?.type !== "entry") return null;

  const mode = modeAt(file.lines, index);
  const parsed = parseBinding(key, line.value);
  return {
    mode,
    change: {
      kind: "binding",
      binding: parsed.kind,
      mode,
      flags: parsed.flags,
      trigger: bindingTrigger(parsed),
      actions: [parsed.action],
      remove: true,
    },
  };
}

function addChange(file: SourceFile, key: string, value: string, data: ConfigData): Change {
  if (DIRECTIVE_KEYS.has(key)) {
    return { kind: "directive", key, values: [...(data[key] ?? []), value] };
  }

  if (RULE_KEYS.has(key)) {
    return { kind: "rule-line", rule: key as RuleKey, index: countLines(file.lines, key), value };
  }

  if (isBindingKeyword(key)) {
    return bindingChange(key, value, modeAt(file.lines, file.lines.length));
  }

  if (key === "env" || key === "var") {
    const comma = value.indexOf(",");
    const name = comma === -1 ? value : value.slice(0, comma);
    return {
      kind: "pair",
      table: key,
      name,
      value: comma === -1 ? "" : value.slice(comma + 1),
    };
  }

  return { kind: "option", key, value };
}

function mergeFileData(files: SourceFile[], prevData: ConfigData = {}): ConfigData {
  const next: ConfigData = {};
  for (const file of files) {
    for (const line of file.lines) {
      if (line.type === "entry") {
        (next[line.key] ??= []).push(line.value);
      }
    }
  }

  const result: ConfigData = {};
  const allKeys = new Set([...Object.keys(prevData), ...Object.keys(next)]);
  for (const key of allKeys) {
    const prev = prevData[key];
    const nextArr = next[key];
    if (
      prev &&
      nextArr &&
      prev.length === nextArr.length &&
      prev.every((v, i) => v === nextArr[i])
    ) {
      result[key] = prev;
    } else if (nextArr) {
      result[key] = nextArr;
    }
  }
  return result;
}

function fileIndexForKey(files: SourceFile[], key: string): number {
  for (let i = 0; i < files.length; i++) {
    if (files[i].lines.some((l) => l.type === "entry" && l.key === key)) return i;
  }
  return 0;
}

export function resolveGlobalIndex(
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

interface ConfigStore {
  data: ConfigData; // merged — read by UI
  files: SourceFile[]; // per-file — written to disk
  loading: boolean;
  applying: boolean;
  dirty: boolean;
  error: string | null;
  isTauri: boolean;
  outputFormat: FileFormat;
  revision: number;

  load: () => Promise<void>;
  setOutputFormat: (format: FileFormat) => void;
  apply: () => Promise<void>;
  createDefault: () => Promise<void>;
  importConfig: () => Promise<void>;
  backup: () => Promise<string | null>;
  openConfigFolder: () => Promise<void>;

  // Scalar upsert: sets exactly one value for a key.
  // Use for singletons (blur_radius, borderpx, …).
  setValue: (key: string, value: string) => void;
  // Atomic batch update for multiple scalar keys (one history entry).
  setValues: (entries: Record<string, string>) => void;

  // Multi-value list ops: use for keys where every line is a distinct entry
  // (bind=, exec_once=, env=, …). Every mutation edits `file.document`;
  // `lines` and `data` are derived from it again.
  addEntry: (key: string, value: string) => void;
  setDirective: (key: string, values: string[]) => void;
  setPair: (table: "env" | "var", name: string, value?: string) => void;
  /** Insert a binding into a specific file and mode. */
  insertEntry: (key: string, value: string, options: { fileIdx: number; mode: string }) => void;
  updateEntry: (key: string, index: number, value: string) => void;
  removeEntry: (key: string, index: number) => void;

  /** Replace a whole file from text edited outside the form. */
  setFileText: (absPath: string, text: string, format?: FileFormat) => void;
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
      isTauri: isTauri(),
      outputFormat: "conf",
      revision: 0,

      setOutputFormat: (format) => set({ outputFormat: format }),

      load: async () => {
        set({ loading: true, error: null });
        try {
          const loaded = await getHost().load();
          const files = loaded.map(toSourceFile);
          set({
            files,
            data: mergeFileData(files, {}),
            loading: false,
            dirty: false,
            revision: get().revision + 1,
          });
          useConfigStore.temporal.getState().clear();
        } catch (e: unknown) {
          set({ error: String(e instanceof Error ? e.message : e), loading: false });
        }
      },

      createDefault: async () => {
        set({ loading: true, error: null });
        try {
          const host = getHost();
          if (await host.hasConfig()) {
            const path = await host.backup?.();
            if (path) {
              await host.preferences.write({
                backup: { createdAt: new Date().toISOString(), path },
              });
            }
          }
          const files = (await host.createDefault()).map(toSourceFile);
          set({
            files,
            data: mergeFileData(files, {}),
            loading: false,
            dirty: false,
            revision: get().revision + 1,
          });
          useConfigStore.temporal.getState().clear();
        } catch (e: unknown) {
          set({ error: String(e instanceof Error ? e.message : e), loading: false });
        }
      },

      importConfig: async () => {
        set({ loading: true, error: null });
        try {
          const loaded = await getHost().importConfig();
          if (loaded === null) {
            set({ loading: false });
            return;
          }
          const files = loaded.map(toSourceFile);
          set({
            files,
            data: mergeFileData(files, {}),
            loading: false,
            dirty: false,
            revision: get().revision + 1,
          });
          useConfigStore.temporal.getState().clear();
        } catch (e: unknown) {
          set({ error: String(e instanceof Error ? e.message : e), loading: false });
        }
      },

      backup: async () => {
        const host = getHost();
        const path = await host.backup?.();
        if (!path) return null;
        await host.preferences.write({
          backup: { createdAt: new Date().toISOString(), path },
        });
        return path;
      },

      openConfigFolder: async () => {
        await getHost().openConfigFolder?.();
      },

      apply: async () => {
        set({ applying: true, error: null });
        try {
          const host = getHost();
          const files = get().files;
          const format = get().outputFormat;
          const converting = files.some((file) => file.format !== format);

          if (converting && host.backup) {
            await get().backup();
          }

          await host.save(
            files.map((file) => ({
              absPath: convertName(file.absPath, format),
              text: convertFile(file, format),
            })),
          );

          if (converting) {
            for (const file of files) {
              if (convertName(file.absPath, format) !== file.absPath) {
                await host.remove?.(file.absPath);
              }
            }
          }

          await host.reload();

          const nextFiles = files.map((file) => {
            const absPath = convertName(file.absPath, format);
            const text = convertFile(file, format);
            const document = parseDocument(text, format);
            return {
              ...file,
              absPath,
              refPath: convertName(file.refPath, format),
              format,
              document,
              lines: documentLines(document),
              original: text,
            };
          });

          set({
            files: nextFiles,
            data: mergeFileData(nextFiles, {}),
            applying: false,
            dirty: false,
            revision: get().revision + 1,
          });
          useConfigStore.temporal.getState().clear();
        } catch (e: unknown) {
          set({ error: String(e instanceof Error ? e.message : e), applying: false });
        }
      },

      setValue: (key, value) =>
        set((state) => {
          const fileIdx = fileIndexForKey(state.files, key);
          const files = state.files.map((file, index) =>
            index === fileIdx ? updateScalar(file, key, value) : file,
          );
          return { files, data: mergeFileData(files, state.data), dirty: true };
        }),

      setValues: (entries) =>
        set((state) => {
          let files = state.files;
          for (const [key, value] of Object.entries(entries)) {
            const fileIdx = fileIndexForKey(files, key);
            files = files.map((file, index) =>
              index === fileIdx ? updateScalar(file, key, value) : file,
            );
          }
          return { files, data: mergeFileData(files, state.data), dirty: true };
        }),

      setDirective: (key, values) =>
        set((state) => {
          const fileIdx = fileIndexForKey(state.files, key);
          const files = state.files.map((file, index) =>
            index === fileIdx ? updateDocument(file, { kind: "directive", key, values }) : file,
          );
          return { files, data: mergeFileData(files, state.data), dirty: true };
        }),

      setPair: (table, name, value) =>
        set((state) => {
          const fileIdx = fileIndexForKey(state.files, table);
          const files = state.files.map((file, index) =>
            index === fileIdx ? updateDocument(file, { kind: "pair", table, name, value }) : file,
          );
          return { files, data: mergeFileData(files, state.data), dirty: true };
        }),

      addEntry: (key, value) =>
        set((state) => {
          const fileIdx = fileIndexForKey(state.files, key);
          const file = state.files[fileIdx];
          if (!file) return state;

          const files = state.files.map((candidate, index) =>
            index === fileIdx
              ? updateDocument(candidate, addChange(candidate, key, value, state.data))
              : candidate,
          );
          return { files, data: mergeFileData(files, state.data), dirty: true };
        }),

      insertEntry: (key, value, { fileIdx, mode }) =>
        set((state) => {
          const file = state.files[fileIdx];
          if (!file) return state;

          const files = state.files.map((candidate, index) =>
            index === fileIdx
              ? updateDocument(candidate, bindingChange(key, value, mode))
              : candidate,
          );
          return { files, data: mergeFileData(files, state.data), dirty: true };
        }),

      updateEntry: (key, index, value) =>
        set((state) => {
          const target = resolveGlobalIndex(state.files, key, index);
          if (!target) return state;

          const files = state.files.map((file, fileIdx) => {
            if (fileIdx !== target.fileIdx) return file;

            if (RULE_KEYS.has(key)) {
              return updateDocument(file, {
                kind: "rule-line",
                rule: key as RuleKey,
                index: target.localIdx,
                value,
              });
            }

            if (isBindingKeyword(key)) {
              const old = bindingAt(file, key, target.localIdx);
              if (!old) return file;

              const removed = applyChange(file.document, old.change);
              return updateDocument(
                { ...file, document: removed, lines: documentLines(removed) },
                bindingChange(key, value, old.mode),
              );
            }

            return updateDocument(file, { kind: "option", key, value });
          });

          return { files, data: mergeFileData(files, state.data), dirty: true };
        }),

      removeEntry: (key, index) =>
        set((state) => {
          const target = resolveGlobalIndex(state.files, key, index);
          if (!target) return state;

          const files = state.files.map((file, fileIdx) => {
            if (fileIdx !== target.fileIdx) return file;

            if (RULE_KEYS.has(key)) {
              return updateDocument(file, {
                kind: "rule-line",
                rule: key as RuleKey,
                index: target.localIdx,
              });
            }

            if (isBindingKeyword(key)) {
              const old = bindingAt(file, key, target.localIdx);
              return old ? updateDocument(file, old.change) : file;
            }

            return file;
          });

          return { files, data: mergeFileData(files, state.data), dirty: true };
        }),

      setFileText: (absPath, text, format) =>
        set((state) => {
          const target = state.files.find((file) => file.absPath === absPath);
          if (!target) return state;

          try {
            const source = format ?? target.format;
            const issue = validateText(text, source).find(
              (candidate) => candidate.severity === "error",
            );
            if (issue) {
              return state;
            }

            const sourceDocument = parseDocument(text, source);
            const nativeText =
              source === target.format ? text : convertDocument(sourceDocument, target.format);

            if (text.trim() !== "" && nativeText.trim() === "") {
              return {
                error: "The edit produced an empty config, so it was not saved.",
              };
            }

            if (formatDocument(target.document) === nativeText) return state;

            const document = parseDocument(nativeText, target.format);
            const lines = documentLines(document);
            const files = state.files.map((file) =>
              file.absPath === absPath ? { ...file, document, lines } : file,
            );
            return { files, data: mergeFileData(files, state.data), dirty: true, error: null };
          } catch (error) {
            return { error: error instanceof Error ? error.message : String(error) };
          }
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

useConfigStore.subscribe((state, prevState) => {
  if (state.files === prevState.files) return;
  const { pastStates } = useConfigStore.temporal.getState();
  const newData = mergeFileData(state.files, state.data);
  if (newData !== state.data || pastStates.length > 0 !== state.dirty) {
    useConfigStore.setState({
      data: newData,
      dirty: pastStates.length > 0,
    });
  }
});

export function useConfigValue(key: string): string | undefined {
  return useConfigStore((s) => s.data[key]?.[0] ?? DEFAULTS[key]?.[0]);
}

export function useConfigValues(key: string): readonly string[] {
  return useConfigStore((s) => s.data[key] ?? EMPTY_VALUES);
}

export function useConfigBool(key: string, fallback?: boolean): boolean {
  return useConfigStore((s) => cfgBool(s.data, key, fallback));
}

export function useConfigInt(key: string, fallback?: number, min?: number, max?: number): number {
  return useConfigStore((s) => cfgInt(s.data, key, fallback, min, max));
}

export function useConfigFloat(key: string, fallback?: number, min?: number, max?: number): number {
  return useConfigStore((s) => cfgFloat(s.data, key, fallback, min, max));
}

export function useConfigStr(key: string, fallback?: string): string {
  return useConfigStore((s) => cfgStr(s.data, key, fallback));
}

export function useGlobalInt(key: string): number {
  return useConfigInt(key, undefined, globalMin(key), globalMax(key));
}

export function useGlobalFloat(key: string): number {
  return useConfigFloat(key, undefined, globalMin(key), globalMax(key));
}

export function undo() {
  useConfigStore.temporal.getState().undo();
  useConfigStore.setState((state) => ({ revision: state.revision + 1 }));
}

export function redo() {
  useConfigStore.temporal.getState().redo();
  useConfigStore.setState((state) => ({ revision: state.revision + 1 }));
}
