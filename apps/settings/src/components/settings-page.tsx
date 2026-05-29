import { useEffect, useState } from "react";
import { SettingsSidebar } from "@/components/settings-sidebar";
import { PageHeader } from "@/components/page-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useConfigStore } from "@/lib/config-store";
import { AutostartPanel } from "@/components/AutostartPanel";

export function SettingsPage() {
  const [activeSection, setActiveSection] = useState("Autostart");
  const load = useConfigStore((s) => s.load);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <SettingsSidebar
        variant="inset"
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
      <SidebarInset>
        <PageHeader title={activeSection} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {activeSection === "Autostart" && <AutostartPanel />}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
