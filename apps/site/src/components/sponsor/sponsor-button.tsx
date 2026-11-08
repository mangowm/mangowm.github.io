import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { cn } from "cn";

export function SponsorButton({ large, className }: { large?: boolean; className?: string }) {
  return (
    <Link
      to="/sponsor"
      aria-label="Sponsor mango"
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-[0.45rem] rounded-full border border-border bg-card font-semibold whitespace-nowrap text-foreground transition-colors hover:border-primary hover:bg-mango-soft focus-visible:border-ring",
        large ? "h-11 px-6 text-[0.9375rem]" : "h-9 px-[0.9rem] text-[0.8125rem]",
        className,
      )}
    >
      <Heart className="size-4" />
      <span>Sponsor</span>
    </Link>
  );
}
