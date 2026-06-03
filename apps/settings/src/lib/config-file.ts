import { readTextFile, writeTextFile, mkdir } from "@tauri-apps/plugin-fs";
import { homeDir } from "@tauri-apps/api/path";
import { Command } from "@tauri-apps/plugin-shell";
import { parseConfig, serializeConfig } from "./config-parse";
import type { SourceFile } from "./config-types";

const CONFIG_DIR = ".config/mango";
const CONFIG_FILE = `${CONFIG_DIR}/config.conf`;

async function resolveSourcePath(sourcePath: string, fileDir: string): Promise<string> {
  const p = sourcePath.trim();
  if (p.startsWith("~/")) return (await homeDir()) + p.slice(1);
  if (p.startsWith("/")) return p;
  return `${fileDir}/${p}`;
}

async function readFileText(absPath: string): Promise<string | null> {
  try {
    return await readTextFile(absPath);
  } catch {
    return null;
  }
}

async function writeFileText(absPath: string, text: string): Promise<void> {
  const dir = absPath.slice(0, absPath.lastIndexOf("/"));
  await mkdir(dir, { recursive: true });
  await writeTextFile(absPath, text);
}

/**
 * Reads root config.conf and follows source= directives depth-first.
 * Deduplicates by absolute path to handle circular includes.
 * Returns files in order: root first, then sourced children as encountered.
 */
export async function readAllConfigFiles(): Promise<SourceFile[]> {
  const home = await homeDir();
  const rootPath = `${home}/${CONFIG_FILE}`;
  const rootText = await readFileText(rootPath);

  // If no config file exists yet, return a single placeholder entry so
  // store mutators (addEntry, setValue, etc.) always have a target file.
  if (rootText === null) {
    return [
      {
        absPath: rootPath,
        refPath: "config.conf",
        lines: [],
      },
    ];
  }

  const seen: Set<string> = new Set();
  const result: SourceFile[] = [];

  async function readOne(absPath: string, refPath: string, text: string): Promise<void> {
    if (seen.has(absPath)) return;
    seen.add(absPath);

    const parsed = parseConfig(text);
    const fileDir = absPath.slice(0, absPath.lastIndexOf("/"));

    result.push({ absPath, refPath, lines: parsed.lines });

    for (const srcRef of parsed.data["source"] ?? []) {
      const childPath = await resolveSourcePath(srcRef, fileDir);
      const childText = await readFileText(childPath);
      if (childText !== null) await readOne(childPath, srcRef, childText);
    }
  }

  await readOne(rootPath, "config.conf", rootText);
  return result;
}

export async function writeAllConfigFiles(files: SourceFile[]): Promise<void> {
  for (const file of files) {
    const text = serializeConfig(file.lines);
    await writeFileText(file.absPath, text);
  }
}

export async function reloadMango(): Promise<void> {
  const out = await Command.create("mmsg", ["dispatch", "reload_config"]).execute();
  if (out.code !== 0) {
    throw new Error(out.stderr || "mmsg dispatch reload_config failed");
  }
}
