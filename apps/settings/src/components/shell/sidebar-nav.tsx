import * as React from "react";
import { ChevronDownIcon } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@mangowm/ui/components/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@mangowm/ui/components/collapsible";
import { cn } from "cn";

type NavItem = {
  id: string;
  title: string;
  icon?: React.ReactNode;
  children?: { id: string; title: string; icon?: React.ReactNode }[];
};

function parentOf(items: NavItem[], activeSection: string): string | undefined {
  return items.find((item) => item.children?.some((child) => child.id === activeSection))?.id;
}

export function SidebarNav({
  items,
  activeSection,
  onSectionChange,
}: {
  items: NavItem[];
  activeSection: string;
  onSectionChange: (id: string) => void;
}) {
  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    const activeParent = parentOf(items, activeSection);
    for (const item of items) {
      if (item.children) initial[item.id] = item.id === activeParent;
    }
    return initial;
  });

  // Reveal the group that contains the active section, including when the
  // section was reached through search rather than the sidebar.
  React.useEffect(() => {
    const activeParent = parentOf(items, activeSection);
    if (!activeParent) return;
    setOpenGroups((prev) => (prev[activeParent] ? prev : { ...prev, [activeParent]: true }));
  }, [items, activeSection]);

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => {
            const isOpen = Boolean(openGroups[item.id]);

            return (
              <SidebarMenuItem key={item.id}>
                {item.children ? (
                  <Collapsible
                    open={isOpen}
                    onOpenChange={(open) => setOpenGroups((prev) => ({ ...prev, [item.id]: open }))}
                  >
                    <CollapsibleTrigger render={<SidebarMenuButton />}>
                      {item.icon}
                      <span>{item.title}</span>
                      <ChevronDownIcon
                        className={cn(
                          "ml-auto size-4 transition-transform",
                          isOpen && "rotate-180",
                        )}
                      />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.children.map((child) => {
                          const isActive = child.id === activeSection;
                          return (
                            <SidebarMenuSubItem key={child.id}>
                              <SidebarMenuSubButton
                                render={<button type="button" />}
                                isActive={isActive}
                                aria-current={isActive ? "page" : undefined}
                                onClick={() => onSectionChange(child.id)}
                                className="cursor-pointer"
                              >
                                {child.icon}
                                <span>{child.title}</span>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </Collapsible>
                ) : (
                  <SidebarMenuButton
                    isActive={item.id === activeSection}
                    aria-current={item.id === activeSection ? "page" : undefined}
                    tooltip={item.title}
                    onClick={() => onSectionChange(item.id)}
                  >
                    {item.icon}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
