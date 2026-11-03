import { homeDir } from "@tauri-apps/api/path";
import { open } from "@tauri-apps/plugin-dialog";
import { openPath, openUrl } from "@tauri-apps/plugin-opener";
import {
  BaseDirectory,
  copyFile,
  exists,
  mkdir,
  readDir,
  readTextFile,
  remove,
  writeTextFile,
} from "@tauri-apps/plugin-fs";
import { Command } from "@tauri-apps/plugin-shell";

import { downloadFiles } from "./download";
import { resolvePath, sourcePaths } from "./paths";
import type { ConfigHost, PendingFile, Preferences, RawConfigFile } from "./types";

const CONFIG_DIR = ".config/mango";
const SETTINGS_FILE = ".config/mango/.settings";
const CURRENT_SETTINGS_VERSION = "0.1.1";

async function read(path: string): Promise<string | null> {
  try {
    return await readTextFile(path);
  } catch {
    return null;
  }
}

async function write(path: string, text: string): Promise<boolean> {
  try {
    const directory = path.slice(0, path.lastIndexOf("/"));
    await mkdir(directory, { recursive: true });
    await writeTextFile(path, text);
    return true;
  } catch {
    return false;
  }
}

async function resolveSourcePath(source: string, directory: string): Promise<string> {
  const value = source.trim();

  if (value.startsWith("~/")) {
    const home = await homeDir();
    return `${home}${value.slice(1)}`;
  }
  if (value.startsWith("/")) return value;
  return resolvePath(directory, value);
}

async function readTree(
  rootPath: string,
  refPath: string,
  rootText: string,
): Promise<RawConfigFile[]> {
  const seen = new Set<string>();
  const result: RawConfigFile[] = [];

  async function readOne(absPath: string, ref: string, text: string): Promise<void> {
    if (seen.has(absPath)) return;
    seen.add(absPath);

    const directory = absPath.slice(0, absPath.lastIndexOf("/"));
    result.push({ absPath, refPath: ref, text });

    for (const source of sourcePaths(text)) {
      const childPath = await resolveSourcePath(source, directory);
      const childText = await read(childPath);
      if (childText !== null) await readOne(childPath, source, childText);
    }
  }

  await readOne(rootPath, refPath, rootText);
  return result;
}

async function readPreferences(): Promise<Preferences> {
  try {
    const text = await readTextFile(SETTINGS_FILE, { baseDir: BaseDirectory.Home });
    return { version: CURRENT_SETTINGS_VERSION, ...JSON.parse(text) };
  } catch {
    return { version: CURRENT_SETTINGS_VERSION };
  }
}

async function writePreferences(update: Preferences): Promise<Preferences> {
  const current = await readPreferences();
  const merged = {
    ...current,
    ...update,
    version: current.version ?? CURRENT_SETTINGS_VERSION,
  };

  await mkdir(CONFIG_DIR, { baseDir: BaseDirectory.Home, recursive: true });
  await writeTextFile(SETTINGS_FILE, JSON.stringify(merged, null, 2), {
    baseDir: BaseDirectory.Home,
  });

  return merged;
}

async function copyRecursive(relativePath: string, destination: string): Promise<void> {
  const source = relativePath ? resolvePath(CONFIG_DIR, relativePath) : CONFIG_DIR;
  const entries = await readDir(source, { baseDir: BaseDirectory.Home });

  for (const entry of entries) {
    if (entry.name === "backups") continue;

    const child = relativePath ? `${relativePath}/${entry.name}` : entry.name;
    const childSource = resolvePath(CONFIG_DIR, child);
    const childDestination = resolvePath(destination, child);

    if (entry.isDirectory) {
      await mkdir(childDestination, { baseDir: BaseDirectory.Home, recursive: true });
      await copyRecursive(child, destination);
    } else {
      await copyFile(childSource, childDestination, {
        fromPathBaseDir: BaseDirectory.Home,
        toPathBaseDir: BaseDirectory.Home,
      });
    }
  }
}

function timestamp(): string {
  const now = new Date();
  const pad = (value: number) => value.toString().padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(
    now.getHours(),
  )}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
}

export function createTauriHost(defaultConfig: string): ConfigHost {
  async function load(): Promise<RawConfigFile[]> {
    const home = await homeDir().catch(() => null);
    if (!home) return [];

    const confPath = `${home}/${CONFIG_DIR}/config.conf`;
    const tomlPath = `${home}/${CONFIG_DIR}/config.toml`;

    let rootText = await read(confPath);
    let actualRootPath = confPath;

    if (rootText === null) {
      rootText = await read(tomlPath);
      if (rootText !== null) actualRootPath = tomlPath;
    }

    if (rootText === null) {
      const fallbackPath = "/etc/mango/config.conf";
      rootText = await read(fallbackPath);
      if (rootText !== null) actualRootPath = fallbackPath;
    }

    if (rootText === null) return [];
    return readTree(
      actualRootPath,
      actualRootPath.slice(actualRootPath.lastIndexOf("/") + 1),
      rootText,
    );
  }

  async function createDefault(): Promise<RawConfigFile[]> {
    const home = await homeDir();
    const rootPath = `${home}/${CONFIG_DIR}/config.conf`;
    const written = await write(rootPath, defaultConfig);
    if (!written) throw new Error("Failed to write the default configuration");
    return readTree(rootPath, "config.conf", defaultConfig);
  }

  async function importConfig(): Promise<RawConfigFile[] | null> {
    const selected = await open({
      directory: true,
      multiple: false,
      title: "Import mango configuration",
    });

    if (typeof selected !== "string") return null;

    const directory = selected.replace(/\/$/, "");
    const entries = await readDir(directory);
    const candidates = entries.filter(
      (entry) => !entry.isDirectory && /\.(conf|toml)$/.test(entry.name),
    );
    const root =
      candidates.find((entry) => entry.name === "config.conf") ??
      candidates.find((entry) => entry.name === "config.toml") ??
      candidates.find((entry) => entry.name === "mango.conf") ??
      candidates[0];

    if (!root) return [];

    const rootPath = `${directory}/${root.name}`;
    const text = await read(rootPath);
    if (text === null) return [];
    return readTree(rootPath, root.name, text);
  }

  async function save(files: PendingFile[]): Promise<void> {
    for (const file of files) {
      if (!file.absPath.startsWith("/")) continue;
      const directory = file.absPath.slice(0, file.absPath.lastIndexOf("/"));
      await mkdir(directory, { recursive: true });
      await writeTextFile(file.absPath, file.text);
    }
  }

  async function reload(): Promise<void> {
    const output = await Command.create("mmsg", ["dispatch", "reload_config"]).execute();
    if (output.code !== 0) {
      throw new Error(output.stderr || "mmsg dispatch reload_config failed");
    }
  }

  return {
    kind: "tauri",
    hasConfig: () => exists(CONFIG_DIR, { baseDir: BaseDirectory.Home }),
    load,
    createDefault,
    importConfig,
    save,
    reload,
    download: downloadFiles,
    openExternal: openUrl,
    openConfigFolder: async () => {
      const home = await homeDir();
      const directory = `${home}/${CONFIG_DIR}`;
      await mkdir(directory, { recursive: true });
      await openPath(directory);
    },
    remove: async (path: string) => {
      await remove(path);
    },
    backup: async () => {
      const destination = `${CONFIG_DIR}/backups/${timestamp()}`;
      await mkdir(destination, { baseDir: BaseDirectory.Home, recursive: true });
      await copyRecursive("", destination);
      return destination;
    },
    preferences: { read: readPreferences, write: writePreferences },
  };
}
