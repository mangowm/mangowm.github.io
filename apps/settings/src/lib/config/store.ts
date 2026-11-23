import { create, useStore } from "zustand";
import { temporal } from "zundo";
import {
  applyChange,
  applyMigrations as applyConfigMigrations,
  bindingKind,
  bindingTrigger,
  detectMigrations,
  parseBinding,
  parseOption,
  validateText,
  type Change,
  type MigrationFinding,
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

function mergeFileData(files: readonly SourceFile[], prevData: ConfigData = {}): ConfigData {
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

  // Keep the previous object when nothing changed. Callers rely on reference
  // equality to avoid an extra store update (and render) on every mutation.
  const prevKeys = Object.keys(prevData);
  const nextKeys = Object.keys(result);
  if (prevKeys.length === nextKeys.length) {
    let same = true;
    for (const key of nextKeys) {
      const prev = prevData[key];
      const nextArr = result[key];
      if (!prev || !nextArr || prev.length !== nextArr.length) {
        same = false;
        break;
      }
      for (let i = 0; i < nextArr.length; i++) {
        if (prev[i] !== nextArr[i]) {
          same = false;
          break;
        }
      }
      if (!same) break;
    }
    if (same) return prevData;
  }

  return result;
}

const dataCache = new WeakMap<readonly SourceFile[], ConfigData>();
let lastDerivedData: ConfigData = {};

/**
 * Derive the flat config view from the canonical files.
 *
 * `files` is the only source of truth; this projection is memoized per files
 * reference so selectors can safely use reference equality. Unchanged arrays
 * are shared with the previous projection.
 */
export function deriveConfigData(files: readonly SourceFile[]): ConfigData {
  const cached = dataCache.get(files);
  if (cached) return cached;

  const data = mergeFileData(files, lastDerivedData);
  dataCache.set(files, data);
  lastDerivedData = data;
  return data;
}

export interface SourceMigrationFinding extends MigrationFinding {
  absPath: string;
  refPath: string;
}

const migrationCache = new WeakMap<readonly SourceFile[], SourceMigrationFinding[]>();

export function deriveMigrationFindings(files: readonly SourceFile[]): SourceMigrationFinding[] {
  const cached = migrationCache.get(files);
  if (cached) return cached;

  const findings = files.flatMap((file) =>
    detectMigrations(file.document).map((finding) => ({
      ...finding,
      absPath: file.absPath,
      refPath: file.refPath,
    })),
  );
  migrationCache.set(files, findings);
  return findings;
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
  files: SourceFile[]; // per-file — written to disk
  loading: boolean;
  applying: boolean;
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
  /** Apply every safe legacy migration and return the number of findings fixed. */
  fixMigrations: () => Promise<number>;

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
      files: [],
      loading: false,
      applying: false,
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
            loading: false,
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
            loading: false,
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
            loading: false,
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

      fixMigrations: async () => {
        const files = get().files;
        const results = files.map((file) => applyConfigMigrations(file.document));
        const applied = results.reduce((count, result) => count + result.applied.length, 0);
        if (applied === 0) return 0;

        if (get().isTauri) {
          try {
            await get().backup();
          } catch {
            // Migration is still safe to apply in memory if the backup fails.
          }
        }

        const nextFiles = files.map((file, index) => {
          const result = results[index];
          if (!result || result.document === file.document) return file;
          return {
            ...file,
            document: result.document,
            lines: documentLines(result.document),
          };
        });

        set({ files: nextFiles, revision: get().revision + 1 });
        return applied;
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
            applying: false,
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
          return { files };
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
          return { files };
        }),

      setDirective: (key, values) =>
        set((state) => {
          const fileIdx = fileIndexForKey(state.files, key);
          const files = state.files.map((file, index) =>
            index === fileIdx ? updateDocument(file, { kind: "directive", key, values }) : file,
          );
          return { files };
        }),

      setPair: (table, name, value) =>
        set((state) => {
          const fileIdx = fileIndexForKey(state.files, table);
          const files = state.files.map((file, index) =>
            index === fileIdx ? updateDocument(file, { kind: "pair", table, name, value }) : file,
          );
          return { files };
        }),

      addEntry: (key, value) =>
        set((state) => {
          const fileIdx = fileIndexForKey(state.files, key);
          const file = state.files[fileIdx];
          if (!file) return state;

          const data = deriveConfigData(state.files);
          const files = state.files.map((candidate, index) =>
            index === fileIdx
              ? updateDocument(candidate, addChange(candidate, key, value, data))
              : candidate,
          );
          return { files };
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
          return { files };
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

          return { files };
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

          return { files };
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
            return { files, error: null };
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

/** True when there are changes that can still be undone back to the saved config. */
export function useConfigDirty(): boolean {
  return useStore(useConfigStore.temporal, (state) => state.pastStates.length > 0);
}

export function useMigrationFindings(): readonly SourceMigrationFinding[] {
  return useConfigStore((state) => deriveMigrationFindings(state.files));
}

export function useConfigValue(key: string): string | undefined {
  return useConfigStore((s) => deriveConfigData(s.files)[key]?.[0] ?? DEFAULTS[key]?.[0]);
}

export function useConfigValues(key: string): readonly string[] {
  return useConfigStore((s) => deriveConfigData(s.files)[key] ?? EMPTY_VALUES);
}

export function useConfigBool(key: string, fallback?: boolean): boolean {
  return useConfigStore((s) => cfgBool(deriveConfigData(s.files), key, fallback));
}

export function useConfigInt(key: string, fallback?: number, min?: number, max?: number): number {
  return useConfigStore((s) => cfgInt(deriveConfigData(s.files), key, fallback, min, max));
}

export function useConfigFloat(key: string, fallback?: number, min?: number, max?: number): number {
  return useConfigStore((s) => cfgFloat(deriveConfigData(s.files), key, fallback, min, max));
}

export function useConfigStr(key: string, fallback?: string): string {
  return useConfigStore((s) => cfgStr(deriveConfigData(s.files), key, fallback));
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
