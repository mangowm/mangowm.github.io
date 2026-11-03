import { resolvePath, sourcePaths } from "./paths";
import type { RawConfigFile } from "./types";

function matchUploadedFile(
  contents: Map<string, Promise<string>>,
  path: string,
): string | undefined {
  if (contents.has(path)) return path;

  const parts = path.split("/");
  for (let index = 1; index < parts.length; index++) {
    const suffix = parts.slice(index).join("/");
    if (contents.has(suffix)) return suffix;
  }

  return undefined;
}

/** Read a dropped or selected config directory in the browser. */
export async function uploadConfigFromDir(files: File[]): Promise<RawConfigFile[]> {
  const contents = new Map<string, Promise<string>>();

  for (const file of files) {
    const path = file.webkitRelativePath;
    const separator = path.indexOf("/");
    if (separator < 0) continue;

    const relativePath = resolvePath("", path.slice(separator + 1));
    if (!relativePath.endsWith(".conf")) continue;

    contents.set(relativePath, file.text());
  }

  if (contents.size === 0) return [];

  const root = contents.has("config.conf") ? "config.conf" : (contents.keys().next().value ?? "");
  const result: RawConfigFile[] = [];
  const seen = new Set<string>();

  async function read(relativePath: string): Promise<void> {
    const normalPath = resolvePath("", relativePath);
    if (seen.has(normalPath)) return;
    seen.add(normalPath);

    const key = matchUploadedFile(contents, normalPath);
    if (!key) return;

    const text = await contents.get(key)!;
    const directory = key.includes("/") ? key.slice(0, key.lastIndexOf("/")) : "";

    result.push({ absPath: key, refPath: key, text });

    for (const source of sourcePaths(text)) {
      const resolvedPath =
        source.startsWith("/") || source.startsWith("~/")
          ? resolvePath("", source)
          : resolvePath(directory, source);
      const sourceKey = matchUploadedFile(contents, resolvedPath);
      if (sourceKey) await read(sourceKey);
    }
  }

  await read(root);
  return result;
}
