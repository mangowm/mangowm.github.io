// ---------------------------------------------------------------------------
// config-file.ts
// All filesystem and shell I/O for the mango config system.
// Nothing in here knows about the Zustand store or the UI.
// ---------------------------------------------------------------------------

import { readTextFile, writeTextFile, mkdir } from "@tauri-apps/plugin-fs";
import { homeDir } from "@tauri-apps/api/path";
import { Command } from "@tauri-apps/plugin-shell";
import { parseConfig, serializeConfig } from "./config-parse";
import type { SourceFile } from "./config-types";

const CONFIG_DIR = ".config/mango";
const CONFIG_FILE = `${CONFIG_DIR}/config.conf`;

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

async function getHomePath(): Promise<string> {
  return homeDir();
}

async function resolveSourcePath(sourcePath: string, fileDir: string): Promise<string> {
  const p = sourcePath.trim();

  if (p.startsWith("~/")) {
    return (await getHomePath()) + p.slice(1); // ~/foo → /home/user/foo
  }

  if (p.startsWith("/")) {
    return p; // already absolute
  }

  return `${fileDir}/${p}`; // relative to the file that contains the source= line
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

// ---------------------------------------------------------------------------
// Recursive config reader
//
// Reads the root config.conf and follows every source= directive it finds,
// depth-first, deduplicating by absolute path to handle circular includes.
//
// The returned array is ordered: root file first, then sourced children in
// the order they were encountered. Each SourceFile is independent — merging
// is the store's responsibility.
// ---------------------------------------------------------------------------

export async function readAllConfigFiles(): Promise<SourceFile[]> {
  const home = await getHomePath();
  const rootPath = `${home}/${CONFIG_FILE}`;
  const rootText = await readFileText(rootPath);

  if (rootText === null) return [];

  const seen: Set<string> = new Set();
  const result: SourceFile[] = [];

  async function readOne(absPath: string, refPath: string, text: string): Promise<void> {
    if (seen.has(absPath)) return;
    seen.add(absPath);

    const parsed = parseConfig(text);
    const fileDir = absPath.slice(0, absPath.lastIndexOf("/"));

    const file: SourceFile = {
      absPath,
      refPath,
      lines: parsed.lines,
      data: parsed.data,
    };

    result.push(file);

    // Follow source= directives in the order they appear.
    for (const srcRef of parsed.data["source"] ?? []) {
      const childPath = await resolveSourcePath(srcRef, fileDir);
      const childText = await readFileText(childPath);
      if (childText !== null) {
        await readOne(childPath, srcRef, childText);
      }
    }
  }

  await readOne(rootPath, "config.conf", rootText);

  return result;
}

// ---------------------------------------------------------------------------
// Writer
// ---------------------------------------------------------------------------

/**
 * Writes every SourceFile back to disk.
 * Each file is serialized from its own data+lines, so only that file's
 * entries are written to that file path.
 */
export async function writeAllConfigFiles(files: SourceFile[]): Promise<void> {
  for (const file of files) {
    const text = serializeConfig({ data: file.data, lines: file.lines });
    await writeFileText(file.absPath, text);
  }
}

// ---------------------------------------------------------------------------
// Reload
// ---------------------------------------------------------------------------

/** Sends a live reload signal to the running mango compositor. */
export async function reloadMango(): Promise<void> {
  const out = await Command.create("mmsg", ["dispatch", "reload_config"]).execute();
  if (out.code !== 0) {
    throw new Error(out.stderr || "mmsg dispatch reload_config failed");
  }
}

// ---------------------------------------------------------------------------
// Utility — exposed for display purposes only (e.g. PageHeader, status bar)
// ---------------------------------------------------------------------------

export async function getConfigFilePath(): Promise<string> {
  return `${await getHomePath()}/${CONFIG_FILE}`;
}
