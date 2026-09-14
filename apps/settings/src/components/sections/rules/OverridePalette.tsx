import { useState, useCallback } from "react";
import { Plus } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { getOverridesForRuleType } from "@/lib/rules/metadata";
import type { RuleType, OverrideMeta } from "@/lib/rules/types";

interface OverridePaletteProps {
  ruleType: RuleType;
  usedKeys: Set<string>;
  onSelect: (meta: OverrideMeta) => void;
  onClose: () => void;
}

export function OverridePalette({ ruleType, usedKeys, onSelect, onClose }: OverridePaletteProps) {
  const [query, setQuery] = useState("");

  const allAvailable = getOverridesForRuleType(ruleType).filter((meta) => !usedKeys.has(meta.key));
  const filtered = query.trim()
    ? allAvailable.filter((meta) => {
        const q = query.toLowerCase();
        return (
          meta.key.toLowerCase().includes(q) ||
          meta.label.toLowerCase().includes(q) ||
          meta.description.toLowerCase().includes(q) ||
          meta.aliases?.some((a) => a.toLowerCase().includes(q))
        );
      })
    : allAvailable;

  const grouped = groupBy(filtered, (m) => m.category);

  const handleSelect = useCallback(
    (meta: OverrideMeta) => {
      onSelect(meta);
      onClose();
    },
    [onSelect, onClose],
  );

  return (
    <Command className="rounded-xl border border-border/50 shadow-sm" shouldFilter={false}>
      <CommandInput
        placeholder="Search properties to override..."
        value={query}
        onValueChange={setQuery}
        className="h-10 text-sm focus:ring-0"
      />
      <CommandList className="max-h-72 scrollbar-thin">
        <CommandEmpty className="py-8 text-center text-sm text-muted-foreground">
          {query.trim() ? (
            <>
              <p className="font-medium text-foreground">No matches for &ldquo;{query}&rdquo;</p>
              <p className="mt-1 text-xs text-muted-foreground/60">
                Try searching by property name or description
              </p>
            </>
          ) : (
            <>
              <p className="font-medium text-foreground">All available properties added</p>
              <p className="mt-1 text-xs text-muted-foreground/60">
                Remove an existing override to add it again
              </p>
            </>
          )}
        </CommandEmpty>
        {Object.entries(grouped).map(([category, items]) => (
          <CommandGroup
            key={category}
            heading={
              <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/50">
                {category}
              </span>
            }
            className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5"
          >
            {items.map((meta) => (
              <CommandItem
                key={meta.key}
                value={meta.key}
                onSelect={() => handleSelect(meta)}
                className={cn(
                  "flex items-center gap-3 cursor-pointer rounded-lg mx-0.5 px-3 py-2.5 transition-colors",
                )}
              >
                <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted/50 text-muted-foreground/40 group-hover/command-item:bg-primary/10 group-hover/command-item:text-primary">
                  <Plus className="size-3.5" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate text-[13px] font-medium text-foreground group-hover/command-item:text-primary">
                    {meta.label}
                  </span>
                  <span className="truncate text-[11px] text-muted-foreground/60">
                    {meta.description}
                  </span>
                </div>
                <span className="shrink-0 rounded-md border border-border/30 bg-background/50 px-2 py-1 font-mono text-[10px] font-medium text-muted-foreground/50 shadow-sm group-hover/command-item:border-primary/20 group-hover/command-item:text-primary/70">
                  {meta.key}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </Command>
  );
}

function groupBy<T>(items: T[], fn: (item: T) => string): Record<string, T[]> {
  const groups: Record<string, T[]> = {};
  for (const item of items) {
    const key = fn(item);
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  }
  return groups;
}
