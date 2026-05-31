import { useEffect } from "react";
import { Undo2, Redo2, AlertCircle, SearchIcon } from "lucide-react";
import { useStore } from "zustand";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useConfigStore } from "@/lib/config-store";
import { useShallow } from "zustand/react/shallow";

export function PageHeader({ title, onSearch }: { title?: string; onSearch?: () => void }) {
  const error = useConfigStore((s) => s.error);

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 h-4 data-vertical:self-auto" />
        <h1 className="text-base font-medium">{title ?? "Settings"}</h1>

        {error && (
          <div className="ml-4 flex items-center gap-1.5 text-sm text-destructive">
            <AlertCircle className="size-4" />
            <span className="truncate max-w-80">{error}</span>
          </div>
        )}

        <div className="ml-auto flex items-center gap-1">
          {onSearch && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onSearch}
              title="Search settings (Ctrl+K)"
            >
              <SearchIcon className="size-4" />
            </Button>
          )}
          <HistoryButtons />
          <ApplyButton />
        </div>
      </div>
    </header>
  );
}

function HistoryButtons() {
  const canUndo = useStore(useConfigStore.temporal, (s) => s.pastStates.length > 0);
  const canRedo = useStore(useConfigStore.temporal, (s) => s.futureStates.length > 0);

  const dirty = useConfigStore((s) => s.dirty);
  const loading = useConfigStore((s) => s.loading);
  const load = useConfigStore((s) => s.load);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;
      const { undo, redo } = useConfigStore.temporal.getState();
      if (isMod && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if (isMod && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => useConfigStore.temporal.getState().undo()}
        disabled={!canUndo}
        title="Undo (Ctrl+Z)"
      >
        <Undo2 className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => useConfigStore.temporal.getState().redo()}
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
