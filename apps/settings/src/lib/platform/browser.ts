import { downloadFiles } from "./download";
import type { ConfigHost, PendingFile, Preferences } from "./types";

const PREFERENCES_KEY = "mangowm.settings";
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

export function createBrowserHost(): ConfigHost {
  return {
    kind: "browser",
    hasConfig: async () => false,
    load: async () => [],
    save: async (files: PendingFile[]) => {
      downloadFiles(
        files.map((file) => ({ absPath: file.absPath, refPath: file.absPath, text: file.text })),
      );
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
