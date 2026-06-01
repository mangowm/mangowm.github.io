import { Undo2, Redo2, AlertCircle, SearchIcon } from "lucide-react";
import { useStore } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useConfigStore, undo, redo } from "@/lib/config-store";

export function PageHeader({ title, onSearch }: { title?: string; onSearch?: () => void }) {
  const error = useConfigStore((s) => s.error);

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
              <span className="truncate max-w-80">{error}</span>
            </div>
          )}
        </div>

        <div className="flex-1 flex justify-center">
          {onSearch && (
            <button
              onClick={onSearch}
              className="flex items-center gap-2 rounded-lg border border-border/40 bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground/70 hover:border-border/70 hover:bg-muted/50 hover:text-muted-foreground transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              title="Search settings (Ctrl+K)"
            >
              <SearchIcon className="size-3.5 shrink-0" />
              <span className="hidden sm:inline">Search settings…</span>
              <span className="inline sm:hidden">Search…</span>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded-md border border-border/30 bg-muted/50 px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground/60">
                Ctrl+K
              </kbd>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <HistoryButtons />
          <ApplyButton />
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

  const { dirty, loading, load } = useConfigStore(
    useShallow((s) => ({ dirty: s.dirty, loading: s.loading, load: s.load })),
  );

  return (
    <>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={undo}
        disabled={!canUndo}
        title="Undo (Ctrl+Z)"
      >
        <Undo2 className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={redo}
        disabled={!canRedo}
        title="Redo (Ctrl+Shift+Z)"
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
  const { applying, loading, dirty, apply } = useConfigStore(
    useShallow((s) => ({
      applying: s.applying,
      loading: s.loading,
      dirty: s.dirty,
      apply: s.apply,
    })),
  );

  if (loading) return null;

  return (
    <Button onClick={apply} disabled={applying || !dirty} variant={dirty ? "default" : "outline"}>
      {applying ? "Applying..." : dirty ? "Apply Changes" : "Applied"}
    </Button>
  );
}
