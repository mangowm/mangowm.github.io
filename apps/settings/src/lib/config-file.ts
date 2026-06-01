import { readTextFile, writeTextFile, mkdir } from "@tauri-apps/plugin-fs";
import { BaseDirectory, homeDir } from "@tauri-apps/api/path";
import { Command } from "@tauri-apps/plugin-shell";
import { parseConfig, serializeConfig } from "./config-parse";
import type { SourceFile } from "./config-types";

const BD = BaseDirectory.Home;
const CONFIG_DIR = ".config/mango";
const CONFIG_FILE = `${CONFIG_DIR}/config.conf`;

export async function readConfigFile(): Promise<string | null> {
  try {
    return await readTextFile(CONFIG_FILE, { baseDir: BD });
  } catch {
    return null;
  }
}

export async function reloadMango(): Promise<void> {
  const cmd = Command.create("mmsg", ["dispatch", "reload_config"]);
  const out = await cmd.execute();
  if (out.code !== 0) {
    throw new Error(out.stderr || "mmsg failed");
  }
}

export async function getConfigFilePath(): Promise<string> {
  const home = await homeDir();
  return `${home}/${CONFIG_FILE}`;
}

export async function resolveSourcePath(sourcePath: string, baseDir?: string): Promise<string> {
  let resolved = sourcePath.trim();

  if (resolved.startsWith("~/")) {
    const home = await homeDir();
    resolved = home + resolved.slice(1);
  }

  if (resolved.startsWith("/")) {
    return resolved;
  }

  const dir = baseDir ?? `${await homeDir()}/${CONFIG_DIR}`;
  return `${dir}/${resolved}`;
}

export async function readAllConfigFiles(): Promise<SourceFile[]> {
  const mainPath = await getConfigFilePath();
  const files: SourceFile[] = [];
  const seen = new Set<string>();

  async function readOne(
    absPath: string,
    refPath: string,
    preloadedText?: string,
  ): Promise<SourceFile | null> {
    if (seen.has(absPath)) return null;
    seen.add(absPath);

    try {
      const text = preloadedText ?? (await readTextFile(absPath));
      const parsed = parseConfig(text);

      const file: SourceFile = {
        absPath,
        refPath,
        lines: parsed.lines,
        data: parsed.data,
      };

      const sourceValues = parsed.data["source"];
      if (sourceValues) {
        const fileDir = absPath.substring(0, absPath.lastIndexOf("/"));
        for (const srcPath of sourceValues) {
          const childAbs = await resolveSourcePath(srcPath, fileDir);
          const child = await readOne(childAbs, srcPath);
          if (child) {
            files.push(child);
          }
        }
      }

      return file;
    } catch {
      return null;
    }
  }

  const mainText = await readConfigFile();
  if (mainText === null) return [];

  const main = await readOne(mainPath, "config.conf", mainText);
  if (main) {
    files.unshift(main);
  }

  return files;
}

async function writeOneFile(absPath: string, text: string): Promise<void> {
  const dir = absPath.substring(0, absPath.lastIndexOf("/"));
  await mkdir(dir, { recursive: true });
  await writeTextFile(absPath, text);
}

/**
 * Write each file back to disk using its own lines as template
 * and its own data as values.
 */
export async function writeAllConfigFiles(files: SourceFile[]): Promise<void> {
  for (const file of files) {
    const text = serializeConfig({ data: file.data, lines: file.lines });
    await writeOneFile(file.absPath, text);
  }
}
