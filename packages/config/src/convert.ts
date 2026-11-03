import { annotate } from "./annotate";
import { formatConf } from "./conf";
import type { ConfigDocument } from "./document";
import { emit } from "./emit";
import { formatToml } from "./toml";
import type { CanonicalConfig, ConfigFormat } from "./types";

/** Swap a config extension for the target format. */
export function convertName(name: string, target: ConfigFormat): string {
  return name.replace(/\.(conf|toml)$/i, target === "toml" ? ".toml" : ".conf");
}

function rewriteSources(config: CanonicalConfig, target: ConfigFormat): CanonicalConfig {
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

/** Convert a document to another format, preserving placed comments where possible. */
export function convertDocument(document: ConfigDocument, target: ConfigFormat): string {
  if (document.format === target) {
    return document.format === "toml" ? formatToml(document) : formatConf(document);
  }

  const annotated = annotate(document);
  return emit({ ...annotated, canonical: rewriteSources(annotated.canonical, target) }, target);
}
