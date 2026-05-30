import type { ComponentType } from "react";
import {
  FileJsonIcon,
  AppWindowIcon,
  TagIcon,
  LayersIcon,
  ListChecksIcon,
  MonitorIcon,
  ArrowUpDownIcon,
  RocketIcon,
  PaletteIcon,
  LinkIcon,
  KeyboardIcon,
  MousePointerClickIcon,
  HandIcon,
  MoveIcon,
} from "lucide-react";
import { AutostartPanel } from "@/components/sections/autostart/AutostartPanel";

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
    panel: () => null,
  },
  {
    id: "appearance",
    label: "Appearance",
    icon: <PaletteIcon />,
    panel: () => null,
  },
  {
    id: "rules",
    label: "Rules",
    icon: <ListChecksIcon />,
    panel: () => null,
  },
  {
    id: "window-rules",
    label: "Window Rules",
    icon: <AppWindowIcon />,
    panel: () => null,
    parentId: "rules",
  },
  {
    id: "tag-rules",
    label: "Tag Rules",
    icon: <TagIcon />,
    panel: () => null,
    parentId: "rules",
  },
  {
    id: "layer-rule",
    label: "Layer Rule",
    icon: <LayersIcon />,
    panel: () => null,
    parentId: "rules",
  },
  {
    id: "monitor-rules",
    label: "Monitor Rules",
    icon: <MonitorIcon />,
    panel: () => null,
    parentId: "rules",
  },
  {
    id: "bindings",
    label: "Bindings",
    icon: <LinkIcon />,
    panel: () => null,
  },
  {
    id: "keybinds",
    label: "Keybinds",
    icon: <KeyboardIcon />,
    panel: () => null,
    parentId: "bindings",
  },
  {
    id: "mouse-binds",
    label: "Mouse Binds",
    icon: <MousePointerClickIcon />,
    panel: () => null,
    parentId: "bindings",
  },
  {
    id: "gesture-binds",
    label: "Gesture Binds",
    icon: <HandIcon />,
    panel: () => null,
    parentId: "bindings",
  },
  {
    id: "axis-binds",
    label: "Axis Binds",
    icon: <MoveIcon />,
    panel: () => null,
    parentId: "bindings",
  },
  {
    id: "switch-binds",
    label: "Switch Binds",
    icon: <ArrowUpDownIcon />,
    panel: () => null,
    parentId: "bindings",
  },
];

export function getSectionById(id: string): SectionDef | undefined {
  return SECTIONS.find((s) => s.id === id);
}

export const ROOT_SECTIONS = SECTIONS.filter((s) => !s.parentId);

export function getChildren(parentId: string): SectionDef[] {
  return SECTIONS.filter((s) => s.parentId === parentId);
}
