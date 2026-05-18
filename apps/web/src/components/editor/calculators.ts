import type { WindowRect, ContainerDims } from "./types";
import { GAP_INNER, GAP_OUTER } from "./types";

// ---------------------------------------------------------------------------
// Shared config interfaces
// ---------------------------------------------------------------------------

export interface LayoutGapParams {
  smartGaps: boolean;
  gapOuterH: number;
  gapOuterV: number;
  gapInnerH: number;
  gapInnerV: number;
}

export interface MasterConfig {
  masterCount: number;
  masterFactor: number;
  newIsMaster: boolean;
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
  smartGaps: false,
  gapOuterH: GAP_OUTER,
  gapOuterV: GAP_OUTER,
  gapInnerH: GAP_INNER,
  gapInnerV: GAP_INNER,
};

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function getGaps(windowCount: number, params: LayoutGapParams = DEFAULT_GAP_PARAMS) {
  if (params.smartGaps && windowCount === 1) {
    return { gappoh: 0, gappov: 0, gappih: 0, gappiv: 0 };
  }
  return {
    gappoh: params.gapOuterH,
    gappov: params.gapOuterV,
    gappih: params.gapInnerH,
    gappiv: params.gapInnerV,
  };
}

/** Always returns 1 since gaps are always applied (only smartgaps can reduce them to 0). */
function gapEnabled(_params: LayoutGapParams): 0 | 1 {
  return 1;
}

/** Calculates grid dimensions for `n` items so that cols >= rows and cols * rows >= n. */
function gridDimensions(n: number): { cols: number; rows: number } {
  let cols = 0;
  while (cols * cols < n) cols++;
  const rows = cols && (cols - 1) * cols >= n ? cols - 1 : cols;
  return { cols, rows };
}

// ---------------------------------------------------------------------------
// Core tile helper — shared by horizontal and vertical variants
// ---------------------------------------------------------------------------

/**
 * Computes a master-stack tiling in a normalised space where the "main" axis
 * is always horizontal. The caller is responsible for swapping x/y and w/h
 * before returning when building a vertical variant.
 *
 * Returns rects in the normalised (horizontal) space.
 */
function computeTileRects(
  mainSize: number, // container width  (or height for vertical)
  crossSize: number, // container height (or width  for vertical)
  windowCount: number,
  masterCount: number,
  masterFactor: number,
  gapOuter: number, // gappoh (or gappov for vertical)
  gapOuterC: number, // gappov (or gappoh for vertical)
  gapInner: number, // gappih (or gappiv for vertical)
  gapInnerC: number, // gappiv (or gappih for vertical)
  ie: 0 | 1,
  masterInnerPers: number[],
  stackInnerPers: number[],
  newIsMaster: boolean,
): Array<{ main: number; cross: number; mainSize: number; crossSize: number }> {
  const n = windowCount;
  const nmasters = Math.min(masterCount, n);
  const stackCount = n - nmasters;

  const masterMain =
    n > nmasters
      ? nmasters
        ? Math.round((mainSize + gapInner * ie) * masterFactor)
        : 0
      : mainSize - 2 * gapOuter + gapInner * ie;

  const results: Array<{ main: number; cross: number; mainSize: number; crossSize: number }> = [];
  let my = gapOuterC;
  let ty = gapOuterC;
  let masterSurplusH = crossSize - 2 * gapOuterC - gapInnerC * ie * (nmasters - 1);
  let slaveSurplusH = crossSize - 2 * gapOuterC - gapInnerC * ie * (stackCount - 1);
  let masterSurplusR = 1.0;
  let slaveSurplusR = 1.0;

  // Master is ALWAYS on left, stack ALWAYS on right
  // newIsMaster controls which window numbers are masters:
  // - true: window 0..nmasters-1 are masters (W1, W2, ...)
  // - false: window stackCount..n-1 are masters (W{n-nmasters+1}, ...)

  for (let i = 0; i < n; i++) {
    let isMaster: boolean;
    let masterIdx: number;
    let stackIdx: number;

    if (newIsMaster) {
      isMaster = i < nmasters;
      masterIdx = i;
      stackIdx = i - nmasters;
    } else {
      isMaster = i >= stackCount;
      masterIdx = i - stackCount;
      stackIdx = i;
    }

    if (isMaster) {
      const r = nmasters - masterIdx;
      let h: number;
      if (masterInnerPers[masterIdx] > 0) {
        h = (masterSurplusH * masterInnerPers[masterIdx]) / masterSurplusR;
        masterSurplusH -= h;
        masterSurplusR -= masterInnerPers[masterIdx];
      } else {
        h = Math.round((crossSize - my - gapOuterC - gapInnerC * ie * (r - 1)) / r);
      }
      results.push({
        main: gapOuter,
        cross: my,
        mainSize: masterMain - gapInner * ie,
        crossSize: h,
      });
      my += h + gapInnerC * ie;
    } else {
      const r = stackCount - stackIdx;
      let h: number;
      if (stackIdx >= 0 && stackIdx < stackInnerPers.length && stackInnerPers[stackIdx] > 0) {
        h = (slaveSurplusH * stackInnerPers[stackIdx]) / slaveSurplusR;
        slaveSurplusH -= h;
        slaveSurplusR -= stackInnerPers[stackIdx];
      } else {
        h = Math.round((crossSize - ty - gapOuterC - gapInnerC * ie * (r - 1)) / r);
      }
      results.push({
        main: masterMain + gapOuter,
        cross: ty,
        mainSize: mainSize - masterMain - 2 * gapOuter,
        crossSize: h,
      });
      ty += h + gapInnerC * ie;
    }
  }

  return results;
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
  newIsMaster = true,
): WindowRect[] {
  if (windowCount === 0) return [];
  const { gappoh, gappov, gappih, gappiv } = getGaps(windowCount, gapParams);
  const ie = gapEnabled(gapParams);
  return computeTileRects(
    container.width,
    container.height,
    windowCount,
    masterCount,
    masterFactor,
    gappoh,
    gappov,
    gappih,
    gappiv,
    ie,
    masterInnerPers,
    stackInnerPers,
    newIsMaster,
  ).map(({ main: x, cross: y, mainSize: width, crossSize: height }) => ({ x, y, width, height }));
}

export function calculateVerticalTileLayout(
  container: ContainerDims,
  windowCount: number,
  masterCount = 1,
  masterFactor = 0.5,
  gapParams: LayoutGapParams = DEFAULT_GAP_PARAMS,
  masterInnerPers: number[] = [],
  stackInnerPers: number[] = [],
  newIsMaster = true,
): WindowRect[] {
  if (windowCount === 0) return [];
  const { gappoh, gappov, gappih, gappiv } = getGaps(windowCount, gapParams);
  const ie = gapEnabled(gapParams);

  const n = windowCount;
  const nmasters = Math.min(masterCount, n);
  const stackCount = n - nmasters;

  const mh =
    n > nmasters
      ? nmasters
        ? Math.round((container.height + gappiv * ie) * masterFactor)
        : 0
      : container.height - 2 * gappov + gappiv * ie;

  const rects: WindowRect[] = [];
  let mx = gappoh;
  let tx = gappoh;
  let masterSurplusWidth = container.width - 2 * gappoh - gappih * ie * (nmasters - 1);
  let slaveSurplusWidth = container.width - 2 * gappoh - gappih * ie * (stackCount - 1);
  let masterSurplusRatio = 1.0;
  let slaveSurplusRatio = 1.0;

  // Master is ALWAYS on top, stack ALWAYS on bottom
  for (let i = 0; i < n; i++) {
    let isMaster: boolean;
    let masterIdx: number;
    let stackIdx: number;

    if (newIsMaster) {
      isMaster = i < nmasters;
      masterIdx = i;
      stackIdx = i - nmasters;
    } else {
      isMaster = i >= stackCount;
      masterIdx = i - stackCount;
      stackIdx = i;
    }

    if (isMaster) {
      const r = nmasters - masterIdx;
      let w: number;
      if (masterInnerPers[masterIdx] > 0) {
        w = (masterSurplusWidth * masterInnerPers[masterIdx]) / masterSurplusRatio;
        masterSurplusWidth -= w;
        masterSurplusRatio -= masterInnerPers[masterIdx];
      } else {
        w = Math.round((container.width - mx - gappih - gappih * ie * (r - 1)) / r);
      }
      rects.push({ x: mx, y: gappov, width: w, height: mh - gappiv * ie });
      mx += w + gappih * ie;
    } else {
      const r = stackCount - stackIdx;
      let w: number;
      if (stackIdx >= 0 && stackIdx < stackInnerPers.length && stackInnerPers[stackIdx] > 0) {
        w = (slaveSurplusWidth * stackInnerPers[stackIdx]) / slaveSurplusRatio;
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

// ---------------------------------------------------------------------------
// Grid
// ---------------------------------------------------------------------------

/** Shared single-window and two-window special-cases for grid layouts. */
function gridSingleRect(container: ContainerDims, gappoh: number, gappov: number): WindowRect {
  const cw = (container.width - 2 * gappoh) * 0.9;
  const ch = (container.height - 2 * gappov) * 0.9;
  return {
    x: gappoh + (container.width - 2 * gappoh - cw) / 2,
    y: gappov + (container.height - 2 * gappov - ch) / 2,
    width: cw,
    height: ch,
  };
}

export function calculateGridLayout(
  container: ContainerDims,
  windowCount: number,
  gapParams: LayoutGapParams = DEFAULT_GAP_PARAMS,
): WindowRect[] {
  if (windowCount === 0) return [];
  const { gappoh, gappov, gappih, gappiv } = getGaps(windowCount, gapParams);
  const n = windowCount;

  if (n === 1) return [gridSingleRect(container, gappoh, gappov)];

  if (n === 2) {
    const cw = Math.round((container.width - 2 * gappoh - gappih) / 2);
    const ch = Math.round((container.height - 2 * gappov) * 0.65);
    const cy = gappov + (container.height - 2 * gappov - ch) / 2;
    return [
      { x: gappoh, y: cy, width: cw, height: ch },
      { x: gappoh + cw + gappih, y: cy, width: cw, height: ch },
    ];
  }

  const { cols, rows } = gridDimensions(n);
  const cellWidth = (container.width - 2 * gappoh - (cols - 1) * gappih) / cols;
  const cellHeight = (container.height - 2 * gappov - (rows - 1) * gappiv) / rows;
  const overcols = n % cols;
  const dx = overcols
    ? Math.round((container.width - overcols * cellWidth - (overcols - 1) * gappih) / 2 - gappoh)
    : 0;

  return Array.from({ length: n }, (_, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cx = col * (cellWidth + gappih) + (overcols && i >= n - overcols ? dx : 0);
    return {
      x: gappoh + cx,
      y: gappov + row * (cellHeight + gappiv),
      width: Math.round(cellWidth),
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

  if (n === 1) return [gridSingleRect(container, gappoh, gappov)];

  if (n === 2) {
    const cw = Math.round((container.width - 2 * gappoh) * 0.65);
    const ch = Math.round((container.height - 2 * gappov - gappiv) / 2);
    const cx = gappoh + (container.width - 2 * gappoh - cw) / 2;
    return [
      { x: cx, y: gappov, width: cw, height: ch },
      { x: cx, y: gappov + ch + gappiv, width: cw, height: ch },
    ];
  }

  // Vertical grid swaps rows/cols vs horizontal
  const { cols: rows, rows: cols } = gridDimensions(n);
  const cellWidth = (container.width - 2 * gappoh - (cols - 1) * gappih) / cols;
  const cellHeight = (container.height - 2 * gappov - (rows - 1) * gappiv) / rows;
  const overrows = n % rows;
  const dy = overrows
    ? Math.round((container.height - overrows * cellHeight - (overrows - 1) * gappiv) / 2 - gappov)
    : 0;

  return Array.from({ length: n }, (_, i) => {
    const col = Math.floor(i / rows);
    const row = i % rows;
    const cy = row * (cellHeight + gappiv) + (overrows && i >= n - overrows ? dy : 0);
    return {
      x: gappoh + col * (cellWidth + gappih),
      y: gappov + cy,
      width: Math.round(cellWidth),
      height: Math.round(cellHeight),
    };
  });
}

// ---------------------------------------------------------------------------
// Monocle
// ---------------------------------------------------------------------------

export function calculateMonocleLayout(
  container: ContainerDims,
  windowCount: number,
): WindowRect[] {
  if (windowCount === 0) return [];
  const { gappoh, gappov } = getGaps(windowCount);
  const rect: WindowRect = {
    x: gappoh,
    y: gappov,
    width: container.width - 2 * gappoh,
    height: container.height - 2 * gappov,
  };
  return Array<WindowRect>(windowCount).fill(rect);
}

// ---------------------------------------------------------------------------
// Deck  (shared helper for horizontal + vertical)
// ---------------------------------------------------------------------------

function computeDeckRects(
  container: ContainerDims,
  windowCount: number,
  masterCount: number,
  masterFactor: number,
  gapParams: LayoutGapParams,
  vertical: boolean,
  newIsMaster: boolean = true,
): WindowRect[] {
  if (windowCount === 0) return [];

  const { gappoh, gappov, gappih, gappiv } = getGaps(windowCount, gapParams);
  const n = windowCount;
  const nmasters = Math.min(masterCount, n);
  const stackCount = n - nmasters;

  // Determine master indices based on newIsMaster
  const masterStartIdx = newIsMaster ? 0 : stackCount;

  if (vertical) {
    const mh =
      n > nmasters
        ? nmasters
          ? Math.round((container.height - 2 * gappov) * masterFactor)
          : 0
        : container.height - 2 * gappov;

    const rects: WindowRect[] = [];
    // Push rects in window order (not master then stack)
    for (let i = 0; i < n; i++) {
      const isMaster = i >= masterStartIdx && i < masterStartIdx + nmasters;
      if (isMaster) {
        const masterIdx = i - masterStartIdx;
        const w =
          (container.width -
            2 * gappoh -
            (masterIdx > 0 ? (masterIdx * (container.width - 2 * gappoh)) / nmasters : 0)) /
          (nmasters - masterIdx);
        rects.push({ x: gappoh, y: gappov, width: Math.round(w), height: mh });
      } else {
        const _stackIdx = newIsMaster ? i - nmasters : i;
        const stackX = gappoh + nmasters * ((container.width - 2 * gappoh) / nmasters);
        rects.push({
          x: stackX,
          y: mh + gappov + gappiv,
          width: container.width - 2 * gappoh,
          height: container.height - mh - 2 * gappov - gappiv,
        });
      }
    }
    return rects;
  }

  const mw =
    n > nmasters
      ? nmasters
        ? Math.round((container.width - 2 * gappoh) * masterFactor)
        : 0
      : container.width - 2 * gappoh;

  const rects: WindowRect[] = [];
  // Push rects in window order (not master then stack)
  for (let i = 0; i < n; i++) {
    const isMaster = i >= masterStartIdx && i < masterStartIdx + nmasters;
    if (isMaster) {
      const masterIdx = i - masterStartIdx;
      const h =
        (container.height -
          2 * gappov -
          (masterIdx > 0 ? (masterIdx * (container.height - 2 * gappov)) / nmasters : 0)) /
        (nmasters - masterIdx);
      rects.push({ x: gappoh, y: gappov, width: mw, height: Math.round(h) });
    } else {
      const _stackIdx = newIsMaster ? i - nmasters : i;
      const _stackY = nmasters * ((container.height - 2 * gappov) / nmasters);
      rects.push({
        x: mw + gappoh + gappih,
        y: gappov,
        width: container.width - mw - 2 * gappoh - gappih,
        height: container.height - 2 * gappov,
      });
    }
  }
  return rects;
}

export function calculateDeckLayout(
  container: ContainerDims,
  windowCount: number,
  masterCount = 1,
  masterFactor = 0.7,
  gapParams: LayoutGapParams = DEFAULT_GAP_PARAMS,
  newIsMaster = true,
): WindowRect[] {
  return computeDeckRects(
    container,
    windowCount,
    masterCount,
    masterFactor,
    gapParams,
    false,
    newIsMaster,
  );
}

export function calculateVerticalDeckLayout(
  container: ContainerDims,
  windowCount: number,
  masterCount = 1,
  masterFactor = 0.7,
  gapParams: LayoutGapParams = DEFAULT_GAP_PARAMS,
  newIsMaster = true,
): WindowRect[] {
  return computeDeckRects(
    container,
    windowCount,
    masterCount,
    masterFactor,
    gapParams,
    true,
    newIsMaster,
  );
}

// ---------------------------------------------------------------------------
// Center tile
// ---------------------------------------------------------------------------

export function calculateCenterTileLayout(
  container: ContainerDims,
  windowCount: number,
  masterCount = 1,
  masterFactor = 0.5,
  gapParams: LayoutGapParams = DEFAULT_GAP_PARAMS,
  centerTileConfig?: CenterTileConfig,
  masterInnerPers: number[] = [],
  stackInnerPers: number[] = [],
  newIsMaster: boolean = true,
): WindowRect[] {
  if (windowCount === 0) return [];

  const { gappoh, gappov, gappih, gappiv } = getGaps(windowCount, gapParams);
  const ie = gapEnabled(gapParams);
  const n = windowCount;
  const nmasters = Math.min(masterCount, n);
  const stackCount = n - nmasters;

  // Determine master indices based on newIsMaster
  const masterStartIdx = newIsMaster ? 0 : stackCount;

  const centerMasterOverspread = centerTileConfig?.centerMasterOverspread ?? false;
  const centerWhenSingleStack = centerTileConfig?.centerWhenSingleStack ?? true;
  const shouldOverspread = centerMasterOverspread && n <= nmasters;

  let mw: number, mx: number, tw: number;

  if (n > nmasters || !shouldOverspread) {
    mw = nmasters ? Math.round((container.width - 2 * gappoh - gappih * ie) * masterFactor) : 0;
    if (stackCount !== 1 || centerWhenSingleStack) {
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
  let my = gappov,
    oty = gappov,
    ety = gappov;

  for (let i = 0; i < n; i++) {
    const isMaster = i >= masterStartIdx && i < masterStartIdx + nmasters;
    if (isMaster) {
      const masterIdx = i - masterStartIdx;
      const r = nmasters - masterIdx;
      const h = Math.round((container.height - my - gappov - gappiv * ie * (r - 1)) / r);
      rects.push({ x: mx, y: my, width: mw, height: h });
      my += h + gappiv * ie;
    } else {
      const stackIndex = newIsMaster ? i - nmasters : i;
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

// ---------------------------------------------------------------------------
// Right tile
// ---------------------------------------------------------------------------

export function calculateRightTileLayout(
  container: ContainerDims,
  windowCount: number,
  masterCount = 1,
  masterFactor = 0.5,
  gapParams: LayoutGapParams = DEFAULT_GAP_PARAMS,
  masterInnerPers: number[] = [],
  stackInnerPers: number[] = [],
  newIsMaster: boolean = true,
): WindowRect[] {
  if (windowCount === 0) return [];

  const { gappoh, gappov, gappih, gappiv } = getGaps(windowCount, gapParams);
  const ie = gapEnabled(gapParams);
  const n = windowCount;
  const nmasters = Math.min(masterCount, n);
  const stackCount = n - nmasters;

  // Determine master indices based on newIsMaster
  const masterStartIdx = newIsMaster ? 0 : stackCount;

  const mw =
    n > nmasters
      ? nmasters
        ? Math.round((container.width + gappih * ie) * masterFactor)
        : 0
      : container.width - 2 * gappoh + gappih * ie;

  const rects: WindowRect[] = [];
  let my = gappov,
    ty = gappov;

  for (let i = 0; i < n; i++) {
    const isMaster = i >= masterStartIdx && i < masterStartIdx + nmasters;
    if (isMaster) {
      const masterIdx = i - masterStartIdx;
      const r = nmasters - masterIdx;
      const h = Math.round((container.height - my - gappov - gappiv * ie * (r - 1)) / r);
      rects.push({
        x: container.width - mw - gappoh + gappih * ie,
        y: my,
        width: mw - gappih * ie,
        height: h,
      });
      my += h + gappiv * ie;
    } else {
      const _stackIdx = newIsMaster ? i - nmasters : i;
      const r = n - i;
      const h = Math.round((container.height - ty - gappov - gappiv * ie * (r - 1)) / r);
      rects.push({ x: gappoh, y: ty, width: container.width - mw - 2 * gappoh, height: h });
      ty += h + gappiv * ie;
    }
  }

  return rects;
}

// ---------------------------------------------------------------------------
// Scroller  (shared helper for horizontal + vertical)
// ---------------------------------------------------------------------------

function computeScrollerRects(
  container: ContainerDims,
  windowCount: number,
  focusIndex: number,
  gapParams: LayoutGapParams,
  config: ScrollerConfig,
  stackProportions: number[],
  vertical: boolean,
): WindowRect[] {
  if (windowCount === 0) return [];

  const { gappoh, gappov, gappih, gappiv } = getGaps(windowCount, gapParams);
  const ie = gapEnabled(gapParams);
  const n = windowCount;

  const gapFwd = vertical ? gappiv : gappih; // gap along scroll direction
  const outerA = vertical ? gappov : gappoh; // outer gap along scroll direction
  const outerB = vertical ? gappoh : gappov; // outer gap across scroll direction
  const sizeA = vertical ? container.height : container.width; // scroll-axis size
  const sizeB = vertical ? container.width : container.height; // cross-axis size

  // Single-window special case
  if (n === 1 && !config.scrollerIgnoreSingle) {
    const mainSize = (sizeA - 2 * outerA) * config.scrollerDefaultProportionSingle;
    const crossSize = sizeB - 2 * outerB;
    const mainPos = Math.round(outerA + (sizeA - 2 * outerA - mainSize) / 2);
    const crossPos = Math.round(outerB + (sizeB - 2 * outerB - crossSize) / 2);
    const r = vertical
      ? { x: crossPos, y: mainPos, width: Math.round(crossSize), height: Math.round(mainSize) }
      : { x: mainPos, y: crossPos, width: Math.round(mainSize), height: Math.round(crossSize) };
    return [r];
  }

  const getProportion = (i: number) => stackProportions[i] ?? config.scrollerDefaultProportion;
  const maxClient = sizeA - 2 * config.scrollerStructs - gapFwd * ie;

  const needOverspread =
    config.scrollerPreferOverspread &&
    n > 1 &&
    (focusIndex === 0 || focusIndex === n - 1) &&
    getProportion(focusIndex) < 1.0;

  const overspreadFirst = needOverspread && focusIndex === 0;
  const needCenter =
    config.scrollerFocusCenter || n === 1 || (config.scrollerPreferCenter && !needOverspread);

  const focusMainSize = maxClient * getProportion(focusIndex);
  const focusCrossSize = sizeB - 2 * outerB;
  const focusCrossPos = outerB + (sizeB - 2 * outerB - focusCrossSize) / 2;

  let focusMainPos = config.scrollerStructs;
  if (needCenter) {
    focusMainPos = (sizeA - focusMainSize) / 2;
  } else if (needOverspread) {
    focusMainPos = overspreadFirst
      ? config.scrollerStructs
      : sizeA - focusMainSize - config.scrollerStructs;
  } else if (focusIndex > sizeA / 2) {
    focusMainPos = sizeA - focusMainSize - config.scrollerStructs;
  }

  const mainPositions = Array.from<number>({ length: n });
  const mainSizes = Array.from<number>({ length: n });
  mainPositions[focusIndex] = focusMainPos;
  mainSizes[focusIndex] = focusMainSize;

  for (let i = focusIndex - 1; i >= 0; i--) {
    const s = maxClient * getProportion(i);
    mainSizes[i] = s;
    mainPositions[i] = mainPositions[i + 1] - gapFwd * ie - s;
  }
  for (let i = focusIndex + 1; i < n; i++) {
    const s = maxClient * getProportion(i);
    mainSizes[i] = s;
    mainPositions[i] = mainPositions[i - 1] + mainSizes[i - 1] + gapFwd * ie;
  }

  return Array.from({ length: n }, (_, i) => ({
    x: Math.round(vertical ? focusCrossPos : mainPositions[i]),
    y: Math.round(vertical ? mainPositions[i] : focusCrossPos),
    width: Math.round(vertical ? focusCrossSize : mainSizes[i]),
    height: Math.round(vertical ? mainSizes[i] : focusCrossSize),
  }));
}

export function calculateScrollerLayout(
  container: ContainerDims,
  windowCount: number,
  focusIndex = 0,
  gapParams: LayoutGapParams = DEFAULT_GAP_PARAMS,
  config: ScrollerConfig,
  stackProportions: number[] = [],
): WindowRect[] {
  return computeScrollerRects(
    container,
    windowCount,
    focusIndex,
    gapParams,
    config,
    stackProportions,
    false,
  );
}

export function calculateVerticalScrollerLayout(
  container: ContainerDims,
  windowCount: number,
  focusIndex = 0,
  gapParams: LayoutGapParams = DEFAULT_GAP_PARAMS,
  config: ScrollerConfig,
  stackProportions: number[] = [],
): WindowRect[] {
  return computeScrollerRects(
    container,
    windowCount,
    focusIndex,
    gapParams,
    config,
    stackProportions,
    true,
  );
}

// ---------------------------------------------------------------------------
// TGMix + Overview
// ---------------------------------------------------------------------------

export function calculateTgmixLayout(
  container: ContainerDims,
  windowCount: number,
  masterCount = 1,
  masterFactor = 0.5,
  newIsMaster = true,
): WindowRect[] {
  return windowCount <= 3
    ? calculateTileLayout(
        container,
        windowCount,
        masterCount,
        masterFactor,
        DEFAULT_GAP_PARAMS,
        [],
        [],
        newIsMaster,
      )
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
    const cw = (container.width - 2 * overviewGapOuter) * 0.7;
    const ch = (container.height - 2 * overviewGapOuter) * 0.8;
    return [
      {
        x: overviewGapOuter + (container.width - 2 * overviewGapOuter - cw) / 2,
        y: overviewGapOuter + (container.height - 2 * overviewGapOuter - ch) / 2,
        width: cw,
        height: ch,
      },
    ];
  }

  const { cols, rows } = gridDimensions(n);
  const cellWidth = (container.width - 2 * overviewGapOuter - (cols - 1) * overviewGapInner) / cols;
  const cellHeight =
    (container.height - 2 * overviewGapOuter - (rows - 1) * overviewGapInner) / rows;
  const overcols = n % cols;
  const dx = overcols
    ? Math.round(
        (container.width - overcols * cellWidth - (overcols - 1) * overviewGapInner) / 2 -
          overviewGapOuter,
      )
    : 0;

  return Array.from({ length: n }, (_, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cx =
      overviewGapOuter +
      col * (cellWidth + overviewGapInner) +
      (overcols && i >= n - overcols ? dx : 0);
    return {
      x: cx,
      y: overviewGapOuter + row * (cellHeight + overviewGapInner),
      width: Math.round(cellWidth),
      height: Math.round(cellHeight),
    };
  });
}
