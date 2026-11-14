import { resolvePath, sourcePaths } from "./paths";
import type { RawConfigFile } from "./types";

const CONFIG_FILE = /\.(conf|toml)$/;
const ROOT_NAMES = ["config.conf", "config.toml", "mango.conf"];

function matchFile(files: Map<string, Promise<string>>, path: string): string | undefined {
  if (files.has(path)) return path;

  const parts = path.split("/");
  for (let index = 1; index < parts.length; index++) {
    const suffix = parts.slice(index).join("/");
    if (files.has(suffix)) return suffix;
  }
}

function findRoot(paths: string[]): string | undefined {
  const inMango = paths.filter((path) => path.split("/").includes("mango"));
  const candidates = inMango.length > 0 ? inMango : paths;

  for (const name of ROOT_NAMES) {
    const match = candidates.find((path) => path === name || path.endsWith(`/${name}`));
    if (match) return match;
  }

  return candidates[0];
}

export async function readConfigTree(
  files: Map<string, Promise<string>>,
): Promise<RawConfigFile[]> {
  const root = findRoot([...files.keys()]);
  if (!root) return [];

  const result: RawConfigFile[] = [];
  const seen = new Set<string>();

  async function visit(path: string, refPath: string): Promise<void> {
    const key = matchFile(files, resolvePath("", path));
    if (!key || seen.has(key)) return;
    seen.add(key);

    const text = await files.get(key)!;
    const directory = key.includes("/") ? key.slice(0, key.lastIndexOf("/")) : "";
    result.push({ absPath: key, refPath, text });

    for (const source of sourcePaths(text)) {
      const resolved =
        source.startsWith("/") || source.startsWith("~/")
          ? resolvePath("", source)
          : resolvePath(directory, source);
      await visit(resolved, source);
    }
  }

  await visit(root, root.slice(root.lastIndexOf("/") + 1));
  return result;
}

export async function uploadConfigFromDir(files: File[]): Promise<RawConfigFile[]> {
  const contents = new Map<string, Promise<string>>();

  for (const file of files) {
    const path = file.webkitRelativePath;
    const relativePath = resolvePath("", path.slice(path.indexOf("/") + 1));
    if (!CONFIG_FILE.test(relativePath)) continue;

    contents.set(relativePath, file.text());
  }

  return readConfigTree(contents);
}
