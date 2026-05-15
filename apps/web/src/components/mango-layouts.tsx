"use client";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import {
  AlignHorizontalJustifyCenter,
  AlignVerticalJustifyCenter,
  ChevronDown,
} from "lucide-react";
import { CenterTileLayout } from "./layouts/center-tile-layout";
import { DeckLayout } from "./layouts/deck-layout";
import { GridLayout } from "./layouts/grid-layout";
import { MonocleLayout } from "./layouts/monocle-layout";
import { OverviewLayout } from "./layouts/overview-layout";
import { RightTileLayout } from "./layouts/right-tile-layout";
import { ScrollerLayout } from "./layouts/scroller-layout";
import { DwindleLayout } from "./layouts/dwindle-layout";
import { TileLayout } from "./layouts/tile-layout";

// ─── Types ────────────────────────────────────────────────────────────────────

type LayoutId =
  | "tiling"
  | "scroller"
  | "grid"
  | "overview"
  | "deck"
  | "center-tile"
  | "right-tile"
  | "monocle"
  | "dwindle";

type Orientation = "horizontal" | "vertical";

interface LayoutDef {
  id: LayoutId;
  label: string;
  supportsOrientation: boolean;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const MAIN_LAYOUTS: LayoutDef[] = [
  { id: "tiling", label: "Tiling", supportsOrientation: true },
  { id: "scroller", label: "Scroller", supportsOrientation: true },
  { id: "grid", label: "Grid", supportsOrientation: true },
];

const OTHER_LAYOUTS: LayoutDef[] = [
  { id: "deck", label: "Deck", supportsOrientation: true },
  { id: "dwindle", label: "Dwindle", supportsOrientation: false },
  { id: "center-tile", label: "Center Tile", supportsOrientation: false },
  { id: "right-tile", label: "Right Tile", supportsOrientation: false },
  { id: "monocle", label: "Monocle", supportsOrientation: false },
  { id: "overview", label: "Overview", supportsOrientation: false },
];

const ALL_LAYOUTS = [...MAIN_LAYOUTS, ...OTHER_LAYOUTS];

const AUTO_PLAY_IDS = MAIN_LAYOUTS.map((l) => l.id);
const AUTO_PLAY_INTERVAL = 9500;

// ─── Component ────────────────────────────────────────────────────────────────

export function MangoLayouts() {
  const [activeLayout, setActiveLayout] = useState<LayoutId>("tiling");
  const [orientation, setOrientation] = useState<Orientation>("horizontal");
  const [showMore, setShowMore] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeDef = ALL_LAYOUTS.find((l) => l.id === activeLayout)!;
  const isMainLayout = MAIN_LAYOUTS.some((l) => l.id === activeLayout);
  const supportsOrientation = activeDef.supportsOrientation;

  // ── Auto-play ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAutoPlaying) {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
      autoPlayRef.current = null;
      return;
    }

    autoPlayRef.current = setInterval(() => {
      setActiveLayout((current) => {
        const idx = AUTO_PLAY_IDS.indexOf(current);
        return AUTO_PLAY_IDS[(idx === -1 ? 0 : idx + 1) % AUTO_PLAY_IDS.length];
      });
      setOrientation("horizontal");
    }, AUTO_PLAY_INTERVAL);

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [isAutoPlaying]);

  // ── Close dropdown on outside click ───────────────────────────────────────
  useEffect(() => {
    if (!showMore) return;
    const handler = (e: MouseEvent) => {
      if (!dropdownRef.current?.contains(e.target as Node)) setShowMore(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showMore]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const selectLayout = (id: LayoutId) => {
    setActiveLayout(id);
    setIsAutoPlaying(false);
    setShowMore(false);
  };

  const selectOrientation = (o: Orientation) => {
    setOrientation(o);
    setIsAutoPlaying(false);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="w-full space-y-2.5">
      {/* Controls row — centred */}
      <div className="flex items-center justify-center gap-2">
        {/* Layout selector pill */}
        <div className="inline-flex min-w-0 items-center gap-0.5 rounded-xl border border-fd-border bg-fd-muted p-1">
          {MAIN_LAYOUTS.map((layout) => (
            <button
              key={layout.id}
              type="button"
              onClick={() => selectLayout(layout.id)}
              className={cn(
                "cursor-pointer rounded-lg px-3 py-1 text-sm font-medium transition-all",
                activeLayout === layout.id
                  ? "bg-fd-background text-fd-primary shadow-sm"
                  : "text-fd-muted-foreground hover:text-fd-foreground",
              )}
            >
              {layout.label}
            </button>
          ))}

          {/* More / active-other button + dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setShowMore((v) => !v)}
              className={cn(
                "flex cursor-pointer items-center gap-1 rounded-lg px-3 py-1 text-sm font-medium outline-none transition-all",
                !isMainLayout
                  ? "bg-fd-background text-fd-primary shadow-sm"
                  : "text-fd-muted-foreground hover:text-fd-foreground",
              )}
            >
              {isMainLayout ? "More" : activeDef.label}
              <ChevronDown
                className={cn(
                  "h-3 w-3 shrink-0 transition-transform duration-200",
                  showMore && "rotate-180",
                )}
              />
            </button>

            {showMore && (
              <div className="absolute right-0 top-full z-50 mt-1.5 min-w-[140px] rounded-xl border border-fd-border bg-fd-background p-1 shadow-lg">
                {OTHER_LAYOUTS.map((layout) => (
                  <button
                    key={layout.id}
                    type="button"
                    onClick={() => selectLayout(layout.id)}
                    className={cn(
                      "w-full cursor-pointer rounded-lg px-3 py-1.5 text-left text-sm transition-colors",
                      activeLayout === layout.id
                        ? "bg-fd-primary/10 font-medium text-fd-primary"
                        : "text-fd-foreground hover:bg-fd-muted",
                    )}
                  >
                    {layout.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Orientation toggle — icon-only buttons */}
        <div
          className={cn(
            "inline-flex shrink-0 items-center gap-0.5 rounded-xl border border-fd-border bg-fd-muted p-1 transition-opacity",
            !supportsOrientation && "pointer-events-none opacity-40",
          )}
          title={!supportsOrientation
            ? "This layout has no orientation variant"
            : undefined}
        >
          <button
            type="button"
            onClick={() => selectOrientation("horizontal")}
            title="Horizontal"
            className={cn(
              "flex cursor-pointer items-center rounded-lg p-1.5 transition-all",
              orientation === "horizontal" && supportsOrientation
                ? "bg-fd-background text-fd-primary shadow-sm"
                : "text-fd-muted-foreground hover:text-fd-foreground",
            )}
          >
            <AlignHorizontalJustifyCenter className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => selectOrientation("vertical")}
            title="Vertical"
            className={cn(
              "flex cursor-pointer items-center rounded-lg p-1.5 transition-all",
              orientation === "vertical" && supportsOrientation
                ? "bg-fd-background text-fd-primary shadow-sm"
                : "text-fd-muted-foreground hover:text-fd-foreground",
            )}
          >
            <AlignVerticalJustifyCenter className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Preview area */}
      <div className="relative aspect-[3/2] w-full overflow-hidden rounded-xl border border-fd-border bg-fd-background/50 shadow-sm">
        {activeLayout === "tiling" && <TileLayout orientation={orientation} />}
        {activeLayout === "scroller" && (
          <ScrollerLayout orientation={orientation} />
        )}
        {activeLayout === "grid" && <GridLayout orientation={orientation} />}
        {activeLayout === "overview" && <OverviewLayout />}
        {activeLayout === "deck" && <DeckLayout orientation={orientation} />}
        {activeLayout === "center-tile" && (
          <CenterTileLayout orientation={orientation} />
        )}
        {activeLayout === "right-tile" && <RightTileLayout />}
        {activeLayout === "monocle" && <MonocleLayout />}
        {activeLayout === "dwindle" && (
          <DwindleLayout orientation={orientation} />
        )}
      </div>

      {/* Active layout label */}
      <p className="text-center text-xs text-fd-muted-foreground">
        <span className="font-medium text-fd-foreground">
          {activeDef.label}
        </span>
        {supportsOrientation && <>&mdash; {orientation}</>}
      </p>
    </div>
  );
}
