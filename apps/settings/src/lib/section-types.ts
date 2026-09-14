import type { ComponentType } from "react";
import type { ConfigData } from "./config-types";

export interface FieldDef {
  /** Config file key, e.g. "blur_radius" */
  configKey: string;
  label: string;
  description?: string;
  aliases?: string[];
}

export interface SectionMeta {
  id: string;
  label: string;
  icon: React.ReactNode;
  /** For nested nav, e.g. "colors" -> parentId "appearance" */
  parentId?: string;
  /** Section-level keywords inherited by all fields */
  keywords?: string[];
  /** Static field defs. Leave empty for user-managed list keys (exec-once, env). */
  fields?: FieldDef[];
  /** React panel component. Omitted for parent/grouping sections. */
  panel?: ComponentType<PanelProps>;
}

/**
 * Props for every panel component.
 * focusKey is set when the user navigated here via search —
 * panels use it to scroll-to and briefly highlight the field.
 */
export interface PanelProps {
  focusKey?: string;
}

/**
 * A source of runtime search entries built from live store data.
 * Register in lib/search-engine.ts → DYNAMIC_SOURCES.
 * Re-indexed whenever watchKeys change.
 */
export interface DynamicIndexSource {
  sourceId: string;
  watchKeys: string[];
  buildItems: (data: ConfigData) => DynamicSearchItem[];
}

export interface DynamicSearchItem {
  id: string;
  label: string;
  description?: string;
  sectionLabel: string;
  sectionId: string;
  configKey?: string;
}
