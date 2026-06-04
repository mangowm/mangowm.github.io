import { useState, useCallback, useMemo } from "react";
import { Plus, Search, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useConfigStore } from "@/lib/config-store";
import { parseModifiers, serializeModifiers } from "@/lib/keybind-parse";
import { DISPATCHER_MAP } from "@/lib/dispatchers";
import type { Keybinding } from "@/lib/keybind-types";
import type { PanelProps } from "@/lib/section-types";
import { useFocusField } from "@/lib/use-focus-field";
import { useBindingEntries } from "./hooks/useBindingEntries";
import { useFilterBindings } from "./hooks/useFilterBindings";
import { FilterPill } from "./components/FilterPill";
import { BindingRow } from "./components/BindingRow";
import { EditDialog } from "./dialogs/EditDialog";
import { Button } from "@/components/ui/button";

export function KeybindingsPanel({ focusKey }: PanelProps) {
  const fieldRef = useFocusField(focusKey);
  const files = useConfigStore((s) => s.files);
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
  const conflictIds = useMemo(() => {
    const ids = new Set<string>();
    const normalized = allEntries.map((e) => ({
      id: e.id,
      mode: e.mode,
      mods: serializeModifiers(parseModifiers(e.mods)),
      key: e.key,
    }));
    for (let i = 0; i < normalized.length; i++) {
      for (let j = i + 1; j < normalized.length; j++) {
        const a = normalized[i];
        const b = normalized[j];
        if (a.mode === b.mode && a.mods === b.mods && a.key === b.key) {
          ids.add(a.id);
          ids.add(b.id);
        }
      }
    }
    return ids;
  }, [allEntries]);

  const baseFiltered = useFilterBindings(allEntries, search, activeCategory, activeMode);
  const filtered = showConflicts
    ? baseFiltered.filter((e) => conflictIds.has(e.id))
    : baseFiltered;

  const hasConflicts = conflictIds.size > 0;

  const cats = [
    "All",
    ...Array.from(
      new Set(allEntries.map((e) => DISPATCHER_MAP.get(e.func)?.category ?? "other")),
    ).sort(),
  ];
  const modes = ["All", ...Array.from(new Set(allEntries.map((e) => e.mode))).sort()];
  const hasMultipleModes = modes.length > 2;

  const grouped = new Map<string, Keybinding[]>();
  for (const e of filtered) {
    const cat = DISPATCHER_MAP.get(e.func)?.category ?? "other";
    const arr = grouped.get(cat) ?? [];
    arr.push(e);
    grouped.set(cat, arr);
  }

  const handleDelete = useCallback(
    (entry: Keybinding) => {
      removeEntry(entry.keyword, entry.ordinal);
    },
    [removeEntry],
  );

  const handleOpenDialog = useCallback((entry?: Keybinding) => {
    setEditingEntry(entry ?? null);
    setDialogOpen(true);
  }, []);

  const handleDialogClose = useCallback((open: boolean) => {
    setDialogOpen(open);
    if (!open) setEditingEntry(null);
  }, []);

  const existingModes = [...new Set(allEntries.map((e) => e.mode))];

  return (
    <div ref={fieldRef("keybindings")} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold tracking-tight text-foreground">Keybindings</h2>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-prose">
          Manage system shortcuts, window rules, and custom shell scripts. Click a binding to edit.
        </p>
      </div>

      <div className="relative max-w-lg">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40 transition-colors group-focus-within:text-muted-foreground/60" />
        <input
          type="text"
          role="search"
          placeholder="Search bindings by key, action, or mode…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={cn(
            "h-9 w-full rounded-xl border bg-background pl-10 text-sm",
            "border-border/60 text-foreground placeholder:text-muted-foreground/35",
            "transition-all duration-150",
            "focus:outline-none focus:border-ring/50 focus:ring-2 focus:ring-ring/15",
          )}
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div
            role="tablist"
            aria-label="Filter by category"
            className="flex items-center gap-0.5 overflow-x-auto scrollbar-none -mx-1 px-1"
          >
            {cats.map((cat) => (
              <FilterPill
                key={cat}
                label={cat}
                active={activeCategory === cat}
                onClick={() => setActiveCategory(cat)}
              />
            ))}
          </div>
        </div>

        {hasMultipleModes && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/40 shrink-0">
              Mode
            </span>
            <div
              role="tablist"
              aria-label="Filter by mode"
              className="flex items-center gap-0.5 overflow-x-auto scrollbar-none"
            >
              {modes.map((m) => (
                <FilterPill
                  key={m}
                  label={m}
                  active={activeMode === m}
                  onClick={() => setActiveMode(m)}
                  size="xs"
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {hasConflicts && (
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/40 shrink-0">
            Conflicts
          </span>
          <button
            onClick={() => setShowConflicts(!showConflicts)}
            className={cn(
              "inline-flex items-center shrink-0 rounded-md font-medium select-none",
              "transition-all duration-150 h-7 px-2.5 text-[11px]",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              showConflicts
                ? "bg-destructive text-destructive-foreground shadow-sm"
                : "text-destructive/70 hover:text-destructive hover:bg-destructive/10",
            )}
          >
            <AlertTriangle className="size-3 mr-1.5" />
            {conflictIds.size} conflicting
          </button>
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => handleOpenDialog()}>
          <Plus className="size-3.5" />
          <span>Add Binding</span>
        </Button>
        {filtered.length > 0 && allEntries.length > 0 && (
          <span className="text-[11px] tabular-nums text-muted-foreground/40">
            {filtered.length === allEntries.length
              ? `${allEntries.length} binding${allEntries.length !== 1 ? "s" : ""}`
              : `${filtered.length} of ${allEntries.length} bindings`}
          </span>
        )}
      </div>

      {allEntries.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border/60 py-12 text-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground/25" aria-hidden="true">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <p className="text-sm text-muted-foreground">No bindings configured.</p>
          <Button variant="link" size="sm" className="text-xs" onClick={() => handleOpenDialog()}>
            Add your first keybinding
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border/60 py-12 text-center">
          <Search className="size-6 text-muted-foreground/25" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">
            No bindings match <span className="font-medium text-foreground">"{search}"</span>
            {activeCategory !== "All" && (
              <span> in <span className="font-medium text-foreground">{activeCategory}</span></span>
            )}
            {activeMode !== "All" && (
              <span> for mode <span className="font-medium text-foreground">{activeMode}</span></span>
            )}
          </p>
          <div className="flex items-center gap-2 mt-1">
            {search && <Button variant="link" size="sm" className="text-xs" onClick={() => setSearch("")}>Clear search</Button>}
            {activeCategory !== "All" && (
              <Button variant="link" size="sm" className="text-xs" onClick={() => setActiveCategory("All")}>All categories</Button>
            )}
            {activeMode !== "All" && (
              <Button variant="link" size="sm" className="text-xs" onClick={() => setActiveMode("All")}>All modes</Button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {[...grouped.entries()].map(([category, items]) => (
            <section key={category} aria-label={category}>
              <div className="mb-1.5 flex items-center gap-2 px-0.5">
                <h3 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/45">
                  {category}
                </h3>
                <span className="text-[10px] font-medium tabular-nums text-muted-foreground/30">
                  {items.length}
                </span>
              </div>
              <div className="rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden divide-y divide-border/20">
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
