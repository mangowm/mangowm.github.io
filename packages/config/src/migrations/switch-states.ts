import type { ConfigDocument, EntryNode } from "../document";
import { REMOVED_SWITCH_STATES } from "../schema/data/bindings";
import type { Migration, MigrationFinding } from "./types";

interface Candidate {
  nodeIndex: number;
  node: EntryNode;
  mode: string;
  trigger: string;
  normalized: string;
  replacement?: string;
}

function firstField(value: string): string {
  return value.split(",")[0]?.trim() ?? "";
}

function normalizeTrigger(trigger: string): string {
  return trigger.trim().toLowerCase().replaceAll(":", "_");
}

function collect(document: ConfigDocument): Candidate[] {
  const candidates: Candidate[] = [];
  let mode = "default";

  document.nodes.forEach((node, nodeIndex) => {
    if (node.kind !== "entry") return;

    if (document.format === "conf" && node.path[0] === "key_mode") {
      mode = node.value.trim() || "default";
      return;
    }

    if (node.path[0] !== "switchbind") return;

    if (document.format === "toml" && node.path.length < 3) return;

    const trigger =
      document.format === "toml" ? (node.path[node.path.length - 1] ?? "") : firstField(node.value);
    const normalized = normalizeTrigger(trigger);
    if (!normalized) return;

    candidates.push({
      nodeIndex,
      node,
      mode: document.format === "toml" ? (node.path[1] ?? "default") : mode,
      trigger,
      normalized,
      replacement: REMOVED_SWITCH_STATES[normalized],
    });
  });

  return candidates;
}

function countsByMode(candidates: readonly Candidate[]): Map<string, Map<string, number>> {
  const counts = new Map<string, Map<string, number>>();

  for (const candidate of candidates) {
    const byMode = counts.get(candidate.mode) ?? new Map<string, number>();
    byMode.set(candidate.normalized, (byMode.get(candidate.normalized) ?? 0) + 1);
    counts.set(candidate.mode, byMode);
  }

  return counts;
}

function count(counts: Map<string, Map<string, number>>, mode: string, trigger: string): number {
  return counts.get(mode)?.get(trigger) ?? 0;
}

function findingFor(
  candidate: Candidate,
  counts: Map<string, Map<string, number>>,
): MigrationFinding | null {
  if (!candidate.replacement) return null;

  const same = count(counts, candidate.mode, candidate.normalized);
  const target = count(counts, candidate.mode, candidate.replacement);

  if (same > 1) {
    return {
      migrationId: "switch-states",
      line: candidate.node.at.line,
      message: `Multiple "${candidate.trigger}" bindings in mode "${candidate.mode}"; resolve manually.`,
      before: candidate.trigger,
      after: candidate.replacement,
      fixable: false,
    };
  }

  if (target > 0) {
    return {
      migrationId: "switch-states",
      line: candidate.node.at.line,
      message: `Both "${candidate.trigger}" and "${candidate.replacement}" exist in mode "${candidate.mode}"; resolve manually.`,
      before: candidate.trigger,
      after: candidate.replacement,
      fixable: false,
    };
  }

  return {
    migrationId: "switch-states",
    line: candidate.node.at.line,
    message: `Replace "${candidate.trigger}" with "${candidate.replacement}".`,
    before: candidate.trigger,
    after: candidate.replacement,
    fixable: true,
  };
}

function rewriteConf(node: EntryNode, replacement: string): EntryNode {
  const value = node.value;
  const trigger = firstField(value);
  if (!trigger) return node;

  const equals = node.raw.indexOf("=");
  if (equals === -1) return node;

  const rawIndex = node.raw.indexOf(trigger, equals + 1);
  const valueIndex = value.indexOf(trigger);
  if (rawIndex === -1 || valueIndex === -1) return node;

  return {
    ...node,
    value: `${value.slice(0, valueIndex)}${replacement}${value.slice(valueIndex + trigger.length)}`,
    raw: `${node.raw.slice(0, rawIndex)}${replacement}${node.raw.slice(rawIndex + trigger.length)}`,
  };
}

function rewriteToml(node: EntryNode, replacement: string): EntryNode {
  const trigger = node.path[node.path.length - 1] ?? "";
  if (!trigger) return node;

  const equals = node.raw.indexOf("=");
  if (equals === -1) return node;

  const keyPart = node.raw.slice(0, equals);
  const keyIndex = keyPart.lastIndexOf(trigger);
  if (keyIndex === -1) return node;

  return {
    ...node,
    path: [...node.path.slice(0, -1), replacement],
    raw: `${keyPart.slice(0, keyIndex)}${replacement}${keyPart.slice(keyIndex + trigger.length)}${node.raw.slice(equals)}`,
  };
}

function detect(document: ConfigDocument): MigrationFinding[] {
  const candidates = collect(document);
  const counts = countsByMode(candidates);
  return candidates.flatMap((candidate) => {
    const finding = findingFor(candidate, counts);
    return finding ? [finding] : [];
  });
}

function apply(document: ConfigDocument): ConfigDocument {
  const candidates = collect(document);
  const counts = countsByMode(candidates);
  const replacements = new Map<number, string>();

  for (const candidate of candidates) {
    const finding = findingFor(candidate, counts);
    if (finding?.fixable && candidate.replacement) {
      replacements.set(candidate.nodeIndex, candidate.replacement);
    }
  }

  if (replacements.size === 0) return document;

  return {
    ...document,
    nodes: document.nodes.map((node, index) => {
      const replacement = replacements.get(index);
      if (!replacement || node.kind !== "entry") return node;
      return document.format === "toml"
        ? rewriteToml(node, replacement)
        : rewriteConf(node, replacement);
    }),
  };
}

export const switchStatesMigration: Migration = {
  id: "switch-states",
  title: "Legacy switch bindings",
  description: "Replace the removed fold and unfold states with lid_on and lid_off.",
  detect,
  apply,
};
