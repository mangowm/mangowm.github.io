import { readTextFile, writeTextFile, exists, mkdir } from "@tauri-apps/plugin-fs";
import { BaseDirectory } from "@tauri-apps/api/path";

const SETTINGS_FILE = ".config/mango/.settings";
const CURRENT_SETTINGS_VERSION = "0.1.0";

export async function updateSettings(newConfig: Record<string, any>) {
  let currentSettings: Record<string, any> = { version: CURRENT_SETTINGS_VERSION };

  try {
    const fileExists = await exists(SETTINGS_FILE, { baseDir: BaseDirectory.Home });

    if (fileExists) {
      const fileContent = await readTextFile(SETTINGS_FILE, { baseDir: BaseDirectory.Home });
      currentSettings = { ...currentSettings, ...JSON.parse(fileContent) };
    } else {
      await mkdir(".config/mango", { baseDir: BaseDirectory.Home, recursive: true });
    }
  } catch (error) {
    console.warn(
      "Failed to read existing settings or create directory. Proceeding with default state.",
      error,
    );
  }

  const mergedSettings = {
    ...currentSettings,
    ...newConfig,
    version: currentSettings.version || CURRENT_SETTINGS_VERSION,
  };

  await writeTextFile(SETTINGS_FILE, JSON.stringify(mergedSettings, null, 2), {
    baseDir: BaseDirectory.Home,
  });

  return mergedSettings;
}
