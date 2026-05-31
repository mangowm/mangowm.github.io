import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { BaseDirectory } from "@tauri-apps/api/path";

export const SETTINGS = ".config/mango/.settings";
const BD = BaseDirectory.Home;

export async function isOnboardingCompleted(): Promise<boolean> {
  try {
    const content = await readTextFile(SETTINGS, { baseDir: BD });
    return !!JSON.parse(content).onboardingCompleted;
  } catch {
    return false;
  }
}

export async function completeOnboarding() {
  try {
    const existing = await readTextFile(SETTINGS, { baseDir: BD });
    const data = JSON.parse(existing);
    data.onboardingCompleted = true;
    await writeTextFile(SETTINGS, JSON.stringify(data, null, 2), { baseDir: BD });
  } catch {
    await writeTextFile(SETTINGS, JSON.stringify({ onboardingCompleted: true }, null, 2), {
      baseDir: BD,
    });
  }
}
