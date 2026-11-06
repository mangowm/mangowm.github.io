import { DIRECTIVES, RULES } from "@mangowm.github.io/schema";

import { ALL_BIND_VARIANTS, NON_KEYBOARD_KEYS } from "@/lib/keybind-parse";
import { SECTIONS } from "./sections";

const FIELD_SECTION = new Map<string, string>();
for (const section of SECTIONS) {
  for (const field of section.fields ?? []) {
    if (!FIELD_SECTION.has(field.configKey)) FIELD_SECTION.set(field.configKey, section.id);
  }
}

const RULE_SECTION: Record<string, string> = {
  window_rule: "window-rules",
  monitor_rule: "monitor-rules",
  tag_rule: "tag-rules",
  layer_rule: "layer-rules",
};

const DYNAMIC_SECTION: Record<string, string> = {
  env: "environment",
  var: "environment",
  key_mode: "bindings",
};

for (const directive of DIRECTIVES) {
  DYNAMIC_SECTION[directive.key] = "autostart";
}

for (const keyword of [...ALL_BIND_VARIANTS, ...NON_KEYBOARD_KEYS]) {
  DYNAMIC_SECTION[keyword] = "bindings";
}

for (const rule of RULES) {
  const section = RULE_SECTION[rule.key];
  if (section) DYNAMIC_SECTION[rule.key] = section;
}

/** The settings section that owns a config key, if one exists. */
export function sectionForKey(key: string | undefined): { id: string; label: string } | undefined {
  if (!key) return undefined;

  const id = FIELD_SECTION.get(key) ?? DYNAMIC_SECTION[key];
  if (!id) return undefined;

  const section = SECTIONS.find((candidate) => candidate.id === id);
  return section ? { id: section.id, label: section.label } : undefined;
}
