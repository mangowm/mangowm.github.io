import { useEffect, useRef, useState } from "react";
import { cn } from "../cn";
import { CenterTileLayout } from "./layouts/center-tile-layout";
import { DeckLayout } from "./layouts/deck-layout";
import { GridLayout } from "./layouts/grid-layout";
import { MonocleLayout } from "./layouts/monocle-layout";
import { OverviewLayout } from "./layouts/overview-layout";
import { RightTileLayout } from "./layouts/right-tile-layout";
import { ScrollerLayout } from "./layouts/scroller-layout";
import { DwindleLayout } from "./layouts/dwindle-layout";
import { FairLayout } from "./layouts/fair-layout";
import { TileLayout } from "./layouts/tile-layout";

type LayoutId =
  | "tiling"
  | "scroller"
  | "grid"
  | "overview"
  | "deck"
  | "center-tile"
  | "right-tile"
  | "monocle"
  | "dwindle"
  | "fair";

type Orientation = "horizontal" | "vertical";

interface LayoutDef {
  id: LayoutId;
  label: string;
  supportsOrientation: boolean;
}

const MAIN_LAYOUTS: LayoutDef[] = [
  { id: "tiling", label: "Tiling", supportsOrientation: true },
  { id: "scroller", label: "Scroller", supportsOrientation: true },
  { id: "grid", label: "Grid", supportsOrientation: true },
  { id: "fair", label: "Fair", supportsOrientation: true },
  { id: "dwindle", label: "Dwindle", supportsOrientation: false },
];

const OTHER_LAYOUTS: LayoutDef[] = [
  { id: "deck", label: "Deck", supportsOrientation: true },
  { id: "center-tile", label: "Center Tile", supportsOrientation: false },
  { id: "right-tile", label: "Right Tile", supportsOrientation: false },
  { id: "monocle", label: "Monocle", supportsOrientation: false },
  { id: "overview", label: "Overview", supportsOrientation: false },
];

const ALL_LAYOUTS = [...MAIN_LAYOUTS, ...OTHER_LAYOUTS];
const AUTO_PLAY_IDS = MAIN_LAYOUTS.map((l) => l.id);
const AUTO_PLAY_INTERVAL = 9500;

const ChevronDownIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const HorizIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="6" width="20" height="12" rx="2" />
  </svg>
);

const VertIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="6" y="2" width="12" height="20" rx="2" />
  </svg>
);

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

  useEffect(() => {
    if (!showMore) return;
    const handler = (e: MouseEvent) => {
      if (!dropdownRef.current?.contains(e.target as Node)) setShowMore(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showMore]);

  const selectLayout = (id: LayoutId) => {
    setActiveLayout(id);
    setIsAutoPlaying(false);
    setShowMore(false);
  };

  const selectOrientation = (o: Orientation) => {
    setOrientation(o);
    setIsAutoPlaying(false);
  };

  return (
    <div className="layouts-wrapper">
      <div className="layouts-controls">
        <div className="layouts-pill">
          {MAIN_LAYOUTS.map((layout) => (
            <button
              key={layout.id}
              type="button"
              onClick={() => selectLayout(layout.id)}
              className={cn(
                "layouts-pill-btn",
                activeLayout === layout.id && "layouts-pill-btn-active",
              )}
            >
              {layout.label}
            </button>
          ))}

          <div ref={dropdownRef} className="dropdown">
            <button
              type="button"
              onClick={() => setShowMore((v) => !v)}
              className={cn(
                "layouts-pill-btn-more",
                !isMainLayout && "layouts-pill-btn-more-active",
              )}
            >
              {isMainLayout ? "More" : activeDef.label}
              <ChevronDownIcon />
            </button>

            {showMore && (
              <div className="dropdown-menu">
                {OTHER_LAYOUTS.map((layout) => (
                  <button
                    key={layout.id}
                    type="button"
                    onClick={() => selectLayout(layout.id)}
                    className={cn(
                      "dropdown-item",
                      activeLayout === layout.id && "dropdown-item-active",
                    )}
                  >
                    {layout.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div
          className={cn(
            "layouts-orientation-group",
            !supportsOrientation && "layouts-orientation-group-disabled",
          )}
          title={!supportsOrientation ? "This layout has no orientation variant" : undefined}
        >
          <button
            type="button"
            onClick={() => selectOrientation("horizontal")}
            title="Horizontal"
            className={cn(
              "layouts-orientation-btn",
              orientation === "horizontal" &&
                supportsOrientation &&
                "layouts-orientation-btn-active",
            )}
          >
            <HorizIcon />
          </button>
          <button
            type="button"
            onClick={() => selectOrientation("vertical")}
            title="Vertical"
            className={cn(
              "layouts-orientation-btn",
              orientation === "vertical" && supportsOrientation && "layouts-orientation-btn-active",
            )}
          >
            <VertIcon />
          </button>
        </div>
      </div>

      <div className="layouts-preview">
        {activeLayout === "tiling" && <TileLayout orientation={orientation} />}
        {activeLayout === "scroller" && <ScrollerLayout orientation={orientation} />}
        {activeLayout === "grid" && <GridLayout orientation={orientation} />}
        {activeLayout === "overview" && <OverviewLayout />}
        {activeLayout === "deck" && <DeckLayout orientation={orientation} />}
        {activeLayout === "center-tile" && <CenterTileLayout orientation={orientation} />}
        {activeLayout === "right-tile" && <RightTileLayout />}
        {activeLayout === "monocle" && <MonocleLayout />}
        {activeLayout === "fair" && <FairLayout orientation={orientation} />}
        {activeLayout === "dwindle" && <DwindleLayout />}
      </div>

      <p className="layouts-label">
        <span className="layouts-label-name">{activeDef.label}</span>
        {supportsOrientation && <>&mdash; {orientation}</>}
      </p>
    </div>
  );
}
