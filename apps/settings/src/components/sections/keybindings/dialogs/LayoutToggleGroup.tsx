import { useMemo, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useConfigStore } from "@/lib/config-store";
import { cfgStr } from "@/lib/config-helpers";
import { LAYOUT_NAMES } from "@/lib/dispatchers/types";

/**
 * Toggle-button group for choosing which layouts switch_layout cycles through.
 *
 * Active pills (included in the cycle) are shown first, followed by inactive
 * pills separated by a thin divider. Click any pill to toggle it on/off.
 */
export function LayoutToggleGroup() {
  const data = useConfigStore((s) => s.data);
  const setValue = useConfigStore((s) => s.setValue);

  const raw = cfgStr(data, "circle_layout", "");

  const activeLayouts = useMemo(
    () => raw.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean),
    [raw],
  );

  const activeSet = useMemo(() => new Set(activeLayouts), [activeLayouts]);

  const inactiveLayouts = useMemo(
    () => LAYOUT_NAMES.filter((name) => !activeSet.has(name)),
    [activeSet],
  );

  const toggle = useCallback(
    (name: string) => {
      if (activeSet.has(name)) {
        setValue("circle_layout", activeLayouts.filter((l) => l !== name).join(","));
      } else {
        setValue("circle_layout", [...activeLayouts, name].join(","));
      }
    },
    [activeLayouts, activeSet, setValue],
  );

  return (
    <div className="flex flex-wrap gap-1.5 px-4 py-3">
      {activeLayouts.map((name) => (
        <button
          key={name}
          type="button"
          onClick={() => toggle(name)}
          className={cn(
            "flex items-center justify-center h-8 rounded-lg border px-3 font-medium select-none transition-all duration-100 text-[12px]",
            "bg-primary text-primary-foreground border-primary/30 shadow-sm",
          )}
        >
          {name}
        </button>
      ))}

      {inactiveLayouts.length > 0 && activeLayouts.length > 0 && (
        <span className="w-px self-stretch mx-1 bg-border/30" />
      )}
      {inactiveLayouts.map((name) => (
        <button
          key={name}
          type="button"
          onClick={() => toggle(name)}
          className={cn(
            "flex items-center justify-center h-8 rounded-lg border px-3 font-medium select-none transition-all duration-100 text-[12px]",
            "border-dashed border-muted-foreground/25 text-muted-foreground/55 bg-transparent hover:bg-muted/30 hover:border-muted-foreground/50 hover:text-muted-foreground/75",
          )}
        >
          {name}
        </button>
      ))}
    </div>
  );
}
