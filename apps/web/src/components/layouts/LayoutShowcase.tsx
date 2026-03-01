"use client";

import { useState, useMemo } from "react";
import { WindowRect } from "./WindowRect";
import {
  calculateTileLayout,
  calculateVerticalTileLayout,
  calculateGridLayout,
  calculateVerticalGridLayout,
  calculateMonocleLayout,
  calculateDeckLayout,
  calculateVerticalDeckLayout,
  calculateCenterTileLayout,
  calculateRightTileLayout,
  calculateScrollerLayout,
  calculateVerticalScrollerLayout,
  calculateTgmixLayout,
  calculateOverviewLayout,
  type ScrollerConfig,
  type CenterTileConfig,
} from "./calculators";
import type { LayoutType } from "./types";

interface LayoutInfo {
  name: string;
  description: string;
  hasMaster: boolean;
  hasMasterFactor: boolean;
  hasScroller: boolean;
  hasCenterTile: boolean;
  hasOverview: boolean;
}

const LAYOUTS: Record<LayoutType, LayoutInfo> = {
  tile: { name: "Tile", description: "Classic master-stack tiling (horizontal)", hasMaster: true, hasMasterFactor: true, hasScroller: false, hasCenterTile: false, hasOverview: false },
  "vertical-tile": { name: "Vertical Tile", description: "Master-stack tiling (vertical)", hasMaster: true, hasMasterFactor: true, hasScroller: false, hasCenterTile: false, hasOverview: false },
  grid: { name: "Grid", description: "Equal-sized grid arrangement (horizontal)", hasMaster: false, hasMasterFactor: false, hasScroller: false, hasCenterTile: false, hasOverview: false },
  "vertical-grid": { name: "Vertical Grid", description: "Equal-sized grid arrangement (vertical)", hasMaster: false, hasMasterFactor: false, hasScroller: false, hasCenterTile: false, hasOverview: false },
  scroller: { name: "Scroller", description: "Horizontal scrolling layout", hasMaster: false, hasMasterFactor: false, hasScroller: true, hasCenterTile: false, hasOverview: false },
  "vertical-scroller": { name: "Vertical Scroller", description: "Vertical scrolling layout", hasMaster: false, hasMasterFactor: false, hasScroller: true, hasCenterTile: false, hasOverview: false },
  monocle: { name: "Monocle", description: "Fullscreen single window", hasMaster: false, hasMasterFactor: false, hasScroller: false, hasCenterTile: false, hasOverview: false },
  deck: { name: "Deck", description: "Stacked overlapping windows (horizontal)", hasMaster: true, hasMasterFactor: true, hasScroller: false, hasCenterTile: false, hasOverview: false },
  "vertical-deck": { name: "Vertical Deck", description: "Stacked overlapping windows (vertical)", hasMaster: true, hasMasterFactor: true, hasScroller: false, hasCenterTile: false, hasOverview: false },
  "center-tile": { name: "Center Tile", description: "Centered master with tiled stack", hasMaster: true, hasMasterFactor: true, hasScroller: false, hasCenterTile: true, hasOverview: false },
  "right-tile": { name: "Right Tile", description: "Master on right side", hasMaster: true, hasMasterFactor: true, hasScroller: false, hasCenterTile: false, hasOverview: false },
  tgmix: { name: "TGMix", description: "Tile for 1-3 windows, grid for 4+", hasMaster: true, hasMasterFactor: true, hasScroller: false, hasCenterTile: false, hasOverview: false },
  overview: { name: "Overview", description: "Overview mode layout", hasMaster: false, hasMasterFactor: false, hasScroller: false, hasCenterTile: false, hasOverview: true },
};

const MONITOR_PRESET_OPTIONS = [
  { label: "1080p", width: 1920, height: 1080 },
  { label: "1440p", width: 2560, height: 1440 },
  { label: "4K", width: 3840, height: 2160 },
  { label: "Portrait 1080", width: 1080, height: 1920, isPortrait: true },
  { label: "Portrait 1440", width: 1440, height: 2560, isPortrait: true },
];

const SCALE_OPTIONS = [1, 1.25, 1.5, 2];

interface LayoutParams {
  windowCount: number;
  masterCount: number;
  masterFactor: number;
  enableGaps: boolean;
  smartGaps: boolean;
  gapOuterH: number;
  gapOuterV: number;
  gapInnerH: number;
  gapInnerV: number;
  centerMasterOverspread: boolean;
  centerWhenSingleStack: boolean;
  scrollerStructs: number;
  scrollerDefaultProportion: number;
  scrollerDefaultProportionSingle: number;
  scrollerIgnoreSingle: boolean;
  scrollerFocusCenter: boolean;
  scrollerPreferCenter: boolean;
  scrollerPreferOverspread: boolean;
  overviewGapInner: number;
  overviewGapOuter: number;
}

interface MonitorParams {
  width: number;
  height: number;
  scale: number;
  isPortrait: boolean;
}

function useLayoutRects(layoutType: LayoutType, params: LayoutParams, monitor: MonitorParams, previewWidth: number, previewHeight: number) {
  return useMemo(() => {
    const gapParams = {
      enableGaps: params.enableGaps,
      smartGaps: params.smartGaps,
      gapOuterH: params.gapOuterH,
      gapOuterV: params.gapOuterV,
      gapInnerH: params.gapInnerH,
      gapInnerV: params.gapInnerV,
    };

    const scrollerConfig: ScrollerConfig = {
      scrollerStructs: params.scrollerStructs,
      scrollerDefaultProportion: params.scrollerDefaultProportion,
      scrollerDefaultProportionSingle: params.scrollerDefaultProportionSingle,
      scrollerIgnoreSingle: params.scrollerIgnoreSingle,
      scrollerFocusCenter: params.scrollerFocusCenter,
      scrollerPreferCenter: params.scrollerPreferCenter,
      scrollerPreferOverspread: params.scrollerPreferOverspread,
    };

    const centerTileConfig: CenterTileConfig = {
      centerMasterOverspread: params.centerMasterOverspread,
      centerWhenSingleStack: params.centerWhenSingleStack,
    };

    const container = { 
      width: Math.round(previewWidth), 
      height: Math.round(previewHeight) 
    };

    switch (layoutType) {
      case "tile": return calculateTileLayout(container, params.windowCount, params.masterCount, params.masterFactor, gapParams);
      case "vertical-tile": return calculateVerticalTileLayout(container, params.windowCount, params.masterCount, params.masterFactor, gapParams);
      case "grid": return calculateGridLayout(container, params.windowCount, gapParams);
      case "vertical-grid": return calculateVerticalGridLayout(container, params.windowCount, gapParams);
      case "scroller": return calculateScrollerLayout(container, params.windowCount, 0, gapParams, scrollerConfig, []);
      case "vertical-scroller": return calculateVerticalScrollerLayout(container, params.windowCount, 0, gapParams, scrollerConfig, []);
      case "monocle": return calculateMonocleLayout(container, params.windowCount);
      case "deck": return calculateDeckLayout(container, params.windowCount, params.masterCount, params.masterFactor, gapParams);
      case "vertical-deck": return calculateVerticalDeckLayout(container, params.windowCount, params.masterCount, params.masterFactor, gapParams);
      case "center-tile": return calculateCenterTileLayout(container, params.windowCount, params.masterCount, params.masterFactor, gapParams, centerTileConfig);
      case "right-tile": return calculateRightTileLayout(container, params.windowCount, params.masterCount, params.masterFactor, gapParams);
      case "tgmix": return calculateTgmixLayout(container, params.windowCount, params.masterCount, params.masterFactor);
      case "overview": return calculateOverviewLayout(container, params.windowCount, params.overviewGapOuter, params.overviewGapInner);
      default: return calculateTileLayout(container, params.windowCount, params.masterCount, params.masterFactor, gapParams);
    }
  }, [layoutType, params, monitor]);
}

function RangeSlider({ label, value, min, max, step = 1, onChange, formatValue }: {
  label: string; value: number; min: number; max: number; step?: number;
  onChange: (v: number) => void; formatValue?: (v: number) => string;
}) {
  return (
    <label className="flex items-center gap-3 text-sm">
      <span className="w-20 shrink-0 text-fd-muted-foreground">{label}:</span>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))} className="flex-1" />
      <span className="w-12 text-right text-xs text-fd-muted-foreground">
        {formatValue ? formatValue(value) : value}
      </span>
    </label>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="rounded" />
      <span className="text-fd-muted-foreground">{label}</span>
    </label>
  );
}

function ConfigSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3 p-4 rounded-lg bg-fd-muted/30 border border-fd-border">
      <div className="text-sm font-semibold text-fd-foreground">{title}</div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

export function LayoutShowcase() {
  const [activeLayout, setActiveLayout] = useState<LayoutType>("tile");
  const [monitor, setMonitor] = useState<MonitorParams>({
    width: 1920, height: 1080, scale: 1, isPortrait: false,
  });
  const [params, setParams] = useState<LayoutParams>({
    windowCount: 4, masterCount: 1, masterFactor: 0.5,
    enableGaps: true, smartGaps: false,
    gapOuterH: 10, gapOuterV: 10, gapInnerH: 5, gapInnerV: 5,
    centerMasterOverspread: false, centerWhenSingleStack: true,
    scrollerStructs: 20, scrollerDefaultProportion: 0.9, scrollerDefaultProportionSingle: 1.0,
    scrollerIgnoreSingle: true, scrollerFocusCenter: false, scrollerPreferCenter: false, scrollerPreferOverspread: true,
    overviewGapInner: 5, overviewGapOuter: 30,
  });

  const logicalWidth = Math.round(monitor.width / monitor.scale);
  const logicalHeight = Math.round(monitor.height / monitor.scale);
  
  const previewScale = 0.3;
  const previewWidth = Math.round(logicalWidth * previewScale);
  const previewHeight = Math.round(logicalHeight * previewScale);
  
  const effectiveWidth = monitor.isPortrait ? monitor.height : monitor.width;
  const effectiveHeight = monitor.isPortrait ? monitor.width : monitor.height;

  const rects = useLayoutRects(activeLayout, params, monitor, previewWidth, previewHeight);
  const layoutInfo = LAYOUTS[activeLayout];

  const updateParams = (updates: Partial<LayoutParams>) => setParams((prev) => ({ ...prev, ...updates }));
  const updateMonitor = (updates: Partial<MonitorParams>) => setMonitor((prev) => ({ ...prev, ...updates }));

  const applyMonitorPreset = (preset: typeof MONITOR_PRESET_OPTIONS[0]) => {
    setMonitor({
      width: preset.width, height: preset.height,
      scale: preset.isPortrait ? 1 : (preset.width >= 3840 ? 2 : preset.width >= 2560 ? 1.25 : 1),
      isPortrait: preset.isPortrait ?? false,
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex gap-1 rounded-lg bg-fd-muted p-1">
          {(Object.keys(LAYOUTS) as LayoutType[]).map((layout) => (
            <button key={layout} onClick={() => setActiveLayout(layout)}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                activeLayout === layout ? "bg-fd-background text-fd-foreground shadow-sm" : "text-fd-muted-foreground hover:text-fd-foreground"
              }`}>
              {LAYOUTS[layout].name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ConfigSection title="Monitor">
          <div className="flex flex-wrap gap-2">
            {MONITOR_PRESET_OPTIONS.map((preset) => (
              <button key={preset.label} onClick={() => applyMonitorPreset(preset)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  monitor.width === preset.width && monitor.height === preset.height
                    ? "bg-fd-primary text-fd-primary-foreground" : "bg-fd-muted text-fd-muted-foreground hover:bg-fd-muted/80"
                }`}>
                {preset.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 text-xs text-fd-muted-foreground">
            <span>Resolution:</span>
            <input type="number" value={monitor.width} onChange={(e) => updateMonitor({ width: Number(e.target.value), isPortrait: false })}
              className="w-20 rounded border border-fd-border bg-fd-background px-2 py-1 text-fd-foreground" min={320} max={7680} />
            <span>×</span>
            <input type="number" value={monitor.height} onChange={(e) => updateMonitor({ height: Number(e.target.value) })}
              className="w-20 rounded border border-fd-border bg-fd-background px-2 py-1 text-fd-foreground" min={320} max={4320} />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-fd-muted-foreground">Scale:</span>
            {SCALE_OPTIONS.map((s) => (
              <button key={s} onClick={() => updateMonitor({ scale: s })}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  monitor.scale === s ? "bg-fd-primary text-fd-primary-foreground" : "bg-fd-muted text-fd-muted-foreground hover:bg-fd-muted/80"
                }`}>
                {s}x
              </button>
            ))}
          </div>
          <div className="pt-1 text-xs text-fd-muted-foreground">
            {logicalWidth} × {logicalHeight} @ {monitor.scale}x{monitor.isPortrait ? " portrait" : " landscape"} ({effectiveWidth} × {effectiveHeight} phys)
          </div>
        </ConfigSection>

        <ConfigSection title="General">
          <RangeSlider label="Windows" value={params.windowCount} min={1} max={12}
            onChange={(v) => { updateParams({ windowCount: v }); if (params.masterCount > v) updateParams({ masterCount: v }); }} />
          <Toggle label="Enable Gaps" checked={params.enableGaps} onChange={(v) => updateParams({ enableGaps: v })} />
          <Toggle label="Smart Gaps" checked={params.smartGaps} onChange={(v) => updateParams({ smartGaps: v })} />
        </ConfigSection>

        {layoutInfo.hasMaster && (
          <ConfigSection title="Master Area">
            <RangeSlider label="Count" value={params.masterCount} min={1} max={Math.max(1, params.windowCount)}
              onChange={(v) => updateParams({ masterCount: v })} />
            {layoutInfo.hasMasterFactor && (
              <RangeSlider label="Factor" value={params.masterFactor} min={0.2} max={0.8} step={0.05}
                onChange={(v) => updateParams({ masterFactor: v })} formatValue={(v) => `${Math.round(v * 100)}%`} />
            )}
          </ConfigSection>
        )}

        <ConfigSection title="Gaps">
          <RangeSlider label="Outer H" value={params.gapOuterH} min={0} max={40} onChange={(v) => updateParams({ gapOuterH: v })} />
          <RangeSlider label="Outer V" value={params.gapOuterV} min={0} max={40} onChange={(v) => updateParams({ gapOuterV: v })} />
          <RangeSlider label="Inner H" value={params.gapInnerH} min={0} max={40} onChange={(v) => updateParams({ gapInnerH: v })} />
          <RangeSlider label="Inner V" value={params.gapInnerV} min={0} max={40} onChange={(v) => updateParams({ gapInnerV: v })} />
        </ConfigSection>

        {layoutInfo.hasCenterTile && (
          <ConfigSection title="Center Tile">
            <Toggle label="Overspread" checked={params.centerMasterOverspread} onChange={(v) => updateParams({ centerMasterOverspread: v })} />
            <Toggle label="Center When Single" checked={params.centerWhenSingleStack} onChange={(v) => updateParams({ centerWhenSingleStack: v })} />
          </ConfigSection>
        )}

        {layoutInfo.hasScroller && (
          <ConfigSection title="Scroller">
            <RangeSlider label="Structs" value={params.scrollerStructs} min={0} max={100} onChange={(v) => updateParams({ scrollerStructs: v })} />
            <RangeSlider label="Proportion" value={params.scrollerDefaultProportion} min={0.3} max={1.0} step={0.1}
              onChange={(v) => updateParams({ scrollerDefaultProportion: v })} formatValue={(v) => `${Math.round(v * 100)}%`} />
            <RangeSlider label="Single" value={params.scrollerDefaultProportionSingle} min={0.3} max={1.0} step={0.1}
              onChange={(v) => updateParams({ scrollerDefaultProportionSingle: v })} formatValue={(v) => `${Math.round(v * 100)}%`} />
            <Toggle label="Ignore Single" checked={params.scrollerIgnoreSingle} onChange={(v) => updateParams({ scrollerIgnoreSingle: v })} />
            <Toggle label="Focus Center" checked={params.scrollerFocusCenter} onChange={(v) => updateParams({ scrollerFocusCenter: v })} />
            <Toggle label="Prefer Center" checked={params.scrollerPreferCenter} onChange={(v) => updateParams({ scrollerPreferCenter: v })} />
            <Toggle label="Prefer Overspread" checked={params.scrollerPreferOverspread} onChange={(v) => updateParams({ scrollerPreferOverspread: v })} />
          </ConfigSection>
        )}

        {layoutInfo.hasOverview && (
          <ConfigSection title="Overview">
            <RangeSlider label="Gap Inner" value={params.overviewGapInner} min={0} max={40} onChange={(v) => updateParams({ overviewGapInner: v })} />
            <RangeSlider label="Gap Outer" value={params.overviewGapOuter} min={0} max={80} onChange={(v) => updateParams({ overviewGapOuter: v })} />
          </ConfigSection>
        )}
      </div>

      <div className="text-base text-fd-muted-foreground">{layoutInfo.description}</div>

      <div className="flex justify-center">
        <div className="relative overflow-hidden rounded-2xl border-2 border-fd-border bg-gradient-to-br from-fd-muted/30 to-fd-muted/10 shadow-2xl"
          style={{ width: Math.round(previewWidth), height: Math.round(previewHeight) }}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-fd-muted-foreground/30 text-lg font-medium">
              {logicalWidth} × {logicalHeight}
            </div>
          </div>
          {rects.map((rect, index) => (
            <WindowRect key={index} rect={rect} focused={index < params.masterCount} label={`Window ${index + 1}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
