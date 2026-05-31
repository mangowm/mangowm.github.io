import { useEffect, useRef, useCallback } from "react";
import { Command } from "cmdk";
import { SearchIcon } from "lucide-react";
import { SEARCH_INDEX, type SearchItem } from "@/lib/search-index";
import { SECTIONS } from "@/lib/sections";

interface SearchCommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (item: SearchItem) => void;
}

const keywordMap = new Map(SECTIONS.map((s) => [s.id, s.keywords ?? []]));

export function SearchCommand({ open, onOpenChange, onSelect }: SearchCommandProps) {
  const listRef = useRef<HTMLDivElement>(null);

  const handleSelect = useCallback(
    (item: SearchItem) => {
      onSelect(item);
      onOpenChange(false);
    },
    [onSelect, onOpenChange],
  );

  // cmdk's internal scrollIntoView uses { block: "nearest" }, which won't
  // scroll the top result fully into view after you've scrolled down.
  // rAF ensures our scroll wins after cmdk's own scroll in the same cycle.
  const scrollToTop = useCallback(() => {
    requestAnimationFrame(() => listRef.current?.scrollTo({ top: 0 }));
  }, []);

  // cmdk keeps the DOM mounted when toggling open/closed, so scroll
  // position persists — reset it on open.
  useEffect(() => {
    if (open) scrollToTop();
  }, [open, scrollToTop]);

  return (
    <Command.Dialog
      open={open}
      onOpenChange={onOpenChange}
      label="Search settings"
      overlayClassName="fixed inset-0 bg-black/60 backdrop-blur-sm"
      contentClassName="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
    >
      <div className="w-[580px] overflow-hidden rounded-xl border border-border/50 bg-popover shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center gap-2 border-b border-border/30 px-4">
          <SearchIcon className="size-4 shrink-0 text-muted-foreground/60" />
          <Command.Input
            placeholder="Search settings…"
            className="h-11 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/40"
            autoFocus
            onValueChange={scrollToTop}
          />
        </div>

        <Command.List ref={listRef} className="max-h-80 overflow-y-auto p-2">
          <Command.Empty className="py-8 text-center text-sm text-muted-foreground/60">
            No results found.
          </Command.Empty>

          {SEARCH_INDEX.map((item) => {
            const keywords = keywordMap.get(item.sectionId) ?? [];
            const searchValue = [item.label, item.description, item.configKey, item.sectionLabel, ...keywords]
              .filter(Boolean)
              .join(" ");

            return (
              <Command.Item
                key={item.type === "field" ? `${item.sectionId}-${item.configKey}` : `section-${item.sectionId}`}
                value={searchValue}
                onSelect={() => handleSelect(item)}
                className="group flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground aria-selected:bg-accent aria-selected:text-accent-foreground transition-colors duration-100"
              >
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate font-medium text-foreground">{item.label}</span>
                  {item.description && (
                    <span className="truncate text-[11px] text-muted-foreground/60">{item.description}</span>
                  )}
                </div>
                <span className="shrink-0 rounded-md border border-border/30 bg-muted/40 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">
                  {item.sectionLabel}
                </span>
                {item.type === "section" && (
                  <kbd className="hidden shrink-0 items-center gap-0.5 rounded-md border border-border/20 bg-muted/30 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground/40 group-aria-selected:flex group-data-[selected=true]:flex">
                    ↵
                  </kbd>
                )}
              </Command.Item>
            );
          })}
        </Command.List>
      </div>
    </Command.Dialog>
  );
}

export function useSearchShortcut(onOpen: () => void) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;
      if (isMod && e.key === "k") {
        e.preventDefault();
        onOpen();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onOpen]);
}
