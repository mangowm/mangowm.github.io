import { useState, useCallback, useMemo, useEffect } from "react";
import { Plus, Search, AlertTriangle, X } from "lucide-react";
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
  
  // --- Store Actions & Data ---
  const files = useConfigStore((s) => s.files);
  const insertEntry = useConfigStore((s) => s.insertEntry);
  const updateEntry = useConfigStore((s) => s.updateEntry);
  const removeEntry = useConfigStore((s) => s.removeEntry);

  const allEntries = useBindingEntries(files);

  // --- UI State ---
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeMode, setActiveMode] = useState("All");
  const [showConflicts, setShowConflicts] = useState(false);
  
  // --- Dialog State ---
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Keybinding | null>(null);

  // --- OPTIMIZATIONS & DERIVATIONS ---

  // 1. O(N) Conflict Detection via Hash Map
  const conflictIds = useMemo(() => {
    const signatureMap = new Map<string, string[]>();
    const ids = new Set<string>();

    allEntries.forEach((e) => {
      const mods = serializeModifiers(parseModifiers(e.mods));
      const signature = `${e.mode}|${mods}|${e.key}`;
      
      const existing = signatureMap.get(signature) || [];
      existing.push(e.id);
      signatureMap.set(signature, existing);
    });

    signatureMap.forEach((matchedIds) => {
      if (matchedIds.length > 1) {
        matchedIds.forEach((id) => ids.add(id));
      }
    });

    return ids;
  }, [allEntries]);

  // 2. Extract available categories and modes dynamically
  const { cats, modes } = useMemo(() => {
    const categories = new Set<string>();
    const availableModes = new Set<string>();

    allEntries.forEach((e) => {
      categories.add(DISPATCHER_MAP.get(e.func)?.category ?? "other");
      availableModes.add(e.mode);
    });

    return {
      cats: ["All", ...Array.from(categories).sort()],
      modes: ["All", ...Array.from(availableModes).sort()],
    };
  }, [allEntries]);

  // 3. Ghost State Resolver
  // Automatically fall back to defaults if active filters point to deleted data.
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

  // 4. Apply all filters
  const baseFiltered = useFilterBindings(allEntries, search, activeCategory, activeMode);
  const filtered = showConflicts
    ? baseFiltered.filter((e) => conflictIds.has(e.id))
    : baseFiltered;

  // 5. Group the final output by category
  const grouped = useMemo(() => {
    const groupMap = new Map<string, Keybinding[]>();
    filtered.forEach((e) => {
      const cat = DISPATCHER_MAP.get(e.func)?.category ?? "other";
      const arr = groupMap.get(cat) ?? [];
      arr.push(e);
      groupMap.set(cat, arr);
    });
    return groupMap;
  }, [filtered]);

  // --- Helpers & Callbacks ---
  const hasMultipleModes = modes.length > 2; // e.g., "All" + "default" + "insert"
  const existingModes = useMemo(() => modes.filter(m => m !== "All"), [modes]);
  
  const handleDelete = useCallback((entry: Keybinding) => {
    removeEntry(entry.keyword, entry.ordinal);
  }, [removeEntry]);

  const handleOpenDialog = useCallback((entry?: Keybinding) => {
    setEditingEntry(entry ?? null);
    setDialogOpen(true);
  }, []);

  const handleDialogClose = useCallback((open: boolean) => {
    setDialogOpen(open);
    if (!open) setEditingEntry(null);
  }, []);

  const clearAllFilters = useCallback(() => {
    setSearch("");
    setActiveCategory("All");
    setActiveMode("All");
    setShowConflicts(false);
  }, []);

  return (
    <div ref={fieldRef("keybindings")} className="flex flex-col h-full gap-6">
      
      {/* ========================================== */}
      {/* HEADER & PRIMARY CONTEXT (MODE TABS)       */}
      {/* ========================================== */}
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Keybindings
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-prose">
              Manage system shortcuts, window rules, and custom shell scripts.
            </p>
          </div>
        </div>

        {/* Clean Mode Tabs */}
        {hasMultipleModes && (
          <div className="flex items-center border-b border-border/40 overflow-x-auto scrollbar-none">
            {modes.map((m) => {
              const isActive = activeMode === m;
              return (
                <button
                  key={m}
                  onClick={() => setActiveMode(m)}
                  className={cn(
                    "px-4 py-2 text-sm font-medium transition-colors select-none whitespace-nowrap border-b-2",
                    isActive
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border/60"
                  )}
                >
                  {m === "All" ? "All" : m}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================== */}
      {/* SECONDARY CONTROLS (COMPACT TOOLBAR)       */}
      {/* ========================================== */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          
          {/* Search Bar with Clear Button */}
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40" />
            <input
              type="text"
              role="search"
              placeholder={`Search in ${activeMode === 'All' ? 'all modes' : `'${activeMode}'`}…`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={cn(
                "h-9 w-full rounded-lg border bg-background pl-9 pr-8 text-sm",
                "border-border/60 text-foreground placeholder:text-muted-foreground/40 shadow-sm",
                "transition-all duration-200",
                "focus:outline-none focus:border-ring/50 focus:ring-2 focus:ring-ring/20",
              )}
            />
            {search && (
              <button 
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground/50 hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
          
          <Button size="sm" className="shrink-0 gap-1.5 shadow-sm w-full sm:w-auto" onClick={() => handleOpenDialog()}>
            <Plus className="size-4" />
            <span>Add Binding</span>
          </Button>

          {/* Global Conflict Toggle (Hidden if 0 total conflicts) */}
          {conflictIds.size > 0 && (
            <button
              onClick={() => setShowConflicts(!showConflicts)}
              className={cn(
                "inline-flex items-center shrink-0 rounded-lg font-medium select-none w-full sm:w-auto",
                "transition-all duration-200 h-9 px-3 text-xs border shadow-sm",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20",
                showConflicts
                  ? "bg-destructive text-destructive-foreground border-destructive"
                  : "bg-background text-destructive hover:bg-destructive/10 border-destructive/20",
              )}
            >
              <AlertTriangle className="size-3.5 mr-2" />
              {conflictIds.size} Conflicting
            </button>
          )}
        </div>

        {/* Clean Category Pills */}
        <div
          role="tablist"
          aria-label="Filter by category"
          className="flex items-center gap-1.5 flex-wrap"
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

      {/* ========================================== */}
      {/* CONTENT LIST & INTELLIGENT EMPTY STATES    */}
      {/* ========================================== */}
      <div className="flex-1 pb-10 mt-2">
        {allEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/60 bg-muted/5 py-16 text-center">
            <div className="p-3 bg-background rounded-full border border-border/50 shadow-sm">
              <Plus className="size-6 text-muted-foreground/50" aria-hidden="true" />
            </div>
            <div className="max-w-[200px]">
              <h3 className="text-sm font-medium text-foreground mb-1">No bindings yet</h3>
              <p className="text-xs text-muted-foreground mb-4">Create your first custom keybinding to get started.</p>
              <Button size="sm" className="w-full" onClick={() => handleOpenDialog()}>
                Add Keybinding
              </Button>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/60 bg-muted/5 py-16 text-center">
            {showConflicts ? (
               <AlertTriangle className="size-8 text-muted-foreground/30 mb-2" aria-hidden="true" />
            ) : (
               <Search className="size-8 text-muted-foreground/30 mb-2" aria-hidden="true" />
            )}
            
            <h3 className="text-sm font-medium text-foreground">No matches found</h3>
            <p className="text-xs text-muted-foreground max-w-[300px]">
              {showConflicts 
                ? "There are conflicts globally, but none match your current search or category filters."
                : "We couldn't find any bindings matching your current filters and search query."}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={clearAllFilters}>
                Clear all filters
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            
            {/* List Header Summary */}
            <div className="text-[11px] font-medium text-muted-foreground/60 flex items-center justify-between px-1">
              <span>
                Showing {filtered.length} binding{filtered.length !== 1 ? 's' : ''} 
                {activeMode !== "All" && <span className="font-semibold text-foreground/80"> in '{activeMode}'</span>}
                {showConflicts && <span className="font-semibold text-destructive/80"> (Conflicts Only)</span>}
              </span>
            </div>
            
            {/* Grouped Lists */}
            {[...grouped.entries()].map(([category, items]) => (
              <section key={category} aria-label={category} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="mb-2 flex items-center gap-2 px-1">
                  <h3 className="text-[12px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                    {category}
                  </h3>
                  <div className="h-px bg-border/40 flex-1 ml-2" />
                </div>
                <div className="rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden divide-y divide-border/30 transition-all hover:shadow-md">
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

      {/* ========================================== */}
      {/* DIALOGS                                    */}
      {/* ========================================== */}
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
