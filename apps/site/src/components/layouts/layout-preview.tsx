import { useEffect, useState } from "react";
import { ChevronDown, Columns2, Rows2 } from "lucide-react";
import { cn } from "cn";
import { Button } from "@mangowm/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@mangowm/ui/components/dropdown-menu";
import { ToggleGroup, ToggleGroupItem } from "@mangowm/ui/components/toggle-group";
import { useReducedMotion } from "@mangowm/ui/hooks/use-reduced-motion";
import { LayoutStage } from "./layout-stage";
import {
  AUTO_PLAY_IDS,
  AUTO_PLAY_INTERVAL,
  DEFAULT_LAYOUT,
  LAYOUTS,
  PRIMARY_LAYOUTS,
  SECONDARY_LAYOUTS,
} from "./registry";
import type { LayoutId, Orientation } from "./types";

export function LayoutPreview() {
  const reducedMotion = useReducedMotion();
  const [activeLayout, setActiveLayout] = useState<LayoutId>(DEFAULT_LAYOUT.id);
  const [orientation, setOrientation] = useState<Orientation>("horizontal");
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const activeDef = LAYOUTS.find((layout) => layout.id === activeLayout) ?? DEFAULT_LAYOUT;
  const isPrimary = PRIMARY_LAYOUTS.some((layout) => layout.id === activeLayout);
  const supportsOrientation = activeDef.supportsOrientation;

  useEffect(() => {
    if (!isAutoPlaying || reducedMotion) return;

    const interval = setInterval(() => {
      setActiveLayout((current) => {
        const index = AUTO_PLAY_IDS.indexOf(current);
        return AUTO_PLAY_IDS[(index + 1) % AUTO_PLAY_IDS.length] ?? DEFAULT_LAYOUT.id;
      });
      setOrientation("horizontal");
    }, AUTO_PLAY_INTERVAL);

    return () => clearInterval(interval);
  }, [isAutoPlaying, reducedMotion]);

  const selectLayout = (id: LayoutId) => {
    setActiveLayout(id);
    setIsAutoPlaying(false);
  };

  const selectOrientation = (value: Orientation) => {
    setOrientation(value);
    setIsAutoPlaying(false);
  };

  return (
    <div className="w-full">
      <div className="mb-3 flex flex-wrap items-center justify-center gap-2">
        <div className="inline-flex max-w-full [scrollbar-width:none] items-center gap-0.5 overflow-x-auto rounded-full border border-border bg-card p-1 [&::-webkit-scrollbar]:hidden">
          <ToggleGroup
            multiple={false}
            spacing={1}
            value={[activeLayout]}
            onValueChange={(value) => {
              const next = value[0];
              if (next) selectLayout(next as LayoutId);
            }}
            className="rounded-full"
          >
            {PRIMARY_LAYOUTS.map((layout) => (
              <ToggleGroupItem
                key={layout.id}
                value={layout.id}
                className="h-auto min-w-0 rounded-full px-3 py-1.5 text-[0.8125rem] font-medium text-muted-foreground hover:bg-transparent hover:text-foreground aria-pressed:bg-primary aria-pressed:font-semibold aria-pressed:text-primary-foreground"
              >
                {layout.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-auto rounded-full px-3 py-1.5 text-[0.8125rem] font-medium text-muted-foreground hover:bg-transparent hover:text-foreground",
                    !isPrimary &&
                      "bg-primary font-semibold text-primary-foreground hover:bg-primary",
                  )}
                />
              }
            >
              {isPrimary ? "More" : activeDef.label}
              <ChevronDown className="size-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[160px]">
              {SECONDARY_LAYOUTS.map((layout) => (
                <DropdownMenuItem
                  key={layout.id}
                  onClick={() => selectLayout(layout.id)}
                  className={cn(activeLayout === layout.id && "bg-mango-soft font-semibold")}
                >
                  {layout.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <ToggleGroup
          multiple={false}
          spacing={1}
          value={supportsOrientation ? [orientation] : []}
          onValueChange={(value) => {
            const next = value[0];
            if (next) selectOrientation(next as Orientation);
          }}
          disabled={!supportsOrientation}
          title={!supportsOrientation ? "This layout has no orientation variant" : undefined}
          className={cn(
            "rounded-full border border-border bg-card p-1",
            !supportsOrientation && "opacity-40",
          )}
        >
          <ToggleGroupItem
            value="horizontal"
            title="Horizontal"
            aria-label="Horizontal"
            className="h-auto min-w-0 rounded-full p-1.5 text-muted-foreground hover:bg-transparent hover:text-foreground aria-pressed:bg-primary aria-pressed:text-primary-foreground"
          >
            <Columns2 className="size-3.5" aria-hidden="true" />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="vertical"
            title="Vertical"
            aria-label="Vertical"
            className="h-auto min-w-0 rounded-full p-1.5 text-muted-foreground hover:bg-transparent hover:text-foreground aria-pressed:bg-primary aria-pressed:text-primary-foreground"
          >
            <Rows2 className="size-3.5" aria-hidden="true" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="relative aspect-[3/2] w-full overflow-hidden rounded-2xl border border-border bg-card shadow-[0_1px_2px_0_oklch(0_0_0_/_0.05)]">
        <LayoutStage key={activeDef.id} layout={activeDef} orientation={orientation} />
      </div>
    </div>
  );
}
