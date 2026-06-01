import { useState, useRef, KeyboardEvent, ClipboardEvent } from "react";
import { useConfigStore } from "@/lib/config-store";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Sparkles } from "lucide-react";

// --- Utility Functions ---
function parseEntry(raw: string): [string, string] {
  const idx = raw.indexOf(",");
  return idx === -1 ? [raw, ""] : [raw.slice(0, idx), raw.slice(idx + 1)];
}

function formatEntry(name: string, value: string): string {
  return `${name},${value}`;
}

/**
 * Enforces valid ENV key formatting: Uppercase, no spaces, only A-Z, 0-9, and _
 */
function sanitizeKey(key: string): string {
  return key.toUpperCase().replace(/[^A-Z0-9_]/g, "");
}

// --- Individual Row Component (Crucial for Performance & UX) ---
// By isolating the row, we prevent global re-renders on every keystroke.
function EnvRow({
  raw,
  index,
  updateEntry,
  removeEntry,
}: {
  raw: string;
  index: number;
  updateEntry: (key: "env", idx: number, val: string) => void;
  removeEntry: (key: "env", idx: number) => void;
}) {
  const [initialKey, initialValue] = parseEntry(raw);
  const [localKey, setLocalKey] = useState(initialKey);
  const [localValue, setLocalValue] = useState(initialValue);

  // Sync with global store only on blur or explicit submit, not on keystroke
  const commitChanges = () => {
    const cleanKey = sanitizeKey(localKey);
    if (!cleanKey) {
      // If user clears the key, revert to initial to prevent broken state
      setLocalKey(initialKey);
      setLocalValue(initialValue);
      return;
    }
    updateEntry("env", index, formatEntry(cleanKey, localValue));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur(); // Triggers the onBlur commit
    }
  };

  return (
    <div className="group relative flex items-center justify-between gap-3 rounded-lg border border-transparent px-3 py-1.5 transition-colors hover:bg-muted/30 focus-within:bg-muted/30 focus-within:border-border/50">
      <div className="flex flex-1 items-center gap-3 w-full">
        <input
          value={localKey}
          onChange={(e) => setLocalKey(sanitizeKey(e.target.value))}
          onBlur={commitChanges}
          onKeyDown={handleKeyDown}
          className="w-1/3 bg-transparent px-2 py-1 font-mono text-[13px] font-medium text-foreground outline-none focus:bg-background focus:ring-1 focus:ring-ring/40 rounded transition-all placeholder:text-muted-foreground/30"
          placeholder="KEY"
          spellCheck={false}
        />
        <span className="text-muted-foreground/40 font-mono select-none">=</span>
        <input
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={commitChanges}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent px-2 py-1 font-mono text-[13px] text-muted-foreground focus:text-foreground outline-none focus:bg-background focus:ring-1 focus:ring-ring/40 rounded transition-all placeholder:text-muted-foreground/30"
          placeholder="value"
          spellCheck={false}
        />
      </div>

      <Button
        variant="ghost"
        size="icon"
        onMouseDown={(e) => {
          e.preventDefault(); // Prevents blur from committing right as we delete
          removeEntry("env", index);
        }}
        className="size-8 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 text-muted-foreground hover:bg-destructive/10 hover:text-destructive shrink-0"
        tabIndex={-1} // Keeps tabbing flow clean (key -> value -> next key)
      >
        <Trash2 className="size-3.5" />
      </Button>
    </div>
  );
}

// --- Main Panel Component ---
export function EnvironmentPanel() {
  const envVars = useConfigStore((state) => state.data["env"]) ?? [];
  const addEntry = useConfigStore((state) => state.addEntry);
  const updateEntry = useConfigStore((state) => state.updateEntry);
  const removeEntry = useConfigStore((state) => state.removeEntry);

  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  const keyInputRef = useRef<HTMLInputElement>(null);
  const valueInputRef = useRef<HTMLInputElement>(null);

  const handleAdd = (e?: React.FormEvent) => {
    e?.preventDefault();
    const cleanKey = sanitizeKey(newKey);
    if (cleanKey) {
      addEntry("env", formatEntry(cleanKey, newValue.trim()));
      setNewKey("");
      setNewValue("");
      keyInputRef.current?.focus();
    }
  };

  // Smart Paste: Intercept pasting like "MOZ_ENABLE_WAYLAND=1"
  const handleSmartPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData("text");
    if (pastedText.includes("=")) {
      e.preventDefault();
      const [pastedKey, ...pastedValueArr] = pastedText.split("=");
      setNewKey(sanitizeKey(pastedKey));
      setNewValue(pastedValueArr.join("=")); // Rejoin in case value contains '='

      // Focus value or add button seamlessly
      setTimeout(() => valueInputRef.current?.focus(), 0);
    }
  };

  const addWaylandDefaults = () => {
    const defaults = [
      ["MOZ_ENABLE_WAYLAND", "1"],
      ["XDG_SESSION_TYPE", "wayland"],
      ["QT_QPA_PLATFORM", "wayland"],
    ];
    defaults.forEach(([k, v]) => addEntry("env", formatEntry(k, v)));
  };

  return (
    <div className="mx-auto w-full max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="mb-8 flex flex-col gap-1.5">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Environment Variables
        </h2>
        <p className="text-sm text-muted-foreground">
          Global variables injected into the mangowm session environment.
        </p>
      </div>

      {/* --- ADD NEW VARIABLE (Form) --- */}
      <div className="mb-8 rounded-xl border border-border/50 bg-card p-1.5 shadow-sm">
        <form
          onSubmit={handleAdd}
          className="flex flex-col sm:flex-row items-center gap-2 rounded-lg bg-muted/10 p-2"
        >
          <div className="flex w-full flex-1 items-center gap-2 rounded-md border border-border/40 bg-background/50 px-3 py-2 focus-within:bg-background focus-within:ring-2 focus-within:ring-ring/20 focus-within:border-ring/50 transition-all">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground select-none shrink-0">
              Key
            </span>
            <input
              ref={keyInputRef}
              value={newKey}
              onChange={(e) => setNewKey(sanitizeKey(e.target.value))}
              onPaste={handleSmartPaste}
              placeholder="MOZ_ENABLE_WAYLAND"
              className="w-full bg-transparent text-sm font-mono outline-none placeholder:text-muted-foreground/30"
              spellCheck={false}
            />
          </div>

          <div className="flex w-full flex-1 items-center gap-2 rounded-md border border-border/40 bg-background/50 px-3 py-2 focus-within:bg-background focus-within:ring-2 focus-within:ring-ring/20 focus-within:border-ring/50 transition-all">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground select-none shrink-0">
              Value
            </span>
            <input
              ref={valueInputRef}
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="1"
              className="w-full bg-transparent text-sm font-mono outline-none placeholder:text-muted-foreground/30"
              spellCheck={false}
            />
          </div>

          <Button
            type="submit"
            disabled={!newKey.trim()}
            className="w-full sm:w-auto shrink-0 transition-all shadow-none"
          >
            <Plus className="sm:mr-1.5 size-4" />
            <span className="hidden sm:inline">Add</span>
          </Button>
        </form>
      </div>

      {/* --- EXISTING VARIABLES LIST (Data Grid) --- */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-2 mb-2">
          <h3 className="text-sm font-medium text-foreground">Session Variables</h3>
          <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {envVars.length}
          </span>
        </div>

        {envVars.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/5 py-12 text-center">
            <h4 className="text-sm font-medium text-foreground">No variables defined</h4>
            <p className="mt-1 mb-5 text-sm text-muted-foreground max-w-[280px]">
              Set environment variables here to configure applications running under mangowm.
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={addWaylandDefaults}
              className="gap-2 text-xs"
            >
              <Sparkles className="size-3.5 text-blue-500" />
              Inject Wayland Defaults
            </Button>
          </div>
        ) : (
          <div className="flex flex-col rounded-xl border border-border/50 bg-card p-1 shadow-sm">
            {envVars.map((raw, index) => (
              <EnvRow
                key={`${index}-${raw.split(",")[0]}`} // Unique key forces reset if severely out of sync
                raw={raw}
                index={index}
                updateEntry={updateEntry}
                removeEntry={removeEntry}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
