import { useEffect, useState, useCallback } from "react";
import { BookOpenTextIcon, SettingsIcon } from "lucide-react";
import { SettingsSidebar } from "@/components/settings-sidebar";
import { PageHeader } from "@/components/page-header";
import { SectionDocsPage } from "@/components/section-docs";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useConfigStore } from "@/lib/config-store";
import { getSectionById, SECTIONS } from "@/lib/sections";
import { getDocs } from "@/lib/docs";
import { SearchCommand, useSearchShortcut } from "@/components/search-command";
import type { SearchSelection } from "@/components/search-command";

const DEFAULT_SECTION = SECTIONS[0].id;

type PanelView = "settings" | "docs";

const SIDEBAR_STYLES = {
  "--sidebar-width": "calc(var(--spacing) * 72)",
  "--header-height": "calc(var(--spacing) * 12)",
} as React.CSSProperties;

export function SettingsPage() {
  const [activeSection, setActiveSection] = useState(DEFAULT_SECTION);
  const [focusKey, setFocusKey] = useState<string | undefined>(undefined);
  const [panelView, setPanelView] = useState<PanelView>("settings");
  const [searchOpen, setSearchOpen] = useState(false);
  const load = useConfigStore((s) => s.load);

  useEffect(() => {
    load();
  }, [load]);

  useSearchShortcut(useCallback(() => setSearchOpen(true), []));

  const handleSearchSelect = useCallback((selection: SearchSelection) => {
    setActiveSection(selection.sectionId);
    setFocusKey(selection.configKey);
  }, []);

  const handleSectionChange = useCallback((id: string) => {
    setActiveSection(id);
    setFocusKey(undefined);
  }, []);

  const section = getSectionById(activeSection);
  const Panel = section?.panel ?? null;

  const panelOptions = [
    { value: "settings" as const, label: "Settings", icon: SettingsIcon },
    { value: "docs" as const, label: "Docs", icon: BookOpenTextIcon },
  ];

  const panelContent: Record<PanelView, React.ReactNode> = {
    settings: Panel && <Panel focusKey={focusKey} />,
    docs: <SectionDocsPage markdown={getDocs(activeSection)} />,
  };

  return (
    <SidebarProvider style={SIDEBAR_STYLES}>
      <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} onSelect={handleSearchSelect} />
      <SettingsSidebar
        variant="inset"
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
      />
      <SidebarInset>
        <PageHeader title={section?.label ?? "Settings"} onSearch={() => setSearchOpen(true)} />
        <div className="flex-1 overflow-y-auto scrollbar-gutter-stable p-5">
          <div className="flex flex-row gap-5 min-h-full">
            <div className="flex-1 rounded-xl bg-card ring-1 ring-foreground/10 p-6 relative">
              <div className="absolute top-3 right-3">
                <SegmentedControl
                  options={panelOptions}
                  value={panelView}
                  onChange={setPanelView}
                />
              </div>
              {panelContent[panelView]}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
