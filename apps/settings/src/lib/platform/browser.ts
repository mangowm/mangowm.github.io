import { downloadFiles } from "./download";
import { uploadConfigFromDir } from "./upload";
import type { ConfigHost, PendingFile, Preferences, RawConfigFile } from "./types";

const PREFERENCES_KEY = "mangowm.settings";
const CONFIG_KEY = "mangowm.config";
const CURRENT_SETTINGS_VERSION = "0.1.1";

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

// Chromium blocks ~/.config and its contents in showDirectoryPicker(), so use
// a directory input instead.
function pickDirectory(): Promise<File[] | null> {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.webkitdirectory = true;
    input.hidden = true;

    const done = (files: File[] | null) => {
      input.remove();
      resolve(files);
    };

    input.addEventListener("change", () => done([...(input.files ?? [])]), { once: true });
    input.addEventListener("cancel", () => done(null), { once: true });

    document.body.append(input);

    try {
      input.showPicker();
    } catch (error) {
      input.remove();
      reject(error);
    }
  });
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
      const selected = await pickDirectory();
      if (!selected) return null;

      const files = await uploadConfigFromDir(selected);
      if (files.length === 0) throw new Error("No mango config files found in that folder");

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
    remove: async () => {},
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
