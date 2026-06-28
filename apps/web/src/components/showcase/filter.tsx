import { useEffect, useState } from "react";
import showcaseEntries from "@/showcase.json";
import { Check } from "lucide-react";

const VISIBLE = 8;

export function Filter({
  allTags,
  activeTags,
  entries,
  filteredCount,
  onToggle,
  onClear,
}: {
  allTags: string[];
  activeTags: Set<string>;
  entries: typeof showcaseEntries;
  filteredCount: number;
  onToggle: (tag: string) => void;
  onClear: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!expanded) {
      const hasHiddenActive = allTags.slice(VISIBLE).some((t) => activeTags.has(t));
      if (hasHiddenActive) setExpanded(true);
    }
  }, [activeTags, allTags, expanded]);

  const visible = expanded ? allTags : allTags.slice(0, VISIBLE);
  const hidden = allTags.length - VISIBLE;

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center gap-2">
        {visible.map((tag) => {
          const active = activeTags.has(tag);
          const count = entries.filter((e) => e.tags?.includes(tag)).length;
          return (
            <button
              key={tag}
              onClick={() => onToggle(tag)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all duration-150 ${
                active
                  ? "border-fd-primary/60 bg-fd-primary/15 text-fd-primary"
                  : "border-fd-border/50 text-fd-muted-foreground hover:border-fd-border hover:bg-fd-muted/40 hover:text-fd-foreground"
              }`}
            >
              {active && <Check size={8} strokeWidth={3} />}
              {tag}
              <span
                className={`tabular-nums text-[10px] ${
                  active ? "text-fd-primary/65" : "text-fd-muted-foreground/40"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}

        {!expanded && hidden > 0 && (
          <button
            onClick={() => setExpanded(true)}
            className="inline-flex items-center gap-1 rounded-full border border-dashed border-fd-border/40 px-3 py-1 text-xs text-fd-muted-foreground/60 transition-colors hover:border-fd-border hover:text-fd-foreground"
          >
            +{hidden} more
          </button>
        )}

        {expanded && allTags.length > VISIBLE && (
          <button
            onClick={() => setExpanded(false)}
            className="inline-flex items-center gap-1 rounded-full border border-dashed border-fd-border/40 px-3 py-1 text-xs text-fd-muted-foreground/60 transition-colors hover:border-fd-border hover:text-fd-foreground"
          >
            Show less
          </button>
        )}
      </div>

      {activeTags.size > 0 && (
        <div className="flex items-center gap-2.5 text-xs text-fd-muted-foreground/55">
          <span className="tabular-nums">{filteredCount} of {entries.length} shown</span>
          <span className="h-3 w-px bg-fd-border/50" />
          <button onClick={onClear} className="font-medium transition-colors hover:text-fd-foreground">
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
