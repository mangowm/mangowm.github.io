import { useEffect, useRef, useCallback, useState } from "react";
import { Command } from "cmdk";
import { SearchIcon, SettingsIcon, TerminalSquareIcon } from "lucide-react";
import { useSearch, type SearchResult } from "@/lib/search-engine";

export interface SearchSelection {
  sectionId: string;
  configKey?: string;
}

interface SearchCommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (selection: SearchSelection) => void;
}

export function SearchCommand({ open, onOpenChange, onSelect }: SearchCommandProps) {
  const [query, setQuery] = useState("");
  const search = useSearch();
  const listRef = useRef<HTMLDivElement>(null);

  const results = query.trim() ? search(query) : [];
  const staticResults  = results.filter((r) => r.tier === "static");
  const dynamicResults = results.filter((r) => r.tier === "dynamic");

  const handleSelect = useCallback(
    (item: SearchResult) => {
      onSelect({ sectionId: item.sectionId, configKey: item.configKey || undefined });
      onOpenChange(false);
      setQuery("");
    },
    [onSelect, onOpenChange],
  );

  useEffect(() => {
    if (open) {
      setQuery("");
      requestAnimationFrame(() => listRef.current?.scrollTo({ top: 0 }));
    }
  }, [open]);

  const handleValueChange = useCallback((val: string) => {
    setQuery(val);
    requestAnimationFrame(() => listRef.current?.scrollTo({ top: 0 }));
  }, []);

  return (
    <Command.Dialog
      open={open}
      onOpenChange={(o) => { onOpenChange(o); if (!o) setQuery(""); }}
      label="Search settings"
      shouldFilter={false}
      overlayClassName="fixed inset-0 bg-black/60 backdrop-blur-sm"
      contentClassName="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
    >
      <div className="w-[580px] overflow-hidden rounded-xl border border-border/50 bg-popover shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center gap-2 border-b border-border/30 px-4">
          <SearchIcon className="size-4 shrink-0 text-muted-foreground/60" />
          <Command.Input
            value={query}
            onValueChange={handleValueChange}
            placeholder="Search settings, commands, env vars…"
            className="h-11 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/40"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        <Command.List ref={listRef} className="max-h-96 overflow-y-auto p-2">
          {query.trim() === "" && (
            <div className="py-8 text-center text-sm text-muted-foreground/50">
              Type to search settings, commands, env vars…
            </div>
          )}

          {query.trim() !== "" && results.length === 0 && (
            <Command.Empty className="py-8 text-center text-sm text-muted-foreground/60">
              No results for &ldquo;{query}&rdquo;
            </Command.Empty>
          )}

          {staticResults.length > 0 && (
            <Command.Group
              heading={
                <span className="flex items-center gap-1.5 px-1 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                  <SettingsIcon className="size-3" /> Settings
                </span>
              }
            >
              {staticResults.map((item) => (
                <ResultItem key={item.id} item={item} onSelect={handleSelect} />
              ))}
            </Command.Group>
          )}

          {dynamicResults.length > 0 && (
            <Command.Group
              heading={
                <span className="flex items-center gap-1.5 px-1 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                  <TerminalSquareIcon className="size-3" /> Your config
                </span>
              }
            >
              {dynamicResults.map((item) => (
                <ResultItem key={item.id} item={item} onSelect={handleSelect} />
              ))}
            </Command.Group>
          )}
        </Command.List>

        <div className="border-t border-border/20 px-4 py-2 flex gap-4 text-[10px] text-muted-foreground/40">
          <span><kbd className="font-mono">↑↓</kbd> navigate</span>
          <span><kbd className="font-mono">↵</kbd> select</span>
          <span><kbd className="font-mono">Esc</kbd> close</span>
        </div>
      </div>
    </Command.Dialog>
  );
}

function ResultItem({
  item,
  onSelect,
}: {
  item: SearchResult;
  onSelect: (item: SearchResult) => void;
}) {
  return (
    <Command.Item
      key={item.id}
      value={item.id}
      onSelect={() => onSelect(item)}
      className="group flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground aria-selected:bg-accent aria-selected:text-accent-foreground transition-colors duration-100"
    >
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-medium text-foreground">{item.label}</span>
        {item.description && (
          <span className="truncate text-[11px] text-muted-foreground/60">
            {item.description}
          </span>
        )}
      </div>

      <span className="shrink-0 rounded-md border border-border/30 bg-muted/40 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">
        {item.sectionLabel}
      </span>

      <kbd className="hidden shrink-0 items-center gap-0.5 rounded-md border border-border/20 bg-muted/30 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground/40 group-aria-selected:flex group-data-[selected=true]:flex">
        ↵
      </kbd>
    </Command.Item>
  );
}

export function useSearchShortcut(onOpen: () => void) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpen();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onOpen]);
}
