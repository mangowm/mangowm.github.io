import { cn } from "@/lib/utils";
import { Layers } from "lucide-react";

export function ModeTag({ mode }: { mode: string }) {
  const isDefault = mode === "default";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-mono text-[10px] font-medium",
        "ring-1 ring-inset transition-colors select-none",
        isDefault
          ? "ring-border/40 text-muted-foreground/50 bg-muted/30"
          : "ring-border/60 text-muted-foreground/70 bg-muted/50",
      )}
    >
      <Layers className="size-2.5 opacity-60" />
      {mode}
    </span>
  );
}
