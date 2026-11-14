import { useState, useEffect } from "react";
import { Plus, Search, AlertTriangle, X } from "lucide-react";
import { cn } from "cn";
import { useShallow } from "zustand/react/shallow";
import { useConfigStore } from "@/lib/config/store";
import { parseModifiers, serializeModifiers, bindingsConflict } from "@/lib/keybind-parse";
import { DISPATCHER_MAP, categoryLabel } from "@/lib/dispatchers";
import { DISPATCHER_CATEGORY_ORDER } from "@mangowm.github.io/config/catalog";
import type { Keybinding } from "@/lib/keybind-types";
import type { PanelProps } from "@/lib/presentation/section-types";
import { useFocusField } from "@/lib/use-focus-field";
import { useBindingEntries } from "./hooks/useBindingEntries";
import { useFilterBindings } from "./hooks/useFilterBindings";
import { FilterPill } from "./components/FilterPill";
import { BindingRow } from "./components/BindingRow";
import { EditDialog } from "./dialogs/EditDialog";
import { Button } from "@mangowm/ui/components/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@mangowm/ui/components/input-group";

export function BindingsPanel({ focusKey }: PanelProps) {
  const fieldRef = useFocusField(focusKey);

  const files = useConfigStore(useShallow((s) => s.files));
  const insertEntry = useConfigStore((s) => s.insertEntry);
  const updateEntry = useConfigStore((s) => s.updateEntry);
  const removeEntry = useConfigStore((s) => s.removeEntry);

  const allEntries = useBindingEntries(files);

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeMode, setActiveMode] = useState("All");
  const [showConflicts, setShowConflicts] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Keybinding | null>(null);

  const conflictIds = new Set<string>();
  // Mango compares same-key bindings across modes: a `common` binding collides
  // with the same key in ANY mode. Group by mods+key, then flag each pair.
  const groups = new Map<string, Keybinding[]>();
  allEntries.forEach((e) => {
    if (e.type !== "keyboard") return;
    const mods = serializeModifiers(parseModifiers(e.mods));
    const signature = `${mods}|${e.key}`;
    const group = groups.get(signature);
    if (group) group.push(e);
    else groups.set(signature, [e]);
  });
  groups.forEach((group) => {
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        if (bindingsConflict(group[i], group[j])) {
          conflictIds.add(group[i].id);
          conflictIds.add(group[j].id);
        }
      }
    }
  });

  const categoriesSet = new Set<string>();
  const modesSet = new Set<string>();
  allEntries.forEach((e) => {
    categoriesSet.add(DISPATCHER_MAP.get(e.func)?.category ?? "other");
    modesSet.add(e.mode);
  });
  const knownCats = DISPATCHER_CATEGORY_ORDER.filter((category) => categoriesSet.has(category));
  const otherCats = Array.from(categoriesSet)
    .filter((category) => !(DISPATCHER_CATEGORY_ORDER as readonly string[]).includes(category))
    .sort();
  const cats = ["All", ...knownCats, ...otherCats];
  const modes = ["All", ...Array.from(modesSet).sort()];

  useEffect(() => {
    if (activeMode !== "All" && !modes.includes(activeMode)) {
      setActiveMode("All");
    }
    if (activeCategory !== "All" && !cats.includes(activeCategory)) {
      setActiveCategory("All");
    }
    if (showConflicts && conflictIds.size === 0) {
      setShowConflicts(false);
    }
  }, [modes, cats, conflictIds.size, activeMode, activeCategory, showConflicts]);

  const baseFiltered = useFilterBindings(allEntries, search, activeCategory, activeMode);
  const filtered = showConflicts ? baseFiltered.filter((e) => conflictIds.has(e.id)) : baseFiltered;

  const grouped = new Map<string, Keybinding[]>();
  filtered.forEach((e) => {
    const cat = DISPATCHER_MAP.get(e.func)?.category ?? "other";
    const arr = grouped.get(cat) ?? [];
    arr.push(e);
    grouped.set(cat, arr);
  });

  const hasMultipleModes = modes.length > 2;
  const existingModes = modes.filter((m) => m !== "All");

  const handleDelete = (entry: Keybinding) => {
    removeEntry(entry.keyword, entry.ordinal);
  };

  const handleOpenDialog = (entry?: Keybinding) => {
    setEditingEntry(entry ?? null);
    setDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) setEditingEntry(null);
  };

  const clearAllFilters = () => {
    setSearch("");
    setActiveCategory("All");
    setActiveMode("All");
    setShowConflicts(false);
  };

  return (
    <div ref={fieldRef("bindings")} className="flex h-full flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Bindings</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Configure keyboard shortcuts, mouse buttons, scroll actions, and gesture bindings.
            </p>
          </div>
        </div>

        {hasMultipleModes && (
          <div className="flex scrollbar-none items-center overflow-x-auto border-b border-border/40">
            {modes.map((m) => {
              const isActive = activeMode === m;
              return (
                <button
                  key={m}
                  onClick={() => setActiveMode(m)}
                  className={cn(
                    "border-b-2 px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors select-none",
                    isActive
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:border-border/60 hover:text-foreground",
                  )}
                >
                  {m === "All" ? "All" : m}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <InputGroup className="h-9 w-full border-border/60 bg-background shadow-sm">
            <InputGroupAddon>
              <Search className="size-4 text-muted-foreground/40" />
            </InputGroupAddon>
            <InputGroupInput
              type="text"
              role="search"
              aria-label="Search bindings"
              placeholder={`Search in ${activeMode === "All" ? "all modes" : `'${activeMode}'`}…`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-sm placeholder:text-muted-foreground/40"
            />
            {search && (
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  size="icon-xs"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                >
                  <X className="size-3.5" />
                </InputGroupButton>
              </InputGroupAddon>
            )}
          </InputGroup>

          <Button
            size="sm"
            className="w-full shrink-0 gap-1.5 shadow-sm sm:w-auto"
            onClick={() => handleOpenDialog()}
          >
            <Plus className="size-4" />
            <span>New Binding</span>
          </Button>

          {conflictIds.size > 0 && (
            <button
              onClick={() => setShowConflicts(!showConflicts)}
              className={cn(
                "inline-flex w-full shrink-0 items-center rounded-lg font-medium select-none sm:w-auto",
                "h-9 border px-3 text-xs shadow-sm transition-all duration-200",
                "focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:outline-none",
                showConflicts
                  ? "border-destructive bg-destructive text-destructive-foreground"
                  : "border-destructive/20 bg-background text-destructive hover:bg-destructive/10",
              )}
            >
              <AlertTriangle className="mr-2 size-3.5" />
              {conflictIds.size} Conflicting
            </button>
          )}
        </div>

        <div
          role="tablist"
          aria-label="Filter by category"
          className="flex flex-wrap items-center gap-1.5"
        >
          {cats.map((cat) => (
            <FilterPill
              key={cat}
              label={cat === "All" ? cat : categoryLabel(cat)}
              active={activeCategory === cat}
              onClick={() => setActiveCategory(cat)}
            />
          ))}
        </div>
      </div>

      <div className="mt-2 flex-1 pb-10">
        {allEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/60 bg-muted/5 py-16 text-center">
            <div className="rounded-full border border-border/50 bg-background p-3 shadow-sm">
              <Plus className="size-6 text-muted-foreground/50" aria-hidden="true" />
            </div>
            <div className="max-w-[200px]">
              <h3 className="mb-1 text-sm font-medium text-foreground">No bindings yet</h3>
              <p className="mb-4 text-xs text-muted-foreground">
                Create your first custom binding to get started.
              </p>
              <Button size="sm" className="w-full" onClick={() => handleOpenDialog()}>
                Add Binding
              </Button>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/60 bg-muted/5 py-16 text-center">
            {showConflicts ? (
              <AlertTriangle className="mb-2 size-8 text-muted-foreground/30" aria-hidden="true" />
            ) : (
              <Search className="mb-2 size-8 text-muted-foreground/30" aria-hidden="true" />
            )}

            <h3 className="text-sm font-medium text-foreground">No matches found</h3>
            <p className="max-w-[300px] text-xs text-muted-foreground">
              {showConflicts
                ? "There are conflicts globally, but none match your current search or category filters."
                : "We couldn't find any bindings matching your current filters and search query."}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={clearAllFilters}>
                Clear all filters
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between px-1 text-[11px] font-medium text-muted-foreground/60">
              <span>
                Showing {filtered.length} binding{filtered.length !== 1 ? "s" : ""}
                {activeMode !== "All" && (
                  <span className="font-semibold text-foreground/80"> in '{activeMode}'</span>
                )}
                {showConflicts && (
                  <span className="font-semibold text-destructive/80"> (Conflicts Only)</span>
                )}
              </span>
            </div>

            {[...grouped.entries()].map(([category, items]) => (
              <section key={category} aria-label={categoryLabel(category)}>
                <div className="mb-2 flex items-center gap-2 px-1">
                  <h3 className="text-[12px] font-semibold tracking-widest text-muted-foreground/70 uppercase">
                    {categoryLabel(category)}
                  </h3>
                  <div className="ml-2 h-px flex-1 bg-border/40" />
                </div>
                <div className="divide-y divide-border/30 overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm transition-all hover:shadow-md">
                  {items.map((e) => (
                    <div key={e.id} ref={fieldRef(e.id)}>
                      <BindingRow
                        entry={e}
                        hasConflict={conflictIds.has(e.id)}
                        onEdit={() => handleOpenDialog(e)}
                        onDelete={() => handleDelete(e)}
                      />
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      <EditDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        insertEntry={insertEntry}
        updateEntry={updateEntry}
        removeEntry={removeEntry}
        files={files}
        existingModes={existingModes}
        allEntries={allEntries}
        editingEntry={editingEntry}
      />
    </div>
  );
}
