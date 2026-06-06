import { readTextFile } from "@tauri-apps/plugin-fs";
import { BaseDirectory } from "@tauri-apps/api/path";
import { updateSettings } from "./settings";

const SETTINGS = ".config/mango/.settings";
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
  await updateSettings({ onboardingCompleted: true });
}
