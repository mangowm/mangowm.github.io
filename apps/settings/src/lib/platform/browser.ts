import { downloadFiles } from "./download";
import type { ConfigHost, PendingFile, Preferences, RawConfigFile } from "./types";

const PREFERENCES_KEY = "mangowm.settings";
const CONFIG_KEY = "mangowm.config";
const CURRENT_SETTINGS_VERSION = "0.1.1";

interface FileHandle {
  kind: "file";
  name: string;
  getFile(): Promise<File>;
}

interface DirectoryHandle {
  kind: "directory";
  name: string;
  values(): AsyncIterableIterator<FileHandle | DirectoryHandle>;
}

type PickerWindow = Window & {
  showDirectoryPicker?: () => Promise<DirectoryHandle>;
};

function readPreferences(): Preferences {
  try {
    const value = localStorage.getItem(PREFERENCES_KEY);
    return value
      ? { version: CURRENT_SETTINGS_VERSION, ...JSON.parse(value) }
      : { version: CURRENT_SETTINGS_VERSION };
  } catch {
    return { version: CURRENT_SETTINGS_VERSION };
  }
}

function writePreferences(update: Preferences): Preferences {
  const merged = {
    ...readPreferences(),
    ...update,
    version: CURRENT_SETTINGS_VERSION,
  };

  try {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(merged));
  } catch {
    // Storage can be unavailable in private windows.
  }

  return merged;
}

function readStoredFiles(): RawConfigFile[] {
  try {
    const value = localStorage.getItem(CONFIG_KEY);
    return value ? JSON.parse(value) : [];
  } catch {
    return [];
  }
}

function writeStoredFiles(files: RawConfigFile[]): void {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(files));
  } catch {
    // Storage can be unavailable in private windows.
  }
}

async function readDirectory(handle: DirectoryHandle, prefix = ""): Promise<RawConfigFile[]> {
  const files: RawConfigFile[] = [];

  for await (const entry of handle.values()) {
    if (entry.kind === "directory") {
      files.push(...(await readDirectory(entry, `${prefix}${entry.name}/`)));
      continue;
    }

    if (!/\.(conf|toml)$/.test(entry.name)) continue;

    const file = await entry.getFile();
    files.push({
      absPath: `${prefix}${entry.name}`,
      refPath: `${prefix}${entry.name}`,
      text: await file.text(),
    });
  }

  return files;
}

export function createBrowserHost(defaultConfig: string): ConfigHost {
  return {
    kind: "browser",
    hasConfig: async () => readStoredFiles().length > 0,
    load: async () => readStoredFiles(),
    createDefault: async () => {
      const files = [{ absPath: "config.conf", refPath: "config.conf", text: defaultConfig }];
      writeStoredFiles(files);
      return files;
    },
    importConfig: async () => {
      const picker = (window as PickerWindow).showDirectoryPicker;
      if (!picker) throw new Error("Folder import is not supported in this browser");
      const files = await readDirectory(await picker());
      writeStoredFiles(files);
      return files;
    },
    save: async (files: PendingFile[]) => {
      const raw = files.map((file) => ({
        absPath: file.absPath,
        refPath: file.absPath,
        text: file.text,
      }));
      writeStoredFiles(raw);
      downloadFiles(raw);
    },
    reload: async () => {},
    download: downloadFiles,
    openExternal: async (url: string) => {
      window.open(url, "_blank", "noopener,noreferrer");
    },
    preferences: {
      read: async () => readPreferences(),
      write: async (update: Preferences) => writePreferences(update),
    },
  };
}
