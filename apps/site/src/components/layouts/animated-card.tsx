import { cn } from "cn";
import { cardTransition, type CardAction } from "./animation";
import type { CardFrame } from "./types";

interface AnimatedCardProps {
  frame: CardFrame;
  label: string;
  action: CardAction;
  reducedMotion: boolean;
}

export function AnimatedCard({ frame, label, action, reducedMotion }: AnimatedCardProps) {
  const { x, y, w, h, visible, active, z } = frame;

  return (
    <div
      className={cn(
        "absolute flex items-center justify-center rounded-[14px] font-mono text-xl font-medium tabular-nums",
        active
          ? "z-20 border-2 border-primary bg-card text-primary-text"
          : "z-10 border border-border bg-muted text-muted-foreground",
      )}
      style={{
        transform: `translate3d(${x}px, ${y}px, 0) scale(${visible ? 1 : 0.9})`,
        width: w,
        height: h,
        opacity: visible ? 1 : 0,
        zIndex: z,
        transition: reducedMotion ? "none" : cardTransition(action),
      }}
    >
      {label}
    </div>
  );
}
