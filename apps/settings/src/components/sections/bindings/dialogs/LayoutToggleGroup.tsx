import { cn } from "cn";
import { useConfigStore, useConfigStr } from "@/lib/config/store";
import { LAYOUT_NAMES } from "@/lib/dispatchers/types";
import { ToggleGroup, ToggleGroupItem } from "@mangowm/ui/components/toggle-group";

export function LayoutToggleGroup() {
  const setValue = useConfigStore((s) => s.setValue);

  const raw = useConfigStr("circle_layout", "");

  const activeLayouts = raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  const activeSet = new Set(activeLayouts);

  return (
    <ToggleGroup
      multiple
      value={activeLayouts}
      onValueChange={(value) => setValue("circle_layout", value.join(","))}
      className="flex flex-wrap gap-1.5 px-4 py-3"
    >
      {LAYOUT_NAMES.map((name) => {
        const active = activeSet.has(name);
        return (
          <ToggleGroupItem
            key={name}
            value={name}
            className={cn(
              "flex h-8 items-center justify-center rounded-lg border px-3 text-[12px] font-medium transition-all duration-100 select-none",
              active
                ? "border-primary/30 bg-primary text-primary-foreground shadow-sm"
                : "border-dashed border-muted-foreground/25 bg-transparent text-muted-foreground/55 hover:border-muted-foreground/50 hover:bg-muted/30 hover:text-muted-foreground/75",
            )}
          >
            {name}
          </ToggleGroupItem>
        );
      })}
    </ToggleGroup>
  );
}
