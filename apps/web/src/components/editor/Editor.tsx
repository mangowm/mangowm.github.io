"use client";

import { useState, useMemo, useCallback, ReactNode } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ConfigExportPanel } from "./ConfigExportPanel";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LayoutInfo {
  name: string;
  description: string;
  hasMaster: boolean;
  hasMasterFactor: boolean;
  hasScroller: boolean;
  hasCenterTile: boolean;
  hasOverview: boolean;
}

export interface LayoutParams {
  windowCount: number;
  masterCount: number;
  masterFactor: number;
  focusedWindow: number;
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

export interface MonitorParams {
  width: number;
  height: number;
  scale: number;
  isPortrait: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const LAYOUTS: Record<LayoutType, LayoutInfo> = {
  tile:                { name: "Tile",           description: "Classic master-stack tiling (horizontal)",  hasMaster: true,  hasMasterFactor: true,  hasScroller: false, hasCenterTile: false, hasOverview: false },
  "vertical-tile":     { name: "Vertical Tile",  description: "Master-stack tiling (vertical)",            hasMaster: true,  hasMasterFactor: true,  hasScroller: false, hasCenterTile: false, hasOverview: false },
  grid:                { name: "Grid",           description: "Equal-sized grid arrangement (horizontal)", hasMaster: false, hasMasterFactor: false, hasScroller: false, hasCenterTile: false, hasOverview: false },
  "vertical-grid":     { name: "Vertical Grid",  description: "Equal-sized grid arrangement (vertical)",  hasMaster: false, hasMasterFactor: false, hasScroller: false, hasCenterTile: false, hasOverview: false },
  scroller:            { name: "Scroller",       description: "Horizontal scrolling layout",              hasMaster: false, hasMasterFactor: false, hasScroller: true,  hasCenterTile: false, hasOverview: false },
  "vertical-scroller": { name: "Vert. Scroller", description: "Vertical scrolling layout",               hasMaster: false, hasMasterFactor: false, hasScroller: true,  hasCenterTile: false, hasOverview: false },
  monocle:             { name: "Monocle",        description: "Fullscreen single window",                 hasMaster: false, hasMasterFactor: false, hasScroller: false, hasCenterTile: false, hasOverview: false },
  deck:                { name: "Deck",           description: "Stacked overlapping windows (horizontal)", hasMaster: true,  hasMasterFactor: true,  hasScroller: false, hasCenterTile: false, hasOverview: false },
  "vertical-deck":     { name: "Vertical Deck",  description: "Stacked overlapping windows (vertical)",  hasMaster: true,  hasMasterFactor: true,  hasScroller: false, hasCenterTile: false, hasOverview: false },
  "center-tile":       { name: "Center Tile",    description: "Centered master with tiled stack",         hasMaster: true,  hasMasterFactor: true,  hasScroller: false, hasCenterTile: true,  hasOverview: false },
  "right-tile":        { name: "Right Tile",     description: "Master on right side",                     hasMaster: true,  hasMasterFactor: true,  hasScroller: false, hasCenterTile: false, hasOverview: false },
  tgmix:               { name: "TGMix",          description: "Tile for 1–3 windows, grid for 4+",        hasMaster: true,  hasMasterFactor: true,  hasScroller: false, hasCenterTile: false, hasOverview: false },
  overview:            { name: "Overview",        description: "Overview mode layout",                     hasMaster: false, hasMasterFactor: false, hasScroller: false, hasCenterTile: false, hasOverview: true  },
};

const LAYOUT_KEYS = Object.keys(LAYOUTS) as LayoutType[];

const MONITOR_PRESETS = [
  { label: "1080p",  width: 1920, height: 1080, isPortrait: false },
  { label: "1440p",  width: 2560, height: 1440, isPortrait: false },
  { label: "4K",     width: 3840, height: 2160, isPortrait: false },
  { label: "1080↕",  width: 1080, height: 1920, isPortrait: true  },
  { label: "1440↕",  width: 1440, height: 2560, isPortrait: true  },
] as const;

const SCALE_OPTIONS = [1, 1.25, 1.5, 2] as const;
const PREVIEW_SCALE = 0.38;

const DEFAULT_PARAMS: LayoutParams = {
  windowCount: 4, masterCount: 1, masterFactor: 0.5, focusedWindow: 3,
  enableGaps: true, smartGaps: false,
  gapOuterH: 10, gapOuterV: 10, gapInnerH: 5, gapInnerV: 5,
  centerMasterOverspread: false, centerWhenSingleStack: true,
  scrollerStructs: 20, scrollerDefaultProportion: 0.9, scrollerDefaultProportionSingle: 1.0,
  scrollerIgnoreSingle: true, scrollerFocusCenter: false, scrollerPreferCenter: false, scrollerPreferOverspread: true,
  overviewGapInner: 5, overviewGapOuter: 30,
};

const DEFAULT_MONITOR: MonitorParams = { width: 1920, height: 1080, scale: 1, isPortrait: false };

// ---------------------------------------------------------------------------
// UI primitives
// ---------------------------------------------------------------------------

function ConfigSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-3.5">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
      {children}
      <Separator />
    </div>
  );
}

function SliderRow({
  label, value, min, max, step = 1, onChange, formatValue,
}: {
  label: string; value: number; min: number; max: number;
  step?: number; onChange: (v: number) => void; formatValue?: (v: number) => string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm text-muted-foreground">{label}</Label>
        <span className="w-12 text-right font-mono text-sm tabular-nums text-foreground">
          {formatValue ? formatValue(value) : value}
        </span>
      </div>
      <div className="[&_[data-slider-track]]:h-[3px] [&_[data-slider-thumb]]:h-3 [&_[data-slider-thumb]]:w-3">
        <Slider
          min={min} max={max} step={step}
          value={value}
          onValueChange={(v: number | readonly number[]) =>
            onChange(Array.isArray(v) ? (v as number[])[0] : (v as number))
          }
        />
      </div>
    </div>
  );
}

function SwitchRow({ label, checked, onCheckedChange }: {
  label: string; checked: boolean; onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <Label className="cursor-pointer text-sm text-muted-foreground">{label}</Label>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

function useLayoutRects(
  layoutType: LayoutType,
  params: LayoutParams,
  monitor: MonitorParams,
  previewWidth: number,
  previewHeight: number,
) {
  return useMemo(() => {
    const gapParams = {
      enableGaps: params.enableGaps, smartGaps: params.smartGaps,
      gapOuterH: params.gapOuterH,   gapOuterV: params.gapOuterV,
      gapInnerH: params.gapInnerH,   gapInnerV: params.gapInnerV,
    };
    const scrollerConfig: ScrollerConfig = {
      scrollerStructs:                 params.scrollerStructs,
      scrollerDefaultProportion:       params.scrollerDefaultProportion,
      scrollerDefaultProportionSingle: params.scrollerDefaultProportionSingle,
      scrollerIgnoreSingle:            params.scrollerIgnoreSingle,
      scrollerFocusCenter:             params.scrollerFocusCenter,
      scrollerPreferCenter:            params.scrollerPreferCenter,
      scrollerPreferOverspread:        params.scrollerPreferOverspread,
    };
    const centerTileConfig: CenterTileConfig = {
      centerMasterOverspread: params.centerMasterOverspread,
      centerWhenSingleStack:  params.centerWhenSingleStack,
    };
    const container = { width: Math.round(previewWidth), height: Math.round(previewHeight) };
    const { windowCount: n, masterCount: mc, masterFactor: mf } = params;

    switch (layoutType) {
      case "tile":               return calculateTileLayout(container, n, mc, mf, gapParams);
      case "vertical-tile":      return calculateVerticalTileLayout(container, n, mc, mf, gapParams);
      case "grid":               return calculateGridLayout(container, n, gapParams);
      case "vertical-grid":      return calculateVerticalGridLayout(container, n, gapParams);
      case "scroller":           return calculateScrollerLayout(container, n, 0, gapParams, scrollerConfig, []);
      case "vertical-scroller":  return calculateVerticalScrollerLayout(container, n, 0, gapParams, scrollerConfig, []);
      case "monocle":            return calculateMonocleLayout(container, n);
      case "deck":               return calculateDeckLayout(container, n, mc, mf, gapParams);
      case "vertical-deck":      return calculateVerticalDeckLayout(container, n, mc, mf, gapParams);
      case "center-tile":        return calculateCenterTileLayout(container, n, mc, mf, gapParams, centerTileConfig);
      case "right-tile":         return calculateRightTileLayout(container, n, mc, mf, gapParams);
      case "tgmix":              return calculateTgmixLayout(container, n, mc, mf);
      case "overview":           return calculateOverviewLayout(container, n, params.overviewGapOuter, params.overviewGapInner);
      default:                   return calculateTileLayout(container, n, mc, mf, gapParams);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layoutType, params, monitor]);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export function Editor() {
  const [activeLayout, setActiveLayout] = useState<LayoutType>("tile");
  const [monitor, setMonitor]           = useState<MonitorParams>(DEFAULT_MONITOR);
  const [params, setParams]             = useState<LayoutParams>(DEFAULT_PARAMS);

  const logicalWidth  = Math.round(monitor.width  / monitor.scale);
  const logicalHeight = Math.round(monitor.height / monitor.scale);
  const previewWidth  = Math.round(logicalWidth  * PREVIEW_SCALE);
  const previewHeight = Math.round(logicalHeight * PREVIEW_SCALE);

  const rects      = useLayoutRects(activeLayout, params, monitor, previewWidth, previewHeight);
  const layoutInfo = LAYOUTS[activeLayout];

  const updateParams  = useCallback((u: Partial<LayoutParams>)  => setParams((p)  => ({ ...p, ...u })), []);
  const updateMonitor = useCallback((u: Partial<MonitorParams>) => setMonitor((m) => ({ ...m, ...u })), []);

  const applyPreset = useCallback((preset: typeof MONITOR_PRESETS[number]) => {
    setMonitor({
      width: preset.width, height: preset.height, isPortrait: preset.isPortrait,
      scale: preset.isPortrait ? 1 : preset.width >= 3840 ? 2 : preset.width >= 2560 ? 1.25 : 1,
    });
  }, []);

  const pct = (v: number) => `${Math.round(v * 100)}%`;
  const px  = (v: number) => `${v}px`;

  const activePresetLabel = MONITOR_PRESETS.find(
    (p) => p.width === monitor.width && p.height === monitor.height,
  )?.label;

  return (
    <div className="flex h-full overflow-hidden rounded-lg border bg-background">

      {/* ── Sidebar ── */}
      <aside className="flex w-64 flex-shrink-0 flex-col border-r bg-muted/30">

        {/* Layout dropdown — compact, no space wasted */}
        <div className="border-b p-4">
          <Label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Layout
          </Label>
          <Select value={activeLayout} onValueChange={(v) => setActiveLayout(v as LayoutType)}>
            <SelectTrigger className="h-10 text-base font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LAYOUT_KEYS.map((key) => (
                <SelectItem key={key} value={key} className="text-sm py-2">
                  {LAYOUTS[key].name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Scrollable config — flex-1 + overflow-hidden lets ScrollArea fill remaining space */}
        <div className="min-h-0 flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="space-y-5 p-4">

              {/* Monitor */}
              <ConfigSection title="Monitor">
                <div className="grid grid-cols-3 gap-1.5">
                  {MONITOR_PRESETS.map((preset) => (
                    <Badge
                      key={preset.label}
                      variant={activePresetLabel === preset.label ? "default" : "outline"}
                      className="cursor-pointer select-none justify-center py-1 text-xs"
                      onClick={() => applyPreset(preset)}
                    >
                      {preset.label}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center gap-1.5">
                  <Input
                    type="number" value={monitor.width} min={320} max={7680}
                    onChange={(e) => updateMonitor({ width: Number(e.target.value), isPortrait: false })}
                    className="h-8 w-full px-2 text-center text-sm tabular-nums"
                  />
                  <span className="shrink-0 text-sm text-muted-foreground">×</span>
                  <Input
                    type="number" value={monitor.height} min={320} max={4320}
                    onChange={(e) => updateMonitor({ height: Number(e.target.value) })}
                    className="h-8 w-full px-2 text-center text-sm tabular-nums"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Scale</Label>
                  <div className="flex gap-1.5">
                    {SCALE_OPTIONS.map((s) => (
                      <Button
                        key={s} size="sm"
                        variant={monitor.scale === s ? "default" : "outline"}
                        className="h-8 flex-1 px-0 text-sm"
                        onClick={() => updateMonitor({ scale: s })}
                      >
                        {s}×
                      </Button>
                    ))}
                  </div>
                </div>
                <p className="font-mono text-xs text-muted-foreground">
                  {logicalWidth}×{logicalHeight} · {monitor.scale}×{monitor.isPortrait ? " portrait" : ""}
                </p>
              </ConfigSection>

              {/* General */}
              <ConfigSection title="General">
                <SliderRow
                  label="Windows" value={params.windowCount} min={1} max={12}
                  onChange={(v) => {
                    updateParams({ windowCount: v, focusedWindow: v - 1 });
                    if (params.masterCount > v) updateParams({ masterCount: v });
                  }}
                />
                <SwitchRow label="Enable Gaps" checked={params.enableGaps} onCheckedChange={(v) => updateParams({ enableGaps: v })} />
                <SwitchRow label="Smart Gaps"  checked={params.smartGaps}  onCheckedChange={(v) => updateParams({ smartGaps: v })} />
              </ConfigSection>

              {/* Gaps */}
              <ConfigSection title="Gaps">
                <div className="grid grid-cols-2 gap-x-3 gap-y-3">
                  <SliderRow label="Outer H" value={params.gapOuterH} min={0} max={40} step={5} onChange={(v) => updateParams({ gapOuterH: v })} formatValue={px} />
                  <SliderRow label="Outer V" value={params.gapOuterV} min={0} max={40} step={5} onChange={(v) => updateParams({ gapOuterV: v })} formatValue={px} />
                  <SliderRow label="Inner H" value={params.gapInnerH} min={0} max={40} step={5} onChange={(v) => updateParams({ gapInnerH: v })} formatValue={px} />
                  <SliderRow label="Inner V" value={params.gapInnerV} min={0} max={40} step={5} onChange={(v) => updateParams({ gapInnerV: v })} formatValue={px} />
                </div>
              </ConfigSection>

              {/* Master Area */}
              {layoutInfo.hasMaster && (
                <ConfigSection title="Master Area">
                  <SliderRow
                    label="Count" value={params.masterCount} min={1} max={Math.max(1, params.windowCount)}
                    onChange={(v) => updateParams({ masterCount: v })}
                  />
                  {layoutInfo.hasMasterFactor && (
                    <SliderRow
                      label="Factor" value={params.masterFactor} min={0.2} max={0.8} step={0.05}
                      onChange={(v) => updateParams({ masterFactor: v })} formatValue={pct}
                    />
                  )}
                </ConfigSection>
              )}

              {/* Center Tile */}
              {layoutInfo.hasCenterTile && (
                <ConfigSection title="Center Tile">
                  <SwitchRow label="Overspread"         checked={params.centerMasterOverspread} onCheckedChange={(v) => updateParams({ centerMasterOverspread: v })} />
                  <SwitchRow label="Center When Single" checked={params.centerWhenSingleStack}  onCheckedChange={(v) => updateParams({ centerWhenSingleStack: v })} />
                </ConfigSection>
              )}

              {/* Scroller */}
              {layoutInfo.hasScroller && (
                <ConfigSection title="Scroller">
                  <SliderRow label="Structs"    value={params.scrollerStructs}                  min={0}   max={100} step={5} onChange={(v) => updateParams({ scrollerStructs: v })} />
                  <SliderRow label="Proportion" value={params.scrollerDefaultProportion}       min={0.3} max={1.0} step={0.1} onChange={(v) => updateParams({ scrollerDefaultProportion: v })} formatValue={pct} />
                  <SliderRow label="Single"     value={params.scrollerDefaultProportionSingle} min={0.3} max={1.0} step={0.1} onChange={(v) => updateParams({ scrollerDefaultProportionSingle: v })} formatValue={pct} />
                  <Separator />
                  <SwitchRow label="Ignore Single"     checked={params.scrollerIgnoreSingle}     onCheckedChange={(v) => updateParams({ scrollerIgnoreSingle: v })} />
                  <SwitchRow label="Focus Center"      checked={params.scrollerFocusCenter}      onCheckedChange={(v) => updateParams({ scrollerFocusCenter: v })} />
                  <SwitchRow label="Prefer Center"     checked={params.scrollerPreferCenter}     onCheckedChange={(v) => updateParams({ scrollerPreferCenter: v })} />
                  <SwitchRow label="Prefer Overspread" checked={params.scrollerPreferOverspread} onCheckedChange={(v) => updateParams({ scrollerPreferOverspread: v })} />
                </ConfigSection>
              )}

              {/* Overview */}
              {layoutInfo.hasOverview && (
                <ConfigSection title="Overview">
                  <SliderRow label="Gap Inner" value={params.overviewGapInner} min={0} max={40} step={5} onChange={(v) => updateParams({ overviewGapInner: v })} formatValue={px} />
                  <SliderRow label="Gap Outer" value={params.overviewGapOuter} min={0} max={80} step={5} onChange={(v) => updateParams({ overviewGapOuter: v })} formatValue={px} />
                </ConfigSection>
              )}

            </div>
          </ScrollArea>
        </div>
      </aside>

      {/* ── Preview pane ── */}
      <main className="flex flex-1 flex-col overflow-hidden">

        {/* Topbar */}
        <div className="flex items-center gap-3 border-b px-5 py-3.5">
          <span className="text-base font-medium">{layoutInfo.name}</span>
          <Separator orientation="vertical" className="h-4" />
          <span className="text-sm text-muted-foreground">{layoutInfo.description}</span>
          <div className="ml-auto flex items-center gap-2">
            <Badge variant="secondary" className="px-2.5 py-0.5 font-mono text-sm">{params.windowCount} windows</Badge>
            <Badge variant="secondary" className="px-2.5 py-0.5 font-mono text-sm">{previewWidth}×{previewHeight}</Badge>
            {params.enableGaps && (
              <Badge variant="secondary" className="px-2.5 py-0.5 font-mono text-sm">
                gap {params.gapOuterH}/{params.gapInnerH}
              </Badge>
            )}
          </div>
        </div>

        {/* Canvas */}
        <div className="flex flex-1 flex-col items-center justify-center gap-4 overflow-auto bg-muted/20 p-6">
          <div
            className="relative flex-shrink-0 overflow-hidden rounded-md border shadow-md"
            style={{ width: previewWidth, height: previewHeight }}
          >
            <div
              className="absolute inset-0"
              style={{
                backgroundColor: "hsl(var(--muted))",
                backgroundImage: "radial-gradient(hsl(var(--muted-foreground) / 0.2) 1px, transparent 1px)",
                backgroundSize: "16px 16px",
              }}
            />
            <div className="pointer-events-none absolute inset-0 flex select-none items-center justify-center">
              <span className="font-mono text-base font-medium text-muted-foreground/20">
                {logicalWidth} × {logicalHeight}
              </span>
            </div>
            {rects.map((rect, i) => (
              <WindowRect key={i} rect={rect} focused={i === params.focusedWindow} label={`W${i + 1}`} />
            ))}
          </div>

          {/* Focus selector */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">Focus window</span>
            <div className="flex gap-2">
              {rects.map((_, i) => (
                <Button
                  key={i} size="sm"
                  variant={i === params.focusedWindow ? "default" : "outline"}
                  className="h-8 w-8 p-0 font-mono text-sm"
                  onClick={() => updateParams({ focusedWindow: i })}
                >
                  {i + 1}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </main>

      <ConfigExportPanel params={params} monitor={monitor} />

    </div>
  );
}
