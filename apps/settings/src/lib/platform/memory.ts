import type { ConfigHost, PendingFile, Preferences, RawConfigFile } from "./types";

const CURRENT_SETTINGS_VERSION = "0.1.1";

export interface MemoryHost extends ConfigHost {
  readonly saved: PendingFile[];
  readonly files: RawConfigFile[];
}

export function createMemoryHost(files: RawConfigFile[] = [], defaultConfig = ""): MemoryHost {
  let preferences: Preferences = { version: CURRENT_SETTINGS_VERSION };
  const saved: PendingFile[] = [];
  const current = [...files];

  return {
    kind: "browser",
    saved,
    files: current,
    hasConfig: async () => current.length > 0,
    load: async () => current,
    createDefault: async () => {
      const file = { absPath: "config.conf", refPath: "config.conf", text: defaultConfig };
      current.splice(0, current.length, file);
      return current;
    },
    importConfig: async () => current,
    save: async (pending: PendingFile[]) => {
      saved.splice(0, saved.length, ...pending);
      for (const file of pending) {
        const existing = current.find((candidate) => candidate.absPath === file.absPath);
        if (existing) existing.text = file.text;
        else current.push({ absPath: file.absPath, refPath: file.absPath, text: file.text });
      }
    },
    reload: async () => {},
    download: () => {},
    openExternal: async () => {},
    preferences: {
      read: async () => preferences,
      write: async (update: Preferences) => {
        preferences = { ...preferences, ...update, version: CURRENT_SETTINGS_VERSION };
        return preferences;
      },
    },
  };
}
