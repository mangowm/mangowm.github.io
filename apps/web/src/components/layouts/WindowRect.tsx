"use client";

import { memo } from "react";
import type { WindowRect as WindowRectType } from "./types";

interface WindowRectProps {
  rect: WindowRectType;
  focused: boolean;
  label?: string;
}

const CARD_BASE = "rounded-lg border-2";
const CARD_ACTIVE = "border-fd-primary bg-fd-primary/10";
const CARD_INACTIVE = "border-fd-border bg-fd-background/80";

export const WindowRect = memo(function WindowRect({
  rect,
  focused,
  label,
}: WindowRectProps) {
  return (
    <div
      className={`absolute ${CARD_BASE} ${focused ? CARD_ACTIVE : CARD_INACTIVE}`}
      style={{
        left: rect.x,
        top: rect.y,
        width: rect.width,
        height: rect.height,
      }}
    >
      {label && (
        <div className="absolute inset-x-0 top-2 flex justify-center">
          <span className="rounded bg-fd-muted/80 px-2 py-0.5 text-[10px] font-medium text-fd-muted-foreground">
            {label}
          </span>
        </div>
      )}
      <div className="flex h-full w-full items-center justify-center">
        <div className="flex gap-1">
          {Array(Math.min(3, focused ? 3 : 1))
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-fd-muted-foreground/40"
              />
            ))}
        </div>
      </div>
    </div>
  );
});
