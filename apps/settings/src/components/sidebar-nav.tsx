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
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

type NavItem = {
  id: string;
  title: string;
  icon?: React.ReactNode;
  children?: { id: string; title: string; icon?: React.ReactNode }[];
};

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
    for (const item of items) {
      if (item.children) initial[item.id] = false;
    }
    return initial;
  });

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.id}>
              {item.children ? (
                <>
                  <SidebarMenuButton
                    tooltip={item.title}
                    onClick={() =>
                      setOpenGroups((prev) => ({
                        ...prev,
                        [item.id]: !prev[item.id],
                      }))
                    }
                  >
                    {item.icon}
                    <span>{item.title}</span>
                    <ChevronDownIcon
                      className={cn(
                        "ml-auto size-4 transition-transform",
                        openGroups[item.id] && "rotate-180",
                      )}
                    />
                  </SidebarMenuButton>
                  {openGroups[item.id] && (
                    <SidebarMenuSub>
                      {item.children.map((child) => (
                        <SidebarMenuSubItem key={child.id}>
                          <SidebarMenuSubButton
                            isActive={child.id === activeSection}
                            onClick={() => onSectionChange(child.id)}
                            className="cursor-pointer"
                          >
                            {child.icon}
                            <span>{child.title}</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  )}
                </>
              ) : (
                <SidebarMenuButton
                  isActive={item.id === activeSection}
                  tooltip={item.title}
                  onClick={() => onSectionChange(item.id)}
                >
                  {item.icon}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
