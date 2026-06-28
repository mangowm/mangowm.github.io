import { readTextFile, writeTextFile, mkdir } from "@tauri-apps/plugin-fs";
import { homeDir } from "@tauri-apps/api/path";
import { Command } from "@tauri-apps/plugin-shell";
import { zip, strToU8 } from "fflate";
import { parseConfig, serializeConfig } from "./config-parse";
import { commonAncestorDir } from "./path-utils";
import type { SourceFile } from "./config-types";
import DEFAULT_CONFIG from "./default-config";

const SYSCONFDIR = "/etc";

async function tryReadTextFile(absPath: string): Promise<string | null> {
  try {
    return await readTextFile(absPath);
  } catch {
    return null;
  }
}

async function tryWriteTextFile(absPath: string, text: string): Promise<boolean> {
  try {
    const dir = absPath.slice(0, absPath.lastIndexOf("/"));
    await mkdir(dir, { recursive: true });
    await writeTextFile(absPath, text);
    return true;
  } catch {
    return false;
  }
}

async function tryHomeDir(): Promise<string | null> {
  try {
    return await homeDir();
  } catch {
    return null;
  }
}

async function resolveSourcePath(sourcePath: string, fileDir: string): Promise<string> {
  const home = await tryHomeDir();
  const p = sourcePath.trim();
  if (p.startsWith("~/") && home) return home + p.slice(1);
  if (p.startsWith("/")) return p;
  return `${fileDir}/${p}`;
}

function makeVirtualSourceFile(text: string): SourceFile[] {
  const parsed = parseConfig(text);
  return [{ absPath: "config.conf", refPath: "config.conf", lines: parsed.lines }];
}

export async function readAllConfigFiles(): Promise<SourceFile[]> {
  const home = await tryHomeDir();

  if (home) {
    const rootPath = `${home}/.config/mango/config.conf`;
    const fallbackPath = `${SYSCONFDIR}/mango/config.conf`;

    let rootText = await tryReadTextFile(rootPath);
    let actualRootPath = rootPath;

    if (rootText === null) {
      rootText = await tryReadTextFile(fallbackPath);
      if (rootText !== null) actualRootPath = fallbackPath;
    }

    if (rootText === null) {
      const wrote = await tryWriteTextFile(rootPath, DEFAULT_CONFIG);
      rootText = wrote ? DEFAULT_CONFIG : null;
    }

    if (rootText !== null) {
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
          const childText = await tryReadTextFile(childPath);
          if (childText !== null) await readOne(childPath, srcRef, childText);
        }
      }

      await readOne(actualRootPath, "config.conf", rootText);
      return result;
    }
  }

  return makeVirtualSourceFile(DEFAULT_CONFIG);
}

export async function writeAllConfigFiles(files: SourceFile[]): Promise<void> {
  for (const file of files) {
    if (!file.absPath.startsWith("/")) continue;
    const text = serializeConfig(file.lines);
    await tryWriteTextFile(file.absPath, text);
  }
}

export async function reloadMango(): Promise<void> {
  const out = await Command.create("mmsg", ["dispatch", "reload_config"]).execute();
  if (out.code !== 0) {
    throw new Error(out.stderr || "mmsg dispatch reload_config failed");
  }
}

export function downloadConfig(files: SourceFile[]): void {
  if (files.length === 0) return;
  const allAbsolute = files.every((f) => f.absPath.startsWith("/"));

  const rootDir = allAbsolute ? commonAncestorDir(files.map((f) => f.absPath)) : "";
  const entries: Record<string, Uint8Array> = {};

  for (const file of files) {
    const relPath = allAbsolute
      ? rootDir && file.absPath.startsWith(rootDir + "/")
        ? file.absPath.slice(rootDir.length + 1)
        : file.absPath.split("/").pop()!
      : file.absPath;

    if (relPath in entries) continue;
    entries[relPath] = strToU8(serializeConfig(file.lines));
  }

  zip(entries, (err, out) => {
    if (err) {
      console.warn("Failed to create zip:", err);
      return;
    }
    const blob = new Blob([out], { type: "application/zip" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mango-config.zip";
    a.click();
    URL.revokeObjectURL(url);
  });
}

export async function uploadConfig(file: File): Promise<SourceFile[]> {
  const text = await file.text();
  return makeVirtualSourceFile(text);
}

function resolvePath(base: string, rel: string): string {
  const parts = (base ? base.split("/") : []).concat(rel.split("/"));
  const result: string[] = [];
  for (const part of parts) {
    if (part === "" || part === ".") continue;
    if (part === "..") {
      if (result.length) result.pop();
      continue;
    }
    result.push(part);
  }
  return result.join("/");
}

function matchUploadedFile(
  fileContents: Map<string, Promise<string>>,
  path: string,
): string | undefined {
  if (fileContents.has(path)) return path;

  const parts = path.split("/");
  for (let i = 1; i < parts.length; i++) {
    const suffix = parts.slice(i).join("/");
    if (fileContents.has(suffix)) return suffix;
  }

  return undefined;
}

export async function uploadConfigFromDir(files: File[]): Promise<SourceFile[]> {
  const fileContents = new Map<string, Promise<string>>();

  for (const file of files) {
    const path = file.webkitRelativePath;
    const idx = path.indexOf("/");
    if (idx < 0) continue;
    const rel = resolvePath("", path.slice(idx + 1));
    if (!rel.endsWith(".conf")) continue;
    fileContents.set(rel, file.text());
  }

  if (fileContents.size === 0) return [];

  const root = fileContents.has("config.conf") ? "config.conf" : fileContents.keys().next().value!;
  const result: SourceFile[] = [];
  const seen = new Set<string>();

  async function readOne(raw: string): Promise<void> {
    const normal = resolvePath("", raw);
    if (seen.has(normal)) return;
    seen.add(normal);

    const key = matchUploadedFile(fileContents, normal);
    if (!key) return;

    const textPromise = fileContents.get(key)!;
    const text = await textPromise;
    const parsed = parseConfig(text);
    const fileDir = key.includes("/") ? key.slice(0, key.lastIndexOf("/")) : "";

    result.push({ absPath: key, refPath: key, lines: parsed.lines });

    for (const srcRef of parsed.data["source"] ?? []) {
      const s = srcRef.trim();
      const resolved =
        s.startsWith("/") || s.startsWith("~/") ? resolvePath("", s) : resolvePath(fileDir, s);
      const srcKey = matchUploadedFile(fileContents, resolved);
      if (srcKey) await readOne(srcKey);
    }
  }

  await readOne(root);
  return result;
}
