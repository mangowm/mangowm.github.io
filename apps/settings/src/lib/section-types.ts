import type { ComponentType } from "react";
import type { ConfigData } from "./config-types";

export interface FieldDef {
  /** The config file key, e.g. "blur_radius" */
  configKey: string;
  /** Human label shown in search results and the panel */
  label: string;
  /** One-line explanation shown as a search result subtitle */
  description?: string;
  /**
   * Extra aliases for this field that a user might type but that
   * don't appear in label/description. e.g. ["px", "thickness"].
   */
  aliases?: string[];
}

export interface SectionMeta {
  id: string;
  label: string;
  icon: React.ReactNode;
  /** Parent section id for nested nav (e.g. "colors" -> parentId "appearance") */
  parentId?: string;
  /**
   * Section-level keywords. Added to every field result from this section
   * so "wayland" finds all environment fields, "visual" finds window-effects etc.
   */
  keywords?: string[];
  /**
   * Static field definitions for this section.
   * Panels with purely user-managed list entries (exec-once, env) should
   * leave this empty — their runtime entries are indexed dynamically by
   * the search engine via DynamicIndexSource.
   */
  fields?: FieldDef[];
  /** The React panel component. Optional — parent/grouping sections have none. */
  panel?: ComponentType<PanelProps>;
}

/**
 * Props passed to every panel component.
 * focusKey is set when the user navigated here via a search result pointing
 * at a specific field. Panels use it to scroll-to + briefly highlight.
 */
export interface PanelProps {
  focusKey?: string;
}

/**
 * Describes a source of runtime search entries that are built from live
 * store data rather than static field definitions.
 *
 * Register these in lib/search-engine.ts → DYNAMIC_SOURCES.
 * Each source is re-indexed whenever the relevant config keys change.
 */
export interface DynamicIndexSource {
  /** Unique prefix for ids produced by this source, e.g. "exec-once" */
  sourceId: string;
  /** Which store data keys trigger a re-index when they change */
  watchKeys: string[];
  /**
   * Given the current merged ConfigData, produce search items.
   * Called lazily whenever watchKeys data changes.
   */
  buildItems: (data: ConfigData) => DynamicSearchItem[];
}

export interface DynamicSearchItem {
  /** Globally unique. Suggested pattern: `${sourceId}:${index}` */
  id: string;
  /** Text shown in the result row title */
  label: string;
  /** Text shown as the subtitle */
  description?: string;
  /** Badge text, e.g. "Autostart" */
  sectionLabel: string;
  /** Which section to navigate to on select */
  sectionId: string;
  /**
   * configKey to deep-link into — panel will receive this as focusKey.
   * For list items this is the list key (e.g. "exec-once"), not an index.
   */
  configKey?: string;
}
