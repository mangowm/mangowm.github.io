import { cn } from "cn";

export function KeyBadge({ label }: { label: string }) {
  return (
    <kbd
      className={cn(
        "inline-flex items-center justify-center",
        "h-[22px] min-w-[22px] px-1.5",
        "rounded-sm font-mono text-[11px] leading-none font-medium",
        "border border-border bg-muted text-muted-foreground",
        "shadow-[0_1px_0_0_hsl(var(--border))] select-none",
      )}
    >
      {label}
    </kbd>
  );
}
