import { useEffect, useState } from "react";
import { ChevronDownIcon, PlusIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

interface ModeComboboxProps {
  value: string;
  existingModes: string[];
  onChange: (val: string) => void;
}

export function ModeCombobox({ value, existingModes, onChange }: ModeComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(value);

  useEffect(() => {
    setSearch(value);
  }, [value]);

  const q = search.trim().toLowerCase();
  const filtered = existingModes.filter((m) => m.toLowerCase().includes(q));
  const isNew = q !== "" && !existingModes.includes(search.trim());

  const select = (mode: string) => {
    onChange(mode);
    setOpen(false);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setSearch(value);
      }}
    >
      <PopoverTrigger
        role="combobox"
        aria-expanded={open}
        className={cn(
          "flex h-11 w-full items-center justify-between gap-2 rounded-lg border border-border/40 px-3 text-sm transition-all",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
          value ? "bg-card hover:bg-accent/40" : "bg-muted/30 hover:bg-muted/50",
        )}
      >
        <span className="min-w-0 truncate font-mono text-foreground">{value || "default"}</span>
        <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground/50" />
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={6}
        className="w-56 rounded-xl border-border/60 bg-background/95 p-0 shadow-xl backdrop-blur-xl"
      >
        <Command className="border-0 bg-transparent" shouldFilter={false}>
          <CommandInput autoFocus value={search} onValueChange={setSearch} placeholder="default" />
          <CommandList className="scrollbar-thin max-h-[180px] pt-2">
            {filtered.length === 0 && !isNew && <CommandEmpty>No matching modes</CommandEmpty>}
            {filtered.map((m) => (
              <CommandItem key={m} value={m} onSelect={() => select(m)}>
                <span className="font-mono">{m}</span>
              </CommandItem>
            ))}
            {isNew && (
              <CommandItem value={search.trim()} onSelect={() => select(search.trim())}>
                <PlusIcon className="size-3.5 text-primary" />
                <span>Add &quot;{search.trim()}&quot;</span>
              </CommandItem>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
