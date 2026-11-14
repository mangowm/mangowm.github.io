import { useCallback, useEffect, useRef, useState } from "react";
import { SettingsIcon, TerminalSquareIcon } from "lucide-react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@mangowm/ui/components/command";
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
  const staticResults = results.filter((r) => r.tier === "static");
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
    <CommandDialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) setQuery("");
      }}
      title="Search settings"
      description="Search settings, commands, env vars"
      className="top-[15vh] -translate-y-0 gap-0 overflow-hidden p-0 sm:max-w-[580px]"
      overlayClassName="bg-black/60 backdrop-blur-sm supports-backdrop-filter:backdrop-blur-sm"
    >
      <Command shouldFilter={false} label="Search settings" className="bg-transparent p-0">
        <CommandInput
          variant="plain"
          value={query}
          onValueChange={handleValueChange}
          placeholder="Search settings, commands, env vars…"
          autoFocus
        />

        <CommandList ref={listRef} className="max-h-96 overflow-y-auto p-2">
          {query.trim() === "" && (
            <div className="py-8 text-center text-sm text-muted-foreground/50">
              Type to search settings, commands, env vars…
            </div>
          )}

          {query.trim() !== "" && results.length === 0 && (
            <CommandEmpty className="py-8 text-center text-sm text-muted-foreground/60">
              No results for &ldquo;{query}&rdquo;
            </CommandEmpty>
          )}

          {staticResults.length > 0 && (
            <CommandGroup
              heading={
                <span className="flex items-center gap-1.5 px-1 py-1 text-[10px] font-semibold tracking-widest text-muted-foreground/50 uppercase">
                  <SettingsIcon className="size-3" /> Settings
                </span>
              }
            >
              {staticResults.map((item) => (
                <ResultItem key={item.id} item={item} onSelect={handleSelect} />
              ))}
            </CommandGroup>
          )}

          {dynamicResults.length > 0 && (
            <CommandGroup
              heading={
                <span className="flex items-center gap-1.5 px-1 py-1 text-[10px] font-semibold tracking-widest text-muted-foreground/50 uppercase">
                  <TerminalSquareIcon className="size-3" /> Your config
                </span>
              }
            >
              {dynamicResults.map((item) => (
                <ResultItem key={item.id} item={item} onSelect={handleSelect} />
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
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
    <CommandItem
      value={item.id}
      onSelect={() => onSelect(item)}
      className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors duration-100 aria-selected:bg-accent aria-selected:text-accent-foreground data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground"
    >
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-medium text-foreground">{item.label}</span>
        {item.description && (
          <span className="truncate text-[11px] text-muted-foreground/60">{item.description}</span>
        )}
      </div>

      <span className="shrink-0 rounded-sm border border-border/30 bg-muted/40 px-2 py-0.5 text-[10px] font-medium tracking-wider text-muted-foreground/50 uppercase">
        {item.sectionLabel}
      </span>
    </CommandItem>
  );
}
