import { cn } from "@/lib/utils";

interface FilterPillProps {
  label: string;
  active: boolean;
  onClick: () => void;
  size?: "sm" | "xs";
}

export function FilterPill({ label, active, onClick, size = "sm" }: FilterPillProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center shrink-0 rounded-md font-medium select-none",
        "transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        size === "sm" && "h-7 px-2.5 text-[11px]",
        size === "xs" && "h-6 px-2 text-[10px] tracking-wide",
        active
          ? "bg-foreground text-background shadow-sm"
          : "text-muted-foreground/55 hover:text-foreground hover:bg-muted/70",
      )}
    >
      {label}
      {label === "All" && active && (
        <span className="ml-1.5 inline-flex size-1 rounded-full bg-current opacity-60" />
      )}
    </button>
  );
}
