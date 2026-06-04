import { useState, useEffect, useRef, useMemo } from "react";
import { Play, ChevronsUpDown, Check } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import type { DispatcherInfo } from "@/lib/dispatchers";

interface ActionSelectorProps {
  value: string;
  onChange: (v: string) => void;
}

export function ActionSelector({ value, onChange }: ActionSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [popoverWidth, setPopoverWidth] = useState<number>();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const categories = useMemo(() => getDispatchersByCategory(), []);

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
        render={
          <button
            ref={triggerRef}
            role="combobox"
            aria-expanded={open}
            className={cn(
              "flex w-full items-center justify-between h-11 rounded-lg px-3.5 text-sm transition-colors",
              "hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              value ? "text-foreground" : "text-muted-foreground",
            )}
          >
            <div className="flex items-center gap-3 truncate">
              <Play className="size-4 text-muted-foreground shrink-0" />
              {value ? (
                <span className="font-mono font-medium truncate">{value}</span>
              ) : (
                <span className="truncate">Select a system action or command...</span>
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </button>
        }
      />
      <PopoverContent
        className="p-0 rounded-xl shadow-lg border-border/50"
        align="start"
        sideOffset={4}
        style={{ width: popoverWidth }}
      >
        <Command className="border-0" shouldFilter={false}>
          <CommandInput
            placeholder="Search dispatchers..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            className="h-10 text-sm focus:ring-0"
          />
          <CommandList className="max-h-[280px]">
            {q && !hasResults && (
              <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                No actions found.
              </CommandEmpty>
            )}
            {filtered.map(({ category, items }) => (
              <CommandGroup
                key={category}
                heading={
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground/45">
                    {category}
                  </span>
                }
              >
                {items.map(({ d }) => (
                  <CommandItem
                    key={d.name}
                    value={d.name}
                    onSelect={() => {
                      onChange(d.name);
                      setOpen(false);
                    }}
                    className="flex-col items-start cursor-pointer"
                  >
                    <div className="flex items-center w-full gap-2">
                      <span className="font-mono text-sm font-medium truncate">{d.name}</span>
                      {value === d.name && (
                        <Check className="ml-auto size-3.5 shrink-0 text-primary" />
                      )}
                    </div>
                    <span className="text-[11px] text-muted-foreground/60 line-clamp-1">
                      {d.description}
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
