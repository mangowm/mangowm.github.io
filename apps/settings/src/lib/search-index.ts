import { SECTIONS } from "@/lib/sections";

export interface SearchItem {
  sectionId: string;
  type: "section" | "field";
  label: string;
  description?: string;
  configKey?: string;
  sectionLabel: string;
}

export const SEARCH_INDEX: SearchItem[] = SECTIONS.flatMap((section) => [
  {
    sectionId: section.id,
    type: "section" as const,
    label: section.label,
    sectionLabel: section.label,
  },
  ...(section.fields?.map((field) => ({
    sectionId: section.id,
    type: "field" as const,
    label: field.label,
    description: field.description,
    configKey: field.configKey,
    sectionLabel: section.label,
  })) ?? []),
]);
