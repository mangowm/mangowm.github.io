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
import { ROOT_SECTIONS, getChildren } from "@/lib/sections";

export function SettingsSidebar({
  activeSection,
  onSectionChange,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  activeSection: string;
  onSectionChange: (section: string) => void;
}) {
  const navItems = ROOT_SECTIONS.map((s) => {
    const children = getChildren(s.id);
    return {
      title: s.label,
      id: s.id,
      icon: s.icon,
      ...(children.length > 0
        ? { children: children.map((c) => ({ title: c.label, id: c.id, icon: c.icon })) }
        : {}),
    };
  });

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
          items={navItems}
          activeSection={activeSection}
          onSectionChange={onSectionChange}
        />
      </SidebarContent>
    </Sidebar>
  );
}
