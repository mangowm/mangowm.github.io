import { lazy, Suspense, useCallback, useEffect, useState, useTransition } from "react";
import { FileCode2Icon } from "lucide-react";

import { SettingsSidebar } from "@/components/shell/settings-sidebar";
import { PageHeader } from "@/components/shell/page-header";
import { EmptyConfig } from "@/components/shell/empty-config";
import { convertFile, convertName } from "@/lib/config/convert";

const loadConfigPreviewer = () =>
  import("@/components/preview/config-previewer").then((module) => ({
    default: module.ConfigPreviewer,
  }));

const ConfigPreviewer = lazy(loadConfigPreviewer);
import { SidebarInset, SidebarProvider } from "@mangowm/ui/components/sidebar";
import { Skeleton } from "@mangowm/ui/components/skeleton";
import { useConfigStore } from "@/lib/config/store";
import { getSectionById, SECTIONS } from "@/lib/presentation/sections";
import { sectionForKey } from "@/lib/presentation/section-lookup";
import { SearchCommand } from "@/components/shell/search-command";
import { useSearchShortcut } from "@/components/shell/use-search-shortcut";
import { useConfigShortcuts } from "@/components/shell/use-config-shortcuts";
import type { SearchSelection } from "@/components/shell/search-command";

const DEFAULT_SECTION = SECTIONS[0].id;

const SIDEBAR_STYLES = {
  "--sidebar-width": "calc(var(--spacing) * 72)",
  "--header-height": "calc(var(--spacing) * 12)",
} as React.CSSProperties;

function ConfigPreviewFallback() {
  const files = useConfigStore((s) => s.files);
  const outputFormat = useConfigStore((s) => s.outputFormat);
  const file = files[0];
  const contents = file ? convertFile(file, outputFormat) : "";

  return (
    <div className="-m-6 flex flex-1 flex-col overflow-hidden rounded-xl">
      <div className="flex items-center gap-2 border-b border-foreground/10 bg-card px-4 py-2 text-xs text-muted-foreground/60">
        <FileCode2Icon className="size-3.5" />
        <span className="font-mono">{file ? convertName(file.refPath, outputFormat) : ""}</span>
      </div>
      <pre className="flex-1 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent overflow-auto p-4 font-mono text-[12px] leading-relaxed text-foreground/80">
        {contents || "No config files loaded"}
      </pre>
    </div>
  );
}

export function SettingsPage() {
  const [activeSection, setActiveSection] = useState(DEFAULT_SECTION);
  const [focusKey, setFocusKey] = useState<string | undefined>(undefined);
  const [showConfig, setShowConfig] = useState(false);
  // Mount the config editor on first use, then keep it alive so switching
  // between settings and the editor doesn't rebuild the whole editor.
  const [configMounted, setConfigMounted] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [, startTransition] = useTransition();
  const load = useConfigStore((s) => s.load);
  const hasFiles = useConfigStore((s) => s.files.length > 0);

  const preloadConfigPreviewer = useCallback(() => {
    void loadConfigPreviewer().catch(() => {});
  }, []);

  useEffect(() => {
    if (!hasFiles) return;
    const timer = window.setTimeout(preloadConfigPreviewer, 1200);
    return () => window.clearTimeout(timer);
  }, [hasFiles, preloadConfigPreviewer]);

  useEffect(() => {
    if (hasFiles) {
      setReady(true);
    } else {
      void load().finally(() => setReady(true));
    }
  }, [load, hasFiles]);

  useSearchShortcut(() => setSearchOpen(true));
  useConfigShortcuts();

  const section = getSectionById(activeSection);
  const Panel = section?.panel ?? null;

  return (
    <SidebarProvider style={SIDEBAR_STYLES} className="h-svh overflow-hidden">
      <SearchCommand
        open={searchOpen}
        onOpenChange={setSearchOpen}
        onSelect={(selection: SearchSelection) => {
          startTransition(() => {
            setActiveSection(selection.sectionId);
            setFocusKey(selection.configKey);
            setShowConfig(false);
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
      <SidebarInset className="min-h-0">
        <PageHeader
          title={showConfig ? "Config Files" : (section?.label ?? "Settings")}
          onSearch={() => setSearchOpen(true)}
          showConfig={showConfig}
          onPreloadConfig={preloadConfigPreviewer}
          onToggleConfig={() => {
            if (!showConfig) setConfigMounted(true);
            setShowConfig(!showConfig);
          }}
        />
        {configMounted && (
          <div className="min-h-0 flex-1 overflow-hidden p-5" hidden={!showConfig}>
            <div className="flex h-full flex-col rounded-xl bg-card p-6 ring-1 ring-foreground/10">
              <Suspense fallback={<ConfigPreviewFallback />}>
                <ConfigPreviewer
                  resolveSection={sectionForKey}
                  onOpenSection={(sectionId, key) => {
                    setActiveSection(sectionId);
                    setFocusKey(key);
                    setShowConfig(false);
                  }}
                />
              </Suspense>
            </div>
          </div>
        )}
        <div
          className="min-h-0 flex-1 scrollbar-gutter-stable overflow-y-auto p-5"
          hidden={showConfig}
        >
          <div className="flex min-h-full flex-row gap-5">
            <div className="relative flex flex-1 flex-col rounded-xl bg-card p-6 ring-1 ring-foreground/10">
              {!ready ? (
                <div className="flex-1">
                  <Skeleton className="h-96 w-full rounded-xl" />
                </div>
              ) : !hasFiles ? (
                <EmptyConfig />
              ) : (
                Panel && <Panel focusKey={focusKey} />
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
