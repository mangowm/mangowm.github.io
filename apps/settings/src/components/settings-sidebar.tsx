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
import { MANGO_SUPPORTED_VERSION } from "@/lib/settings";

const NAV_ITEMS = ROOT_SECTIONS.map((s) => {
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
              <div className="flex min-w-0 flex-col">
                <span className="text-base font-semibold leading-none">mangowm settings</span>
                <span className="mt-1 font-mono text-[10px] text-muted-foreground/70">
                  mango v{MANGO_SUPPORTED_VERSION}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarNav
          items={NAV_ITEMS}
          activeSection={activeSection}
          onSectionChange={onSectionChange}
        />
      </SidebarContent>
    </Sidebar>
  );
}
