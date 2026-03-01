export interface WindowRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ContainerDims {
  width: number;
  height: number;
}

export type LayoutType =
  | "tile"
  | "vertical-tile"
  | "grid"
  | "vertical-grid"
  | "scroller"
  | "vertical-scroller"
  | "monocle"
  | "deck"
  | "vertical-deck"
  | "center-tile"
  | "right-tile"
  | "tgmix"
  | "overview";

export interface MonitorConfig {
  width: number;
  height: number;
  scale: number;
  refreshRate: number;
  isPortrait: boolean;
}

export const MONITOR_PRESETS: Record<string, MonitorConfig> = {
  "1920x1080":  { width: 1920, height: 1080, scale: 1,    refreshRate: 60, isPortrait: false },
  "2560x1440":  { width: 2560, height: 1440, scale: 1,    refreshRate: 60, isPortrait: false },
  "3840x2160":  { width: 3840, height: 2160, scale: 2,    refreshRate: 60, isPortrait: false },
  "1440x2560":  { width: 1440, height: 2560, scale: 1,    refreshRate: 60, isPortrait: true  },
  "1080x1920":  { width: 1080, height: 1920, scale: 1,    refreshRate: 60, isPortrait: true  },
};

export const DEFAULT_MONITOR_CONFIG: MonitorConfig = {
  width: 1920,
  height: 1080,
  scale: 1,
  refreshRate: 60,
  isPortrait: false,
};

export interface LayoutConfig {
  type: LayoutType;
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

export const DEFAULT_LAYOUT_CONFIG: Omit<LayoutConfig, "type"> = {
  masterCount: 1,
  masterFactor: 0.5,
  enableGaps: true,
  smartGaps: false,
  gapOuterH: 10,
  gapOuterV: 10,
  gapInnerH: 5,
  gapInnerV: 5,
  centerMasterOverspread: false,
  centerWhenSingleStack: true,
  scrollerStructs: 20,
  scrollerDefaultProportion: 0.9,
  scrollerDefaultProportionSingle: 1.0,
  scrollerIgnoreSingle: true,
  scrollerFocusCenter: false,
  scrollerPreferCenter: false,
  scrollerPreferOverspread: true,
  overviewGapInner: 5,
  overviewGapOuter: 30,
};

export const GAP_OUTER = 10;
export const GAP_INNER = 5;
