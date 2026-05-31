import type { ComponentType } from "react";
import { FileJsonIcon, PaintbrushIcon, PaletteIcon, RocketIcon, Blend, Grid3x3, LayoutGridIcon, PanelLeftIcon } from "lucide-react";
import { AutostartPanel } from "@/components/sections/autostart/AutostartPanel";
import { EnvironmentPanel } from "@/components/sections/environment/EnvironmentPanel";
import { ColorsPanel } from "@/components/sections/colors/ColorsPanel";
import { WindowEffectsPanel } from "@/components/sections/window-effects/WindowEffectsPanel";
import { GapsBordersPanel } from "@/components/sections/gaps-borders/GapsBordersPanel";
import { TilingPanel } from "@/components/sections/layout/TilingPanel";

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
    id: "appearance",
    label: "Appearance",
    icon: <PaintbrushIcon />,
  },
  {
    id: "colors",
    label: "Colors",
    icon: <PaletteIcon />,
    panel: ColorsPanel,
    parentId: "appearance",
  },
  {
    id: "window-effects",
    label: "Window Effects",
    icon: <Blend />,
    panel: WindowEffectsPanel,
    parentId: "appearance",
  },
  {
    id: "gaps-borders",
    label: "Gaps & Borders",
    icon: <Grid3x3 />,
    panel: GapsBordersPanel,
    parentId: "appearance",
  },
  {
    id: "layout",
    label: "Layout",
    icon: <LayoutGridIcon />,
  },
  {
    id: "tiling",
    label: "Tiling",
    icon: <PanelLeftIcon />,
    panel: TilingPanel,
    parentId: "layout",
  },
];

export function getSectionById(id: string): SectionDef | undefined {
  return SECTIONS.find((s) => s.id === id);
}

export const ROOT_SECTIONS = SECTIONS.filter((s) => !s.parentId);

export function getChildren(parentId: string): SectionDef[] {
  return SECTIONS.filter((s) => s.parentId === parentId);
}
