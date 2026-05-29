import * as React from "react";

import { Logo } from "@/components/logo";
import { SidebarNav } from "@/components/sidebar-nav";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
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

const data = {
  navMain: [
    {
      title: "Autostart",
      icon: <RocketIcon />,
    },
    {
      title: "Environment Variables",
      icon: <FileJsonIcon />,
    },
    {
      title: "Appearance",
      icon: <PaletteIcon />,
    },
    {
      title: "Rules",
      icon: <ListChecksIcon />,
      children: [
        { title: "Window Rules", icon: <AppWindowIcon /> },
        { title: "Tag Rules", icon: <TagIcon /> },
        { title: "Layer Rule", icon: <LayersIcon /> },
        { title: "Monitor Rules", icon: <MonitorIcon /> },
      ],
    },
    {
      title: "Bindings",
      icon: <LinkIcon />,
      children: [
        { title: "Keybinds", icon: <KeyboardIcon /> },
        { title: "Mouse Binds", icon: <MousePointerClickIcon /> },
        { title: "Gesture Binds", icon: <HandIcon /> },
        { title: "Axis Binds", icon: <MoveIcon /> },
        { title: "Switch Binds", icon: <ArrowUpDownIcon /> },
      ],
    },
  ],
};
export function SettingsSidebar({
  activeSection,
  onSectionChange,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  activeSection: string;
  onSectionChange: (section: string) => void;
}) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="data-[slot=sidebar-menu-button]:p-1.5!">
              <Logo className="size-6 shrink-0" />
              <span className="text-base font-semibold">mangowm settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarNav
          items={data.navMain}
          activeSection={activeSection}
          onSectionChange={onSectionChange}
        />
      </SidebarContent>
    </Sidebar>
  );
}
