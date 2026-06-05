import { cn } from "@/lib/utils";

export function KeyBadge({ label }: { label: string }) {
  return (
    <kbd
      className={cn(
        "inline-flex items-center justify-center",
        "h-[22px] min-w-[22px] px-1.5",
        "rounded-[5px] font-mono text-[11px] font-medium leading-none",
        "border border-border bg-muted text-muted-foreground",
        "select-none shadow-[0_1px_0_0_hsl(var(--border))]",
      )}
    >
      {label}
    </kbd>
  );
}
