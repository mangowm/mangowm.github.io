import { cn } from "@/lib/utils";
import { MODIFIER_ORDER } from "@/lib/keybind-parse";

interface ModPillsProps {
  selected: string[];
  onChange: (mods: string[]) => void;
}

export function ModPills({ selected, onChange }: ModPillsProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {MODIFIER_ORDER.map((m) => {
        const active = selected.includes(m);
        return (
          <button
            key={m}
            type="button"
            onClick={() => onChange(active ? selected.filter((x) => x !== m) : [...selected, m])}
            className={cn(
              "flex h-7 items-center rounded-md border px-2.5 text-[10px] font-semibold uppercase tracking-widest transition-all",
              active
                ? "border-primary/30 bg-primary/10 text-primary"
                : "border-dashed border-muted-foreground/30 text-muted-foreground/60 hover:border-primary/40 hover:bg-primary/5 hover:text-primary",
            )}
          >
            {active ? m : `+ ${m}`}
          </button>
        );
      })}
      {selected.length === 0 && (
        <span className="text-[10px] italic text-muted-foreground/40 leading-7">none</span>
      )}
    </div>
  );
}
