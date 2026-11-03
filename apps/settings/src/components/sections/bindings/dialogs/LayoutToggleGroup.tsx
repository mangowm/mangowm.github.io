import { cn } from "cn";
import { useConfigStore, useConfigStr } from "@/lib/config/store";
import { LAYOUT_NAMES } from "@/lib/dispatchers/types";

export function LayoutToggleGroup() {
  const setValue = useConfigStore((s) => s.setValue);

  const raw = useConfigStr("circle_layout", "");

  const activeLayouts = raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  const activeSet = new Set(activeLayouts);

  const inactiveLayouts = LAYOUT_NAMES.filter((name) => !activeSet.has(name));

  const toggle = (name: string) => {
    if (activeSet.has(name)) {
      setValue("circle_layout", activeLayouts.filter((l) => l !== name).join(","));
    } else {
      setValue("circle_layout", [...activeLayouts, name].join(","));
    }
  };

  return (
    <div className="flex flex-wrap gap-1.5 px-4 py-3">
      {activeLayouts.map((name) => (
        <button
          key={name}
          type="button"
          onClick={() => toggle(name)}
          className={cn(
            "flex h-8 items-center justify-center rounded-lg border px-3 text-[12px] font-medium transition-all duration-100 select-none",
            "border-primary/30 bg-primary text-primary-foreground shadow-sm",
          )}
        >
          {name}
        </button>
      ))}

      {inactiveLayouts.length > 0 && activeLayouts.length > 0 && (
        <span className="mx-1 w-px self-stretch bg-border/30" />
      )}
      {inactiveLayouts.map((name) => (
        <button
          key={name}
          type="button"
          onClick={() => toggle(name)}
          className={cn(
            "flex h-8 items-center justify-center rounded-lg border px-3 text-[12px] font-medium transition-all duration-100 select-none",
            "border-dashed border-muted-foreground/25 bg-transparent text-muted-foreground/55 hover:border-muted-foreground/50 hover:bg-muted/30 hover:text-muted-foreground/75",
          )}
        >
          {name}
        </button>
      ))}
    </div>
  );
}
