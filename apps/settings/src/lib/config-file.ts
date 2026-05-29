import { readTextFile, writeTextFile, mkdir } from "@tauri-apps/plugin-fs";
import { BaseDirectory } from "@tauri-apps/api/path";
import { Command } from "@tauri-apps/plugin-shell";

const BD = BaseDirectory.Home;
const PATH = ".config/mango/config.conf";

export async function readConfigFile(): Promise<string | null> {
  try {
    return await readTextFile(PATH, { baseDir: BD });
  } catch {
    return null;
  }
}

export async function writeConfigFile(text: string): Promise<void> {
  await mkdir(".config/mango", { baseDir: BD, recursive: true });
  await writeTextFile(PATH, text, { baseDir: BD });
}

export async function reloadMango(): Promise<void> {
  const cmd = Command.create("mmsg", ["dispatch", "reload_config"]);
  const out = await cmd.execute();
  if (out.code !== 0) {
    throw new Error(out.stderr || "mmsg failed");
  }
}
