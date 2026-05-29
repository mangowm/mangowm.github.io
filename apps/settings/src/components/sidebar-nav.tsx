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
  title: string;
  icon?: React.ReactNode;
  children?: { title: string; icon?: React.ReactNode }[];
};

export function SidebarNav({
  items,
  activeSection,
  onSectionChange,
}: {
  items: NavItem[];
  activeSection: string;
  onSectionChange: (section: string) => void;
}) {
  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const item of items) {
      if (item.children) initial[item.title] = true;
    }
    return initial;
  });

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              {item.children ? (
                <>
                  <SidebarMenuButton
                    tooltip={item.title}
                    onClick={() =>
                      setOpenGroups((prev) => ({
                        ...prev,
                        [item.title]: !prev[item.title],
                      }))
                    }
                  >
                    {item.icon}
                    <span>{item.title}</span>
                    <ChevronDownIcon
                      className={cn(
                        "ml-auto size-4 transition-transform",
                        openGroups[item.title] && "rotate-180",
                      )}
                    />
                  </SidebarMenuButton>
                  {openGroups[item.title] && (
                    <SidebarMenuSub>
                      {item.children.map((child) => (
                        <SidebarMenuSubItem key={child.title}>
                          <SidebarMenuSubButton
                            isActive={child.title === activeSection}
                            onClick={() => onSectionChange(child.title)}
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
                  isActive={item.title === activeSection}
                  tooltip={item.title}
                  onClick={() => onSectionChange(item.title)}
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
