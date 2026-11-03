import { lazy, Suspense, useEffect, useState, useTransition } from "react";

import { SettingsSidebar } from "@/components/shell/settings-sidebar";
import { PageHeader } from "@/components/shell/page-header";
const ConfigPreviewer = lazy(() =>
  import("@/components/config-previewer").then((module) => ({
    default: module.ConfigPreviewer,
  })),
);
import { SidebarInset, SidebarProvider } from "@mangowm/ui/components/sidebar";
import { Skeleton } from "@mangowm/ui/components/skeleton";
import { useConfigStore } from "@/lib/config/store";
import { getSectionById, SECTIONS } from "@/lib/presentation/sections";
import { SearchCommand, useSearchShortcut } from "@/components/shell/search-command";
import type { SearchSelection } from "@/components/shell/search-command";

const DEFAULT_SECTION = SECTIONS[0].id;

const SIDEBAR_STYLES = {
  "--sidebar-width": "calc(var(--spacing) * 72)",
  "--header-height": "calc(var(--spacing) * 12)",
} as React.CSSProperties;

export function SettingsPage() {
  const [activeSection, setActiveSection] = useState(DEFAULT_SECTION);
  const [focusKey, setFocusKey] = useState<string | undefined>(undefined);
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
      void load().finally(() => setReady(true));
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
            setShowConfig(false);
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
            <div className="flex h-full flex-col rounded-xl bg-card p-6 ring-1 ring-foreground/10">
              <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
                <ConfigPreviewer />
              </Suspense>
            </div>
          </div>
        ) : (
          <div className="flex-1 scrollbar-gutter-stable overflow-y-auto p-5">
            <div className="flex min-h-full flex-row gap-5">
              <div className="relative flex flex-1 flex-col rounded-xl bg-card p-6 ring-1 ring-foreground/10">
                {!ready ? (
                  <div className="flex-1">
                    <Skeleton className="h-96 w-full rounded-xl" />
                  </div>
                ) : (
                  Panel && <Panel focusKey={focusKey} />
                )}
              </div>
            </div>
          </div>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}
