import { useState } from "react";
import {
  AlertCircle,
  Download,
  FileCode2Icon,
  Redo2,
  SearchIcon,
  Undo2,
  Wrench,
} from "lucide-react";
import { useStore } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { Separator } from "@mangowm/ui/components/separator";
import { SidebarTrigger } from "@mangowm/ui/components/sidebar";
import { Button } from "@mangowm/ui/components/button";
import { Kbd } from "@mangowm/ui/components/kbd";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@mangowm/ui/components/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@mangowm/ui/components/alert-dialog";
import { useConfigStore, useConfigDirty, undo, redo } from "@/lib/config/store";
import { getHost } from "@/lib/platform";
import { convertFile, convertName } from "@/lib/config/convert";
import { REDO_SHORTCUT, SEARCH_SHORTCUT, UNDO_SHORTCUT } from "@/lib/platform/shortcuts";
import { cn } from "cn";

export function PageHeader({
  title,
  onSearch,
  showConfig,
  onToggleConfig,
  onPreloadConfig,
}: {
  title?: string;
  onSearch?: () => void;
  showConfig?: boolean;
  onToggleConfig?: () => void;
  onPreloadConfig?: () => void;
}) {
  const error = useConfigStore((s) => s.error);
  const isTauri = useConfigStore((s) => s.isTauri);

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center px-4 lg:px-6">
        <div className="flex items-center gap-1 lg:gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mx-2 h-4 data-vertical:self-auto" />
          <h1 className="text-base font-medium">{title ?? "Settings"}</h1>

          {error && (
            <div className="ml-4 flex items-center gap-1.5 text-sm text-destructive">
              <AlertCircle className="size-4" />
              <span className="max-w-80 truncate">{error}</span>
            </div>
          )}
        </div>

        <div className="flex flex-1 justify-center">
          {onSearch && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSearch}
              className="h-auto gap-2 rounded-lg border-border/40 bg-muted/30 px-3 py-1.5 text-xs font-normal text-muted-foreground/70 shadow-none transition-all outline-none hover:border-border/70 hover:bg-muted/50 hover:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
              title={`Search settings (${SEARCH_SHORTCUT})`}
            >
              <SearchIcon className="size-3.5 shrink-0" />
              <span className="hidden sm:inline">Search settings…</span>
              <span className="inline sm:hidden">Search…</span>
              <Kbd className="hidden h-auto min-w-0 items-center gap-0.5 rounded-sm border border-border/30 bg-muted/50 px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground/60 sm:inline-flex">
                {SEARCH_SHORTCUT}
              </Kbd>
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onToggleConfig && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onToggleConfig}
              onPointerEnter={onPreloadConfig}
              onFocus={onPreloadConfig}
              title={showConfig ? "Back to Settings" : "View Config Files"}
              className={cn(showConfig && "bg-accent text-accent-foreground")}
            >
              <FileCode2Icon className="size-4" />
            </Button>
          )}
          <SetupMenu />
          <HistoryButtons />
          {isTauri && <ApplyButton />}
          <DownloadButton />
        </div>
      </div>
    </header>
  );
}

function HistoryButtons() {
  const { canUndo, canRedo } = useStore(
    useConfigStore.temporal,
    useShallow((s) => ({
      canUndo: s.pastStates.length > 0,
      canRedo: s.futureStates.length > 0,
    })),
  );

  const { loading, load } = useConfigStore(
    useShallow((s) => ({ loading: s.loading, load: s.load })),
  );
  const dirty = useConfigDirty();

  return (
    <>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={undo}
        disabled={!canUndo}
        title={`Undo (${UNDO_SHORTCUT})`}
      >
        <Undo2 className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={redo}
        disabled={!canRedo}
        title={`Redo (${REDO_SHORTCUT})`}
      >
        <Redo2 className="size-4" />
      </Button>
      {dirty && !loading && (
        <Button
          variant="ghost"
          size="sm"
          onClick={load}
          className="text-muted-foreground hover:text-foreground"
        >
          Discard
        </Button>
      )}
    </>
  );
}

function ApplyButton() {
  const { applying, loading, apply } = useConfigStore(
    useShallow((s) => ({
      applying: s.applying,
      loading: s.loading,
      apply: s.apply,
    })),
  );
  const dirty = useConfigDirty();

  if (loading) return null;

  return (
    <Button onClick={apply} disabled={applying || !dirty} variant={dirty ? "default" : "outline"}>
      {applying ? "Applying..." : dirty ? "Apply Changes" : "Applied"}
    </Button>
  );
}

function DownloadButton() {
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={() => {
        const files = useConfigStore.getState().files;
        const format = useConfigStore.getState().outputFormat;
        getHost().download(
          files.map((file) => ({
            absPath: convertName(file.absPath, format),
            refPath: convertName(file.refPath, format),
            text: convertFile(file, format),
          })),
        );
      }}
      title="Download Config"
    >
      <Download className="size-4" />
    </Button>
  );
}

function SetupMenu() {
  const createDefault = useConfigStore((state) => state.createDefault);
  const importConfig = useConfigStore((state) => state.importConfig);
  const backup = useConfigStore((state) => state.backup);
  const openConfigFolder = useConfigStore((state) => state.openConfigFolder);
  const isTauri = useConfigStore((state) => state.isTauri);
  const hasFiles = useConfigStore((state) => state.files.length > 0);
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" title="Setup" />}>
          <Wrench className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-44">
          <DropdownMenuItem onClick={() => void importConfig()}>Import config</DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              if (hasFiles) setConfirmOpen(true);
              else void createDefault();
            }}
          >
            Create default config
          </DropdownMenuItem>
          {isTauri && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled={!hasFiles} onClick={() => void backup()}>
                Back up config
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => void openConfigFolder()}>
                Open config folder
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Replace configuration?</AlertDialogTitle>
            <AlertDialogDescription>
              {isTauri
                ? "The current configuration will be backed up, then replaced with the default."
                : "The current configuration will be replaced with the default. This cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmOpen(false);
                void createDefault();
              }}
            >
              Replace
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
