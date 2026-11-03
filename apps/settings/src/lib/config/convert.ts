import {
  normalize,
  serializeConf,
  serializeToml,
  type CanonicalConfig,
  type ConfigDocument,
} from "@mangowm.github.io/config";

import { detectFormat, formatDocument, parseDocument } from "./parse";
import type { FileFormat, SourceFile } from "./types";

/** Swap the config extension for the target format. */
export function convertName(name: string, target: FileFormat): string {
  return name.replace(/\.(conf|toml)$/i, target === "toml" ? ".toml" : ".conf");
}

function rewriteSources(config: CanonicalConfig, target: FileFormat): CanonicalConfig {
  const global = config.global;
  if (!global) return config;

  const next = { ...global };
  for (const key of ["source", "source_optional"]) {
    const value = next[key];
    if (!Array.isArray(value)) continue;
    next[key] = value.map((item) =>
      typeof item === "string" ? convertName(item, target) : item,
    ) as string[];
  }

  return { ...config, global: next };
}

export function convertDocument(document: ConfigDocument, target: FileFormat): string {
  if (document.format === target) return formatDocument(document);

  const { config } = normalize(document);
  const rewritten = rewriteSources(config, target);
  return target === "toml" ? serializeToml(rewritten) : serializeConf(rewritten);
}

export function convertFile(file: SourceFile, target: FileFormat): string {
  return convertDocument(file.document, target);
}

export function convertText(text: string, format: FileFormat, target: FileFormat): string {
  if (format === target) return text;
  return convertDocument(parseDocument(text, format), target);
}

export function convertOriginal(file: SourceFile, target: FileFormat): string {
  return convertText(file.original, detectFormat(file.absPath, file.original), target);
}
