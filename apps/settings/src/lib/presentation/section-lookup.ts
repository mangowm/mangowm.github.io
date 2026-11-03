import { SECTIONS } from "./sections";

const FIELD_SECTION = new Map<string, string>();
for (const section of SECTIONS) {
  for (const field of section.fields ?? []) {
    if (!FIELD_SECTION.has(field.configKey)) FIELD_SECTION.set(field.configKey, section.id);
  }
}

const DYNAMIC_SECTION: Record<string, string> = {
  env: "environment",
  var: "environment",
  exec: "autostart",
  exec_once: "autostart",
  source: "autostart",
  source_optional: "autostart",
  key_mode: "bindings",
  mousebind: "bindings",
  axisbind: "bindings",
  gesturebind: "bindings",
  switchbind: "bindings",
  window_rule: "window-rules",
  monitor_rule: "monitor-rules",
  tag_rule: "tag-rules",
  layer_rule: "layer-rules",
};

/** The settings section that owns a config key, if one exists. */
export function sectionForKey(key: string | undefined): { id: string; label: string } | undefined {
  if (!key) return undefined;

  const id =
    FIELD_SECTION.get(key) ??
    DYNAMIC_SECTION[key] ??
    (key.startsWith("bind") ? "bindings" : undefined);
  if (!id) return undefined;

  const section = SECTIONS.find((candidate) => candidate.id === id);
  return section ? { id: section.id, label: section.label } : undefined;
}
