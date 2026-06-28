import { useEffect, useState, useTransition } from "react";
import { BookOpenTextIcon, SettingsIcon } from "lucide-react";
import { SettingsSidebar } from "@/components/settings-sidebar";
import { PageHeader } from "@/components/page-header";
import { SectionDocsPage } from "@/components/section-docs";
import { ConfigPreviewer } from "@/components/config-previewer";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useConfigStore } from "@/lib/config-store";
import { getSectionById, SECTIONS } from "@/lib/sections";
import { getDocs } from "@/lib/docs";
import { SearchCommand, useSearchShortcut } from "@/components/search-command";
import type { SearchSelection } from "@/components/search-command";

const DEFAULT_SECTION = SECTIONS[0].id;
const PANEL_OPTIONS = [
  { value: "settings" as const, label: "Settings", icon: SettingsIcon },
  { value: "docs" as const, label: "Docs", icon: BookOpenTextIcon },
];

type PanelView = "settings" | "docs";

const SIDEBAR_STYLES = {
  "--sidebar-width": "calc(var(--spacing) * 72)",
  "--header-height": "calc(var(--spacing) * 12)",
} as React.CSSProperties;

export function SettingsPage() {
  const [activeSection, setActiveSection] = useState(DEFAULT_SECTION);
  const [focusKey, setFocusKey] = useState<string | undefined>(undefined);
  const [panelView, setPanelView] = useState<PanelView>("settings");
  const [showConfig, setShowConfig] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [, startTransition] = useTransition();
  const load = useConfigStore((s) => s.load);
  const hasFiles = useConfigStore((s) => s.files.length > 0);

  useEffect(() => {
    if (hasFiles) {
      setReady(true);
    } else {
      load().finally(() => setReady(true));
    }
  }, [load, hasFiles]);

  useSearchShortcut(() => setSearchOpen(true));

  const section = getSectionById(activeSection);
  const Panel = section?.panel ?? null;

  return (
    <SidebarProvider style={SIDEBAR_STYLES}>
      <SearchCommand
        open={searchOpen}
        onOpenChange={setSearchOpen}
        onSelect={(selection: SearchSelection) => {
          startTransition(() => {
            setActiveSection(selection.sectionId);
            setFocusKey(selection.configKey);
          });
        }}
      />
      <SettingsSidebar
        variant="inset"
        activeSection={activeSection}
        onSectionChange={(id: string) => {
          startTransition(() => {
            setActiveSection(id);
            setFocusKey(undefined);
          });
        }}
      />
      <SidebarInset>
        <PageHeader
          title={showConfig ? "Config Files" : (section?.label ?? "Settings")}
          onSearch={() => setSearchOpen(true)}
          showConfig={showConfig}
          onToggleConfig={() => setShowConfig((v) => !v)}
        />
        {showConfig ? (
          <div className="flex-1 overflow-hidden p-5">
            <div className="h-full rounded-xl bg-card ring-1 ring-foreground/10 p-6 flex flex-col">
              <ConfigPreviewer />
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto scrollbar-gutter-stable p-5">
            <div className="flex flex-row gap-5 min-h-[calc(100vh-120px)]">
              <div className="flex-1 rounded-xl bg-card ring-1 ring-foreground/10 p-6 relative flex flex-col">
                <div className="absolute top-3 right-3">
                  <SegmentedControl
                    options={PANEL_OPTIONS}
                    value={panelView}
                    onChange={setPanelView}
                  />
                </div>
                {!ready ? (
                  <div className="flex-1">
                    <Skeleton className="h-96 w-full rounded-xl" />
                  </div>
                ) : panelView === "settings" ? (
                  Panel && <Panel focusKey={focusKey} />
                ) : (
                  <SectionDocsPage markdown={getDocs(activeSection)} />
                )}
              </div>
            </div>
          </div>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}
