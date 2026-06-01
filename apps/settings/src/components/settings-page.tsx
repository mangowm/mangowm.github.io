import { useEffect, useState, useCallback } from "react";
import { BookOpenTextIcon, SettingsIcon } from "lucide-react";
import { SettingsSidebar } from "@/components/settings-sidebar";
import { PageHeader } from "@/components/page-header";
import { SectionDocsPage } from "@/components/section-docs";
import { Button } from "@/components/ui/button";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useConfigStore } from "@/lib/config-store";
import { getSectionById, SECTIONS } from "@/lib/sections";
import { getDocs } from "@/lib/docs";
import { SearchCommand, useSearchShortcut } from "@/components/search-command";
import type { SearchSelection } from "@/components/search-command";

const DEFAULT_SECTION = SECTIONS[0].id;

const SIDEBAR_STYLES = {
  "--sidebar-width": "calc(var(--spacing) * 72)",
  "--header-height": "calc(var(--spacing) * 12)",
} as React.CSSProperties;

export function SettingsPage() {
  const [activeSection, setActiveSection] = useState(DEFAULT_SECTION);
  const [focusKey, setFocusKey]     = useState<string | undefined>(undefined);
  const [docsOpen, setDocsOpen]     = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const load = useConfigStore((s) => s.load);

  useEffect(() => { load(); }, [load]);

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

  return (
    <SidebarProvider style={SIDEBAR_STYLES}>
      <SearchCommand
        open={searchOpen}
        onOpenChange={setSearchOpen}
        onSelect={handleSearchSelect}
      />
      <SettingsSidebar
        variant="inset"
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
      />
      <SidebarInset>
        <PageHeader title={section?.label ?? "Settings"} onSearch={() => setSearchOpen(true)} />
        <div className="flex-1 overflow-y-auto p-5">
          <div className="flex flex-row gap-5 min-h-full">
            <div className="flex-1 rounded-xl bg-card ring-1 ring-foreground/10 overflow-y-auto p-6 relative">
              <div className="absolute top-3 right-3 z-10 flex items-center rounded-lg bg-card ring-1 ring-foreground/10 p-0.5">
                <Button variant={docsOpen ? "ghost" : "default"} size="icon-sm"
                  onClick={() => setDocsOpen(false)} title="Settings" className="rounded-md">
                  <SettingsIcon className="size-4" />
                </Button>
                <Button variant={docsOpen ? "default" : "ghost"} size="icon-sm"
                  onClick={() => setDocsOpen(true)} title="Docs" className="rounded-md">
                  <BookOpenTextIcon className="size-4" />
                </Button>
              </div>
              {docsOpen
                ? <SectionDocsPage markdown={getDocs(activeSection)} />
                : Panel && <Panel focusKey={focusKey} />
              }
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
