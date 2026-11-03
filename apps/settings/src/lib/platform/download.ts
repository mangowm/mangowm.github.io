import { strToU8, zip } from "fflate";

import { commonAncestorDir } from "./paths";
import type { RawConfigFile } from "./types";

export function downloadFiles(files: RawConfigFile[]): void {
  if (files.length === 0) return;

  const allAbsolute = files.every((file) => file.absPath.startsWith("/"));
  const rootDir = allAbsolute ? commonAncestorDir(files.map((file) => file.absPath)) : "";
  const entries: Record<string, Uint8Array> = {};

  for (const file of files) {
    const relativePath = allAbsolute
      ? rootDir && file.absPath.startsWith(`${rootDir}/`)
        ? file.absPath.slice(rootDir.length + 1)
        : (file.absPath.split("/").pop() ?? file.absPath)
      : file.absPath;

    if (relativePath in entries) continue;
    entries[relativePath] = strToU8(file.text);
  }

  zip(entries, (error, output) => {
    if (error) {
      console.warn("Failed to create zip:", error);
      return;
    }

    const blob = new Blob([output], { type: "application/zip" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "mango-config.zip";
    anchor.click();
    URL.revokeObjectURL(url);
  });
}
