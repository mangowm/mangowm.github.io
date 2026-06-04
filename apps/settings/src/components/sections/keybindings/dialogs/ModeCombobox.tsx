import { useState, useRef, useEffect } from "react";
import { Command } from "cmdk";
import { ChevronDownIcon, PlusIcon } from "lucide-react";

interface ModeComboboxProps {
  value: string;
  existingModes: string[];
  onChange: (val: string) => void;
}

export function ModeCombobox({ value, existingModes, onChange }: ModeComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSearch(value);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        if (search.trim()) onChange(search.trim());
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, search, onChange]);

  const filtered = existingModes.filter((m) => m.toLowerCase().includes(search.toLowerCase()));
  const isNew = search.trim() && !existingModes.includes(search.trim());

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => {
          setOpen(!open);
          if (!open) setTimeout(() => inputRef.current?.focus(), 0);
        }}
        className="flex w-full items-center justify-between h-11 rounded-lg px-3.5 text-sm font-mono transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <span className={value ? "text-foreground" : "text-muted-foreground/60"}>
          {value || "default"}
        </span>
        <ChevronDownIcon className="size-4 text-muted-foreground/50" />
      </button>

      {open && (
        <div className="absolute top-[calc(100%+4px)] z-50 w-full overflow-hidden rounded-xl border border-border/50 bg-popover shadow-xl animate-in fade-in zoom-in-95 duration-100">
          <Command className="flex flex-col overflow-hidden bg-transparent">
            <div className="flex items-center gap-2 border-b border-border/30 px-3 py-2">
              <Command.Input
                ref={inputRef}
                autoFocus
                value={search}
                onValueChange={setSearch}
                placeholder="default"
                className="flex-1 bg-transparent text-sm font-mono outline-none placeholder:text-muted-foreground/40"
              />
            </div>
            <Command.List className="max-h-[180px] overflow-y-auto p-1">
              {filtered.length === 0 && !isNew && (
                <Command.Empty className="py-3 text-center text-xs text-muted-foreground">
                  No matching modes
                </Command.Empty>
              )}
              {filtered.map((m) => (
                <Command.Item
                  key={m}
                  value={m}
                  onSelect={() => {
                    onChange(m);
                    setOpen(false);
                  }}
                  className="flex cursor-pointer items-center rounded-md px-2 py-1.5 text-sm font-mono data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground transition-colors"
                >
                  {m}
                </Command.Item>
              ))}
              {isNew && (
                <Command.Item
                  value={search.trim()}
                  onSelect={() => {
                    onChange(search.trim());
                    setOpen(false);
                  }}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-primary data-[selected=true]:bg-accent transition-colors"
                >
                  <PlusIcon className="size-3.5" />
                  Add &quot;{search.trim()}&quot;
                </Command.Item>
              )}
            </Command.List>
          </Command>
        </div>
      )}
    </div>
  );
}
