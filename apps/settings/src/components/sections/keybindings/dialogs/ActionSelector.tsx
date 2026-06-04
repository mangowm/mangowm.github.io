import { useState, useEffect, useRef, useMemo } from "react";
import {
  ChevronsUpDown,
  Check,
  Terminal,
  Monitor,
  Tag,
  LayoutGrid,
  Layers,
  Eye,
  MousePointer2,
  Settings,
  AppWindow,
  Navigation,
  Search,
  Zap,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { getDispatchersByCategory } from "@/lib/dispatchers";
import type { DispatcherInfo, DispatcherCategory } from "@/lib/dispatchers";

interface ActionSelectorProps {
  value: string;
  onChange: (v: string) => void;
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;

  const escapedQuery = escapeRegExp(query.trim());
  const parts = text.split(new RegExp(`(${escapedQuery})`, "gi"));

  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.trim().toLowerCase() ? (
          <span
            key={i}
            className="bg-primary/25 text-primary-foreground font-bold rounded-[2px] px-[1px]"
          >
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

const CategoryIcon = ({
  category,
  className,
}: {
  category: DispatcherCategory | string;
  className?: string;
}) => {
  const icons: Record<string, React.ElementType> = {
    window: AppWindow,
    scratchpad: Layers,
    navigation: Navigation,
    view: Eye,
    tag: Tag,
    monitor: Monitor,
    layout: LayoutGrid,
    floating: MousePointer2,
    spawn: Terminal,
    system: Settings,
  };
  const Icon = icons[category] || Zap;
  return <Icon className={className} />;
};

export function ActionSelector({ value, onChange }: ActionSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [popoverWidth, setPopoverWidth] = useState<number>();
  const triggerRef = useRef<HTMLButtonElement>(null);

  const categories = useMemo(() => getDispatchersByCategory(), []);

  const selectedDispatcher = useMemo(() => {
    if (!value) return null;
    for (const [, items] of categories) {
      const found = items.find((i) => i.name === value);
      if (found) return found;
    }
    return null;
  }, [value, categories]);

  useEffect(() => {
    if (open && triggerRef.current) {
      setPopoverWidth(triggerRef.current.offsetWidth);
      setSearchQuery("");
    }
  }, [open]);

  const q = searchQuery.toLowerCase().trim();
  type ScoredItem = { d: DispatcherInfo; score: number };

  const filtered = useMemo(() => {
    const result: { category: string; items: ScoredItem[] }[] = [];

    if (!q) {
      for (const [cat, items] of categories) {
        result.push({
          category: cat,
          items: items.map((d) => ({ d, score: 0 })),
        });
      }
      return result;
    }

    const scored: ScoredItem[] = [];
    for (const [, items] of categories) {
      for (const d of items) {
        const nameLower = d.name.toLowerCase();
        const descLower = d.description.toLowerCase();
        if (nameLower.includes(q) || descLower.includes(q)) {
          let score = 0;
          if (nameLower === q) score = 4;
          else if (nameLower.startsWith(q)) score = 3;
          else if (nameLower.includes(q)) score = 2;
          else score = 1;
          scored.push({ d, score });
        }
      }
    }

    scored.sort((a, b) => b.score - a.score || a.d.name.localeCompare(b.d.name));

    for (const [cat] of categories) {
      const items = scored.filter((s) => s.d.category === cat);
      if (items.length > 0) {
        result.push({ category: cat, items });
      }
    }

    return result;
  }, [categories, q]);

  const hasResults = filtered.some((g) => g.items.length > 0);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        ref={triggerRef}
        role="combobox"
        aria-expanded={open}
        className={cn(
          "flex w-full items-center justify-between rounded-lg border border-border/40 text-left transition-all",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
          selectedDispatcher
            ? "bg-card hover:bg-accent/40 p-3 shadow-sm"
            : "bg-muted/30 hover:bg-muted/50 p-3 border-dashed",
        )}
      >
        {selectedDispatcher ? (
          <div className="flex items-center gap-3.5 min-w-0 flex-1">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <CategoryIcon category={selectedDispatcher.category} className="size-4.5" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm font-medium text-foreground">
                {selectedDispatcher.name}
              </span>
              <span className="truncate text-xs text-muted-foreground/70">
                {selectedDispatcher.description}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground/50">
              <Search className="size-4" />
            </div>
            <span className="text-sm font-medium">Search and select a system action...</span>
          </div>
        )}
        <ChevronsUpDown className="ml-3 size-4 shrink-0 opacity-40" />
      </PopoverTrigger>

      <PopoverContent
        className="p-0 rounded-xl shadow-xl border-border/60 backdrop-blur-xl bg-background/95"
        align="start"
        sideOffset={6}
        style={{ width: popoverWidth }}
      >
        <Command className="border-0 bg-transparent" shouldFilter={false}>
          <CommandInput
            placeholder="Search dispatchers (e.g. spawn, layout)..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            className="h-11 text-sm focus:ring-0"
          />
          <CommandList className="max-h-[320px] scrollbar-thin">
            {q && !hasResults && (
              <CommandEmpty className="py-8 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                <Search className="size-8 opacity-20 mb-1" />
                <span className="text-sm font-medium">No actions found.</span>
                <span className="text-xs opacity-70">Try a different search term.</span>
              </CommandEmpty>
            )}
            {filtered.map(({ category, items }) => (
              <CommandGroup
                key={category}
                heading={
                  <div className="flex items-center gap-1.5 text-muted-foreground/50">
                    <CategoryIcon category={category} className="size-3.5" />
                    <span className="text-[10px] uppercase tracking-widest font-bold">
                      {category}
                    </span>
                  </div>
                }
                className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2"
              >
                {items.map(({ d }) => (
                  <CommandItem
                    key={d.name}
                    value={d.name}
                    onSelect={() => {
                      onChange(d.name);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex-col items-start cursor-pointer rounded-lg mx-1 my-0.5 px-3 py-2 transition-colors",
                      value === d.name
                        ? "bg-primary/10 data-[selected]:bg-primary/15"
                        : "data-[selected]:bg-muted/50",
                    )}
                  >
                    <div className="flex items-center w-full gap-2">
                      <span
                        className={cn(
                          "font-mono text-[13px] font-semibold truncate transition-colors",
                          value === d.name ? "text-primary" : "text-foreground",
                        )}
                      >
                        <HighlightMatch text={d.name} query={searchQuery} />
                      </span>
                      {value === d.name && (
                        <Check className="ml-auto size-3.5 shrink-0 text-primary" strokeWidth={3} />
                      )}
                    </div>
                    <span
                      className={cn(
                        "text-[11px] mt-0.5 line-clamp-1 transition-colors",
                        value === d.name ? "text-primary/80" : "text-muted-foreground/70",
                      )}
                    >
                      <HighlightMatch text={d.description} query={searchQuery} />
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
