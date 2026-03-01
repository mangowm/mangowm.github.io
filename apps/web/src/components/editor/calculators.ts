import type { WindowRect, ContainerDims } from "./types";
import { GAP_INNER, GAP_OUTER } from "./types";

export interface LayoutGapParams {
  enableGaps: boolean;
  smartGaps: boolean;
  gapOuterH: number;
  gapOuterV: number;
  gapInnerH: number;
  gapInnerV: number;
}

export interface ScrollerConfig {
  scrollerStructs: number;
  scrollerDefaultProportion: number;
  scrollerDefaultProportionSingle: number;
  scrollerIgnoreSingle: boolean;
  scrollerFocusCenter: boolean;
  scrollerPreferCenter: boolean;
  scrollerPreferOverspread: boolean;
}

export interface CenterTileConfig {
  centerMasterOverspread: boolean;
  centerWhenSingleStack: boolean;
}

const DEFAULT_GAP_PARAMS: LayoutGapParams = {
  enableGaps: true,
  smartGaps: true,
  gapOuterH: GAP_OUTER,
  gapOuterV: GAP_OUTER,
  gapInnerH: GAP_INNER,
  gapInnerV: GAP_INNER,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getGaps(windowCount: number, params: LayoutGapParams = DEFAULT_GAP_PARAMS) {
  if (!params.enableGaps || (params.smartGaps && windowCount === 1)) {
    return { gappoh: 0, gappov: 0, gappih: 0, gappiv: 0 };
  }
  return {
    gappoh: params.gapOuterH,
    gappov: params.gapOuterV,
    gappih: params.gapInnerH,
    gappiv: params.gapInnerV,
  };
}

/** Returns 1 when gaps are enabled, 0 otherwise — used as a gap multiplier. */
function gapEnabled(params: LayoutGapParams): 0 | 1 {
  return params.enableGaps ? 1 : 0;
}

/**
 * Calculates the grid column/row count for `n` items.
 * Returns { cols, rows } such that cols >= rows and cols * rows >= n.
 */
function gridDimensions(n: number): { cols: number; rows: number } {
  let cols = 0;
  while (cols * cols < n) cols++;
  const rows = cols && (cols - 1) * cols >= n ? cols - 1 : cols;
  return { cols, rows };
}

// ---------------------------------------------------------------------------
// Layout calculators
// ---------------------------------------------------------------------------

export function calculateTileLayout(
  container: ContainerDims,
  windowCount: number,
  masterCount = 1,
  masterFactor = 0.5,
  gapParams: LayoutGapParams = DEFAULT_GAP_PARAMS,
  masterInnerPers: number[] = [],
  stackInnerPers: number[] = [],
): WindowRect[] {
  if (windowCount === 0) return [];

  const { gappoh, gappov, gappih, gappiv } = getGaps(windowCount, gapParams);
  const ie = gapEnabled(gapParams);
  const n = windowCount;
  const nmasters = Math.min(masterCount, n);
  const stackCount = n - nmasters;

  const mw =
    n > nmasters
      ? nmasters ? Math.round((container.width + gappih * ie) * masterFactor) : 0
      : container.width - 2 * gappoh + gappih * ie;

  const rects: WindowRect[] = [];
  let my = gappov;
  let ty = gappov;
  let masterSurplusHeight = container.height - 2 * gappov - gappiv * ie * (nmasters - 1);
  let slaveSurplusHeight  = container.height - 2 * gappov - gappiv * ie * (stackCount - 1);
  let masterSurplusRatio = 1.0;
  let slaveSurplusRatio  = 1.0;

  for (let i = 0; i < n; i++) {
    if (i < nmasters) {
      const r = nmasters - i;
      let h: number;
      if (masterInnerPers[i] > 0) {
        h = masterSurplusHeight * masterInnerPers[i] / masterSurplusRatio;
        masterSurplusHeight -= h;
        masterSurplusRatio -= masterInnerPers[i];
      } else {
        h = Math.round((container.height - my - gappov - gappiv * ie * (r - 1)) / r);
      }
      rects.push({ x: gappoh, y: my, width: mw - gappih * ie, height: h });
      my += h + gappiv * ie;
    } else {
      const stackIdx = i - nmasters;
      const r = n - i;
      let h: number;
      if (stackInnerPers[stackIdx] > 0) {
        h = slaveSurplusHeight * stackInnerPers[stackIdx] / slaveSurplusRatio;
        slaveSurplusHeight -= h;
        slaveSurplusRatio -= stackInnerPers[stackIdx];
      } else {
        h = Math.round((container.height - ty - gappov - gappiv * ie * (r - 1)) / r);
      }
      rects.push({ x: mw + gappoh, y: ty, width: container.width - mw - 2 * gappoh, height: h });
      ty += h + gappiv * ie;
    }
  }

  return rects;
}

export function calculateVerticalTileLayout(
  container: ContainerDims,
  windowCount: number,
  masterCount = 1,
  masterFactor = 0.5,
  gapParams: LayoutGapParams = DEFAULT_GAP_PARAMS,
  masterInnerPers: number[] = [],
  stackInnerPers: number[] = [],
): WindowRect[] {
  if (windowCount === 0) return [];

  const { gappoh, gappov, gappih, gappiv } = getGaps(windowCount, gapParams);
  const ie = gapEnabled(gapParams);
  const n = windowCount;
  const nmasters = Math.min(masterCount, n);
  const stackCount = n - nmasters;

  const mh =
    n > nmasters
      ? nmasters ? Math.round((container.height + gappiv * ie) * masterFactor) : 0
      : container.height - 2 * gappov + gappiv * ie;

  const rects: WindowRect[] = [];
  let mx = gappoh;
  let tx = gappoh;
  let masterSurplusWidth = container.width - 2 * gappoh - gappih * ie * (nmasters - 1);
  let slaveSurplusWidth  = container.width - 2 * gappoh - gappih * ie * (stackCount - 1);
  let masterSurplusRatio = 1.0;
  let slaveSurplusRatio  = 1.0;

  for (let i = 0; i < n; i++) {
    if (i < nmasters) {
      const r = nmasters - i;
      let w: number;
      if (masterInnerPers[i] > 0) {
        w = masterSurplusWidth * masterInnerPers[i] / masterSurplusRatio;
        masterSurplusWidth -= w;
        masterSurplusRatio -= masterInnerPers[i];
      } else {
        w = Math.round((container.width - mx - gappih - gappih * ie * (r - 1)) / r);
      }
      rects.push({ x: mx, y: gappov, width: w, height: mh - gappiv * ie });
      mx += w + gappih * ie;
    } else {
      const stackIdx = i - nmasters;
      const r = n - i;
      let w: number;
      if (stackInnerPers[stackIdx] > 0) {
        w = slaveSurplusWidth * stackInnerPers[stackIdx] / slaveSurplusRatio;
        slaveSurplusWidth -= w;
        slaveSurplusRatio -= stackInnerPers[stackIdx];
      } else {
        w = Math.round((container.width - tx - gappih - gappih * ie * (r - 1)) / r);
      }
      rects.push({ x: tx, y: mh + gappov, width: w, height: container.height - mh - 2 * gappov });
      tx += w + gappih * ie;
    }
  }

  return rects;
}

export function calculateGridLayout(
  container: ContainerDims,
  windowCount: number,
  gapParams: LayoutGapParams = DEFAULT_GAP_PARAMS,
): WindowRect[] {
  if (windowCount === 0) return [];

  const { gappoh, gappov, gappih, gappiv } = getGaps(windowCount, gapParams);
  const n = windowCount;

  if (n === 1) {
    const cw = (container.width  - 2 * gappoh) * 0.9;
    const ch = (container.height - 2 * gappov) * 0.9;
    return [{
      x: gappoh + (container.width  - 2 * gappoh - cw) / 2,
      y: gappov + (container.height - 2 * gappov - ch) / 2,
      width: cw, height: ch,
    }];
  }

  if (n === 2) {
    const cw = Math.round((container.width - 2 * gappoh - gappih) / 2);
    const ch = Math.round((container.height - 2 * gappov) * 0.65);
    const cy = gappov + (container.height - 2 * gappov - ch) / 2;
    return [
      { x: gappoh,               y: cy, width: cw, height: ch },
      { x: gappoh + cw + gappih, y: cy, width: cw, height: ch },
    ];
  }

  const { cols, rows } = gridDimensions(n);
  const cellWidth  = (container.width  - 2 * gappoh - (cols - 1) * gappih) / cols;
  const cellHeight = (container.height - 2 * gappov - (rows - 1) * gappiv) / rows;
  const overcols = n % cols;
  const dx = overcols
    ? Math.round((container.width - overcols * cellWidth - (overcols - 1) * gappih) / 2 - gappoh)
    : 0;

  return Array.from({ length: n }, (_, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cx  = col * (cellWidth + gappih) + (overcols && i >= n - overcols ? dx : 0);
    return {
      x: gappoh + cx,
      y: gappov + row * (cellHeight + gappiv),
      width:  Math.round(cellWidth),
      height: Math.round(cellHeight),
    };
  });
}

export function calculateVerticalGridLayout(
  container: ContainerDims,
  windowCount: number,
  gapParams: LayoutGapParams = DEFAULT_GAP_PARAMS,
): WindowRect[] {
  if (windowCount === 0) return [];

  const { gappoh, gappov, gappih, gappiv } = getGaps(windowCount, gapParams);
  const n = windowCount;

  if (n === 1) {
    const cw = (container.width  - 2 * gappoh) * 0.9;
    const ch = (container.height - 2 * gappov) * 0.9;
    return [{
      x: gappoh + (container.width  - 2 * gappoh - cw) / 2,
      y: gappov + (container.height - 2 * gappov - ch) / 2,
      width: cw, height: ch,
    }];
  }

  if (n === 2) {
    const cw = Math.round((container.width - 2 * gappoh) * 0.65);
    const ch = Math.round((container.height - 2 * gappov - gappiv) / 2);
    const cx = gappoh + (container.width - 2 * gappoh - cw) / 2;
    return [
      { x: cx, y: gappov,              width: cw, height: ch },
      { x: cx, y: gappov + ch + gappiv, width: cw, height: ch },
    ];
  }

  // Vertical grid swaps rows/cols vs horizontal
  const { cols: rows, rows: cols } = gridDimensions(n);
  const cellWidth  = (container.width  - 2 * gappoh - (cols - 1) * gappih) / cols;
  const cellHeight = (container.height - 2 * gappov - (rows - 1) * gappiv) / rows;
  const overrows = n % rows;
  const dy = overrows
    ? Math.round((container.height - overrows * cellHeight - (overrows - 1) * gappiv) / 2 - gappov)
    : 0;

  return Array.from({ length: n }, (_, i) => {
    const col = Math.floor(i / rows);
    const row = i % rows;
    const cy  = row * (cellHeight + gappiv) + (overrows && i >= n - overrows ? dy : 0);
    return {
      x: gappoh + col * (cellWidth + gappih),
      y: gappov + cy,
      width:  Math.round(cellWidth),
      height: Math.round(cellHeight),
    };
  });
}

export function calculateMonocleLayout(
  container: ContainerDims,
  windowCount: number,
): WindowRect[] {
  if (windowCount === 0) return [];

  const { gappoh, gappov } = getGaps(windowCount);
  const rect: WindowRect = {
    x: gappoh,
    y: gappov,
    width:  container.width  - 2 * gappoh,
    height: container.height - 2 * gappov,
  };

  return Array<WindowRect>(windowCount).fill(rect);
}

export function calculateDeckLayout(
  container: ContainerDims,
  windowCount: number,
  masterCount = 1,
  masterFactor = 0.7,
  gapParams: LayoutGapParams = DEFAULT_GAP_PARAMS,
): WindowRect[] {
  if (windowCount === 0) return [];

  const { gappoh, gappov, gappih } = getGaps(windowCount, gapParams);
  const n = windowCount;
  const nmasters = Math.min(masterCount, n);
  const stackCount = n - nmasters;

  const mw =
    n > nmasters
      ? nmasters ? Math.round((container.width - 2 * gappoh) * masterFactor) : 0
      : container.width - 2 * gappoh;

  const rects: WindowRect[] = [];
  let my = 0;

  for (let i = 0; i < nmasters; i++) {
    const h = (container.height - 2 * gappov - my) / (nmasters - i);
    rects.push({ x: gappoh, y: gappov + my, width: mw, height: Math.round(h) });
    my += h;
  }

  const stackRect: WindowRect = {
    x: mw + gappoh + gappih,
    y: gappov,
    width:  container.width  - mw - 2 * gappoh - gappih,
    height: container.height - 2 * gappov,
  };
  for (let i = 0; i < stackCount; i++) rects.push(stackRect);

  return rects;
}

export function calculateVerticalDeckLayout(
  container: ContainerDims,
  windowCount: number,
  masterCount = 1,
  masterFactor = 0.7,
  gapParams: LayoutGapParams = DEFAULT_GAP_PARAMS,
): WindowRect[] {
  if (windowCount === 0) return [];

  const { gappoh, gappov, gappiv } = getGaps(windowCount, gapParams);
  const n = windowCount;
  const nmasters = Math.min(masterCount, n);
  const stackCount = n - nmasters;

  const mh =
    n > nmasters
      ? nmasters ? Math.round((container.height - 2 * gappov) * masterFactor) : 0
      : container.height - 2 * gappov;

  const rects: WindowRect[] = [];
  let mx = 0;

  for (let i = 0; i < nmasters; i++) {
    const w = (container.width - 2 * gappoh - mx) / (nmasters - i);
    rects.push({ x: gappoh + mx, y: gappov, width: Math.round(w), height: mh });
    mx += w;
  }

  const stackRect: WindowRect = {
    x: gappoh,
    y: mh + gappov + gappiv,
    width:  container.width  - 2 * gappoh,
    height: container.height - mh - 2 * gappov - gappiv,
  };
  for (let i = 0; i < stackCount; i++) rects.push(stackRect);

  return rects;
}

export function calculateCenterTileLayout(
  container: ContainerDims,
  windowCount: number,
  masterCount = 1,
  masterFactor = 0.5,
  gapParams: LayoutGapParams = DEFAULT_GAP_PARAMS,
  centerTileConfig?: CenterTileConfig,
  masterInnerPers: number[] = [],
  stackInnerPers: number[] = [],
): WindowRect[] {
  if (windowCount === 0) return [];

  const { gappoh, gappov, gappih, gappiv } = getGaps(windowCount, gapParams);
  const ie = gapEnabled(gapParams);
  const n = windowCount;
  const nmasters = Math.min(masterCount, n);
  const stackCount = n - nmasters;

  const centerMasterOverspread = centerTileConfig?.centerMasterOverspread ?? false;
  const centerWhenSingleStack  = centerTileConfig?.centerWhenSingleStack  ?? true;
  const shouldOverspread = centerMasterOverspread && n <= nmasters;

  let mw: number, mx: number, tw: number;

  if (n > nmasters || !shouldOverspread) {
    mw = nmasters ? Math.round((container.width - 2 * gappoh - gappih * ie) * masterFactor) : 0;

    if (stackCount !== 1 || (stackCount === 1 && centerWhenSingleStack)) {
      tw = Math.round((container.width - mw) / 2 - gappoh - gappih * ie);
      mx = gappoh + tw + gappih * ie;
    } else {
      tw = container.width - mw - 2 * gappoh - gappih * ie;
      mx = gappoh;
    }
  } else {
    mw = container.width - 2 * gappoh;
    mx = gappoh;
    tw = 0;
  }

  const rects: WindowRect[] = [];
  let my  = gappov;
  let oty = gappov;
  let ety = gappov;

  for (let i = 0; i < n; i++) {
    if (i < nmasters) {
      const r = nmasters - i;
      const h = Math.round((container.height - my - gappov - gappiv * ie * (r - 1)) / r);
      rects.push({ x: mx, y: my, width: mw, height: h });
      my += h + gappiv * ie;
    } else {
      const stackIndex = i - nmasters;
      const isRightStack = Boolean((stackIndex % 2) ^ (n % 2 === 0 ? 1 : 0));

      if (stackCount === 1) {
        const r = n - i;
        const h = Math.round((container.height - ety - gappov - gappiv * ie * (r - 1)) / r);
        rects.push({ x: mx + mw + gappih * ie, y: ety, width: tw, height: h });
        ety += h + gappiv * ie;
      } else {
        const r = Math.ceil((n - i) / 2);
        if (isRightStack) {
          const h = Math.round((container.height - ety - gappov - gappiv * ie * (r - 1)) / r);
          rects.push({ x: mx + mw + gappih * ie, y: ety, width: tw, height: h });
          ety += h + gappiv * ie;
        } else {
          const h = Math.round((container.height - oty - gappov - gappiv * ie * (r - 1)) / r);
          rects.push({ x: gappoh, y: oty, width: tw, height: h });
          oty += h + gappiv * ie;
        }
      }
    }
  }

  return rects;
}

export function calculateRightTileLayout(
  container: ContainerDims,
  windowCount: number,
  masterCount = 1,
  masterFactor = 0.5,
  gapParams: LayoutGapParams = DEFAULT_GAP_PARAMS,
  masterInnerPers: number[] = [],
  stackInnerPers: number[] = [],
): WindowRect[] {
  if (windowCount === 0) return [];

  const { gappoh, gappov, gappih, gappiv } = getGaps(windowCount, gapParams);
  const ie = gapEnabled(gapParams);
  const n = windowCount;
  const nmasters = Math.min(masterCount, n);
  const stackCount = n - nmasters;

  const mw =
    n > nmasters
      ? nmasters ? Math.round((container.width + gappih * ie) * masterFactor) : 0
      : container.width - 2 * gappoh + gappih * ie;

  const rects: WindowRect[] = [];
  let my = gappov;
  let ty = gappov;

  for (let i = 0; i < n; i++) {
    if (i < nmasters) {
      const r = nmasters - i;
      const h = Math.round((container.height - my - gappov - gappiv * ie * (r - 1)) / r);
      rects.push({ x: container.width - mw - gappoh + gappih * ie, y: my, width: mw - gappih * ie, height: h });
      my += h + gappiv * ie;
    } else {
      const r = n - i;
      const h = Math.round((container.height - ty - gappov - gappiv * ie * (r - 1)) / r);
      rects.push({ x: gappoh, y: ty, width: container.width - mw - 2 * gappoh, height: h });
      ty += h + gappiv * ie;
    }
  }

  return rects;
}

export function calculateScrollerLayout(
  container: ContainerDims,
  windowCount: number,
  focusIndex = 0,
  gapParams: LayoutGapParams = DEFAULT_GAP_PARAMS,
  config: ScrollerConfig,
  stackProportions: number[] = [],
): WindowRect[] {
  if (windowCount === 0) return [];

  const { gappoh, gappov, gappih } = getGaps(windowCount, gapParams);
  const ie = gapEnabled(gapParams);
  const n = windowCount;

  if (n === 1 && !config.scrollerIgnoreSingle) {
    const width  = (container.width  - 2 * gappoh) * config.scrollerDefaultProportionSingle;
    const height = container.height - 2 * gappov;
    return [{
      x: Math.round(gappoh + (container.width  - 2 * gappoh - width)  / 2),
      y: Math.round(gappov + (container.height - 2 * gappov - height) / 2),
      width:  Math.round(width),
      height: Math.round(height),
    }];
  }

  const getProportion = (i: number) => stackProportions[i] ?? config.scrollerDefaultProportion;
  const maxClientWidth = container.width - 2 * config.scrollerStructs - gappih * ie;

  const needOverspread =
    config.scrollerPreferOverspread && n > 1 &&
    (focusIndex === 0 || focusIndex === n - 1) &&
    getProportion(focusIndex) < 1.0;

  const overspreadLeft = needOverspread && focusIndex === 0;
  const needCenter = config.scrollerFocusCenter || n === 1 || (config.scrollerPreferCenter && !needOverspread);

  const focusWidth  = maxClientWidth * getProportion(focusIndex);
  const focusHeight = container.height - 2 * gappov;
  const focusY = gappov + (container.height - 2 * gappov - focusHeight) / 2;

  let focusX = config.scrollerStructs;
  if (needCenter) {
    focusX = (container.width - focusWidth) / 2;
  } else if (needOverspread) {
    focusX = overspreadLeft
      ? config.scrollerStructs
      : container.width - focusWidth - config.scrollerStructs;
  } else if (focusIndex > container.width / 2) {
    focusX = container.width - focusWidth - config.scrollerStructs;
  }

  const rects: WindowRect[] = new Array(n);
  rects[focusIndex] = {
    x: Math.round(focusX), y: Math.round(focusY),
    width: Math.round(focusWidth), height: Math.round(focusHeight),
  };

  for (let i = focusIndex - 1; i >= 0; i--) {
    const w = maxClientWidth * getProportion(i);
    rects[i] = {
      x: Math.round(rects[i + 1].x - gappih * ie - w),
      y: Math.round(focusY),
      width: Math.round(w), height: Math.round(focusHeight),
    };
  }

  for (let i = focusIndex + 1; i < n; i++) {
    const w = maxClientWidth * getProportion(i);
    rects[i] = {
      x: Math.round(rects[i - 1].x + rects[i - 1].width + gappih * ie),
      y: Math.round(focusY),
      width: Math.round(w), height: Math.round(focusHeight),
    };
  }

  return rects;
}

export function calculateVerticalScrollerLayout(
  container: ContainerDims,
  windowCount: number,
  focusIndex = 0,
  gapParams: LayoutGapParams = DEFAULT_GAP_PARAMS,
  config: ScrollerConfig,
  stackProportions: number[] = [],
): WindowRect[] {
  if (windowCount === 0) return [];

  const { gappoh, gappov, gappiv } = getGaps(windowCount, gapParams);
  const ie = gapEnabled(gapParams);
  const n = windowCount;

  if (n === 1 && !config.scrollerIgnoreSingle) {
    const height = (container.height - 2 * gappov) * config.scrollerDefaultProportionSingle;
    const width  = container.width - 2 * gappoh;
    return [{
      x: Math.round(gappoh + (container.width  - 2 * gappoh - width)  / 2),
      y: Math.round(gappov + (container.height - 2 * gappov - height) / 2),
      width:  Math.round(width),
      height: Math.round(height),
    }];
  }

  const getProportion = (i: number) => stackProportions[i] ?? config.scrollerDefaultProportion;
  const maxClientHeight = container.height - 2 * config.scrollerStructs - gappiv * ie;

  const needOverspread =
    config.scrollerPreferOverspread && n > 1 &&
    (focusIndex === 0 || focusIndex === n - 1) &&
    getProportion(focusIndex) < 1.0;

  const overspreadUp = needOverspread && focusIndex === 0;
  const needCenter = config.scrollerFocusCenter || n === 1 || (config.scrollerPreferCenter && !needOverspread);

  const focusHeight = maxClientHeight * getProportion(focusIndex);
  const focusWidth  = container.width - 2 * gappoh;
  const focusX = gappoh + (container.width - 2 * gappoh - focusWidth) / 2;

  let focusY = config.scrollerStructs;
  if (needCenter) {
    focusY = (container.height - focusHeight) / 2;
  } else if (needOverspread) {
    focusY = overspreadUp
      ? config.scrollerStructs
      : container.height - focusHeight - config.scrollerStructs;
  } else if (focusIndex > container.height / 2) {
    focusY = container.height - focusHeight - config.scrollerStructs;
  }

  const rects: WindowRect[] = new Array(n);
  rects[focusIndex] = {
    x: Math.round(focusX), y: Math.round(focusY),
    width: Math.round(focusWidth), height: Math.round(focusHeight),
  };

  for (let i = focusIndex - 1; i >= 0; i--) {
    const h = maxClientHeight * getProportion(i);
    rects[i] = {
      x: Math.round(focusX),
      y: Math.round(rects[i + 1].y - gappiv * ie - h),
      width: Math.round(focusWidth), height: Math.round(h),
    };
  }

  for (let i = focusIndex + 1; i < n; i++) {
    const h = maxClientHeight * getProportion(i);
    rects[i] = {
      x: Math.round(focusX),
      y: Math.round(rects[i - 1].y + rects[i - 1].height + gappiv * ie),
      width: Math.round(focusWidth), height: Math.round(h),
    };
  }

  return rects;
}

export function calculateTgmixLayout(
  container: ContainerDims,
  windowCount: number,
  masterCount = 1,
  masterFactor = 0.5,
): WindowRect[] {
  return windowCount <= 3
    ? calculateTileLayout(container, windowCount, masterCount, masterFactor)
    : calculateGridLayout(container, windowCount);
}

export function calculateOverviewLayout(
  container: ContainerDims,
  windowCount: number,
  overviewGapOuter = 30,
  overviewGapInner = 5,
): WindowRect[] {
  if (windowCount === 0) return [];

  const n = windowCount;

  if (n === 1) {
    const cw = (container.width  - 2 * overviewGapOuter) * 0.7;
    const ch = (container.height - 2 * overviewGapOuter) * 0.8;
    return [{
      x: overviewGapOuter + (container.width  - 2 * overviewGapOuter - cw) / 2,
      y: overviewGapOuter + (container.height - 2 * overviewGapOuter - ch) / 2,
      width: cw, height: ch,
    }];
  }

  const { cols, rows } = gridDimensions(n);
  const cellWidth  = (container.width  - 2 * overviewGapOuter - (cols - 1) * overviewGapInner) / cols;
  const cellHeight = (container.height - 2 * overviewGapOuter - (rows - 1) * overviewGapInner) / rows;
  const overcols = n % cols;
  const dx = overcols
    ? Math.round((container.width - overcols * cellWidth - (overcols - 1) * overviewGapInner) / 2 - overviewGapOuter)
    : 0;

  return Array.from({ length: n }, (_, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cx  = overviewGapOuter + col * (cellWidth + overviewGapInner) + (overcols && i >= n - overcols ? dx : 0);
    return {
      x: cx,
      y: overviewGapOuter + row * (cellHeight + overviewGapInner),
      width:  Math.round(cellWidth),
      height: Math.round(cellHeight),
    };
  });
}
