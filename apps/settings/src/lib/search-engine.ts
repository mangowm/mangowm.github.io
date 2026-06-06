import MiniSearch from "minisearch";
import { useRef, useCallback } from "react";
import { useConfigStore } from "./config-store";
import { SECTIONS } from "./sections";
import type { ConfigData } from "./config-types";
import type { DynamicIndexSource, DynamicSearchItem } from "./section-types";
import { parseKeybindings, ALL_BIND_VARIANTS } from "./keybind-parse";
import { DISPATCHER_MAP } from "./dispatchers";
import { getOverridesForRuleType, RULE_LABELS } from "./rules/metadata";
import { parseRuleString } from "@/lib/rules/parser";

interface SearchDocument {
  id: string;
  label: string;
  description: string;
  configKey: string;
  sectionKeywords: string;
  aliases: string;
  sectionLabel: string;
  sectionId: string;
  tier: "static" | "dynamic";
  runtimeValue?: string;
}

const ms = new MiniSearch<SearchDocument>({
  fields: ["label", "description", "configKey", "sectionKeywords", "aliases", "sectionLabel"],
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
    boost: {
      label: 4,
      configKey: 3,
      sectionLabel: 2,
      description: 1.2,
      aliases: 1.2,
      sectionKeywords: 0.6,
    },
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

const DYNAMIC_SOURCES: DynamicIndexSource[] = [
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
  {
    sourceId: "bindings",
    watchKeys: [...ALL_BIND_VARIANTS, "mousebind", "axisbind", "switchbind", "gesturebind"],
    buildItems: (data) =>
      parseKeybindings(data).map((b, i) => {
        const prefix = b.type === "keyboard" ? "keybind" : b.type;
        return {
          id: `${prefix}:${i}`,
          label: `${b.func} (${b.type === "switch" ? b.key : `${b.mods || "none"} + ${b.key}`})`,
          description: DISPATCHER_MAP.get(b.func)?.description ?? b.func,
          sectionLabel: "Bindings",
          sectionId: "bindings",
          configKey: b.id,
        };
      }),
  },

  ...buildRuleDynamicSources("windowrule", "window-rules"),
  ...buildRuleDynamicSources("monitorrule", "monitor-rules"),
  ...buildRuleDynamicSources("tagrule", "tag-rules"),
  ...buildRuleDynamicSources("layerrule", "layer-rules"),
];

/**
 * Each rule type gets TWO dynamic sources:
 * 1. One indexes the rule's matching criteria so searching "foot" finds the rule
 * 2. One indexes individual override entries so searching "floating" finds the rule
 */
function buildRuleDynamicSources(
  ruleType: "windowrule" | "monitorrule" | "tagrule" | "layerrule",
  sectionId: string,
): DynamicIndexSource[] {
  const sectionLabel = RULE_LABELS[ruleType];
  return [
    {
      sourceId: `${ruleType}-matchers`,
      watchKeys: [ruleType],
      buildItems: (data) =>
        (data[ruleType] ?? []).flatMap((raw, ruleIdx) => {
          const parsed = parseRuleString(ruleType, raw);
          const items: DynamicSearchItem[] = [];
          for (const [key, val] of Object.entries(parsed.matchers)) {
            if (val?.trim()) {
              items.push({
                id: `${ruleType}:${ruleIdx}:matcher:${key}`,
                label: val,
                description: `${key} matches "${val}"`,
                sectionLabel,
                sectionId,
                configKey: ruleType,
              });
            }
          }
          return items;
        }),
    },
    {
      sourceId: `${ruleType}-overrides`,
      watchKeys: [ruleType],
      buildItems: (data) =>
        (data[ruleType] ?? []).flatMap((raw, ruleIdx) => {
          const parsed = parseRuleString(ruleType, raw);
          const overridesMeta = getOverridesForRuleType(ruleType);
          const metaMap = new Map(overridesMeta.map((m) => [m.key, m]));
          return Object.entries(parsed.overrides).map(([key, val]) => {
            const meta = metaMap.get(key);
            return {
              id: `${ruleType}:${ruleIdx}:override:${key}`,
              label: meta?.label ?? key,
              description: `Rule #${ruleIdx + 1}: ${key} = ${val}`,
              sectionLabel,
              sectionId,
              configKey: ruleType,
            };
          });
        }),
    },
  ];
}

const dynamicIndexed = new Map<string, string[]>(); // sourceId → current doc ids

function getSectionKeywords(sectionId: string): string {
  for (const section of SECTIONS) {
    if (section.id === sectionId) {
      return section.keywords?.join(" ") ?? "";
    }
  }
  return "";
}

function rebuildDynamicSource(source: DynamicIndexSource, data: ConfigData) {
  const items: DynamicSearchItem[] = source.buildItems(data);

  const prevIds = dynamicIndexed.get(source.sourceId) ?? [];
  if (prevIds.length > 0) {
    ms.discardAll(prevIds);
  }

  const sectionKeywords = getSectionKeywords(items[0]?.sectionId ?? "");

  const docs: SearchDocument[] = items.map((item) => ({
    id: item.id,
    label: item.label,
    description: item.description ?? "",
    configKey: item.configKey ?? "",
    sectionKeywords,
    aliases: "",
    sectionId: item.sectionId,
    sectionLabel: item.sectionLabel,
    tier: "dynamic",
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
  score: number;
}

function search(query: string): SearchResult[] {
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
}

export function useSearch(): (query: string) => SearchResult[] {
  const data = useConfigStore((s) => s.data);
  const lastData = useRef(data);
  const lastValues = useRef<Map<string, string>>(new Map());

  if (data !== lastData.current) {
    lastData.current = data;
    for (const source of DYNAMIC_SOURCES) {
      let changed = false;
      for (const key of source.watchKeys) {
        const serialized = JSON.stringify(data[key] ?? []);
        if (lastValues.current.get(key) !== serialized) {
          lastValues.current.set(key, serialized);
          changed = true;
        }
      }
      if (changed) {
        rebuildDynamicSource(source, data);
      }
    }
  }

  return useCallback((query: string): SearchResult[] => search(query), []);
}
