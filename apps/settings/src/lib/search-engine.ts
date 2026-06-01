import MiniSearch from "minisearch";
import { useRef, useCallback } from "react";
import { useConfigStore } from "./config-store";
import { SECTIONS } from "./sections";
import type { ConfigData } from "./config-types";
import type { DynamicIndexSource, DynamicSearchItem } from "./section-types";

interface SearchDocument {
  id: string;
  label: string;
  description: string;
  configKey: string;
  sectionKeywords: string;
  aliases: string;
  sectionId: string;
  sectionLabel: string;
  tier: "static" | "dynamic";
  runtimeValue?: string;
}

const ms = new MiniSearch<SearchDocument>({
  fields: ["label", "description", "configKey", "sectionKeywords", "aliases", "runtimeValue"],
  storeFields: [
    "id",
    "label",
    "description",
    "configKey",
    "sectionId",
    "sectionLabel",
    "tier",
    "runtimeValue",
  ],
  searchOptions: {
    fuzzy: 0.2,
    prefix: true,
    boost: { label: 3, configKey: 2, description: 1.5, aliases: 1.2 },
    combineWith: "OR",
  },
});

const staticDocs: SearchDocument[] = SECTIONS.flatMap((section) => {
  const sectionKeywords = section.keywords?.join(" ") ?? "";
  const docs: SearchDocument[] = [];

  docs.push({
    id: `s:${section.id}:__section__`,
    label: section.label,
    description: "",
    configKey: "",
    sectionKeywords,
    aliases: "",
    sectionId: section.id,
    sectionLabel: section.label,
    tier: "static",
  });

  for (const field of section.fields ?? []) {
    docs.push({
      id: `s:${section.id}:${field.configKey}`,
      label: field.label,
      description: field.description ?? "",
      configKey: field.configKey,
      sectionKeywords,
      aliases: field.aliases?.join(" ") ?? "",
      sectionId: section.id,
      sectionLabel: section.label,
      tier: "static",
    });
  }

  return docs;
});

ms.addAll(staticDocs);

export const DYNAMIC_SOURCES: DynamicIndexSource[] = [
  {
    sourceId: "exec-once",
    watchKeys: ["exec-once"],
    buildItems: (data) =>
      (data["exec-once"] ?? []).map((cmd, i) => ({
        id: `exec-once:${i}`,
        label: cmd,
        description: "Runs once on compositor launch",
        sectionLabel: "Autostart",
        sectionId: "autostart",
        configKey: "exec-once",
      })),
  },
  {
    sourceId: "exec",
    watchKeys: ["exec"],
    buildItems: (data) =>
      (data["exec"] ?? []).map((cmd, i) => ({
        id: `exec:${i}`,
        label: cmd,
        description: "Runs on every config reload",
        sectionLabel: "Autostart",
        sectionId: "autostart",
        configKey: "exec",
      })),
  },
  {
    sourceId: "env",
    watchKeys: ["env"],
    buildItems: (data) =>
      (data["env"] ?? []).map((raw, i) => {
        const sep = raw.indexOf(",");
        const key = sep === -1 ? raw : raw.slice(0, sep);
        const value = sep === -1 ? "" : raw.slice(sep + 1);
        return {
          id: `env:${i}`,
          label: key,
          description: value ? `= ${value}` : "Environment variable",
          sectionLabel: "Environment Variables",
          sectionId: "environment",
          configKey: "env",
        };
      }),
  },
];

const dynamicIndexed = new Map<string, string[]>(); // sourceId → current doc ids

function rebuildDynamicSource(source: DynamicIndexSource, data: ConfigData) {
  const items: DynamicSearchItem[] = source.buildItems(data);

  // Remove stale docs for this source
  const prevIds = dynamicIndexed.get(source.sourceId) ?? [];
  if (prevIds.length > 0) {
    ms.discardAll(prevIds);
  }

  // Add fresh docs
  const docs: SearchDocument[] = items.map((item) => ({
    id: item.id,
    label: item.label,
    description: item.description ?? "",
    configKey: item.configKey ?? "",
    sectionKeywords: "",
    aliases: "",
    sectionId: item.sectionId,
    sectionLabel: item.sectionLabel,
    tier: "dynamic",
    runtimeValue: item.label, // make the actual value text searchable
  }));

  ms.addAll(docs);
  dynamicIndexed.set(
    source.sourceId,
    docs.map((d) => d.id),
  );
}

export interface SearchResult {
  id: string;
  label: string;
  description: string;
  configKey: string;
  sectionId: string;
  sectionLabel: string;
  tier: "static" | "dynamic";
  runtimeValue?: string;
  /** MiniSearch relevance score */
  score: number;
}

export function useSearch(): (query: string) => SearchResult[] {
  const data = useConfigStore((s) => s.data);
  const lastData = useRef(data);

  if (data !== lastData.current) {
    lastData.current = data;
    for (const source of DYNAMIC_SOURCES) {
      const hasData = source.watchKeys.some((k) => (data[k]?.length ?? 0) > 0);
      if (hasData || (dynamicIndexed.get(source.sourceId)?.length ?? 0) > 0) {
        rebuildDynamicSource(source, data);
      }
    }
  }

  return useCallback((query: string): SearchResult[] => {
    if (!query.trim()) return [];

    return ms.search(query).map((r) => ({
      id: r.id as string,
      label: r.label as string,
      description: r.description as string,
      configKey: r.configKey as string,
      sectionId: r.sectionId as string,
      sectionLabel: r.sectionLabel as string,
      tier: r.tier as "static" | "dynamic",
      runtimeValue: r.runtimeValue as string | undefined,
      score: r.score,
    }));
  }, []);
}
