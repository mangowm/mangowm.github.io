import type { ComponentType } from "react";
import { FileJsonIcon, PaletteIcon, RocketIcon } from "lucide-react";
import { AutostartPanel } from "@/components/sections/autostart/AutostartPanel";
import { EnvironmentPanel } from "@/components/sections/environment/EnvironmentPanel";
import { ColorsPanel } from "@/components/sections/colors/ColorsPanel";

export interface SectionDef {
  id: string;
  label: string;
  icon: React.ReactNode;
  panel?: ComponentType;
  parentId?: string;
}

export const SECTIONS: SectionDef[] = [
  {
    id: "autostart",
    label: "Autostart",
    icon: <RocketIcon />,
    panel: AutostartPanel,
  },
  {
    id: "environment",
    label: "Environment Variables",
    icon: <FileJsonIcon />,
    panel: EnvironmentPanel,
  },
  {
    id: "colors",
    label: "Colors",
    icon: <PaletteIcon />,
    panel: ColorsPanel,
  },
];

export function getSectionById(id: string): SectionDef | undefined {
  return SECTIONS.find((s) => s.id === id);
}

export const ROOT_SECTIONS = SECTIONS.filter((s) => !s.parentId);

export function getChildren(parentId: string): SectionDef[] {
  return SECTIONS.filter((s) => s.parentId === parentId);
}
