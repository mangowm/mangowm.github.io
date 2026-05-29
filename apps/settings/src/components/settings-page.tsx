import { useEffect, useState } from "react";
import { SettingsSidebar } from "@/components/settings-sidebar";
import { PageHeader } from "@/components/page-header";
import { SectionDocs } from "@/components/section-docs";
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
        <div className="flex-1 overflow-y-auto p-5">
          <div className="flex flex-row gap-5 min-h-full">
            <div className="flex-1 rounded-xl bg-card ring-1 ring-foreground/10 overflow-y-auto p-6">
              {activeSection === "Autostart" && <AutostartPanel />}
            </div>
            <SectionDocs section={activeSection} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
