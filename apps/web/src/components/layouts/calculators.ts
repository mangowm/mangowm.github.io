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

const DEFAULT_GAP_PARAMS: LayoutGapParams = {
  enableGaps: true,
  smartGaps: true,
  gapOuterH: GAP_OUTER,
  gapOuterV: GAP_OUTER,
  gapInnerH: GAP_INNER,
  gapInnerV: GAP_INNER,
};

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

export function calculateTileLayout(
  container: ContainerDims,
  windowCount: number,
  masterCount: number = 1,
  masterFactor: number = 0.5,
  gapParams: LayoutGapParams = DEFAULT_GAP_PARAMS,
  masterInnerPers: number[] = [],
  stackInnerPers: number[] = []
): WindowRect[] {
  if (windowCount === 0) return [];

  const { gappoh, gappov, gappih, gappiv } = getGaps(windowCount, gapParams);
  const ie = gapParams.enableGaps ? 1 : 0;

  const n = windowCount;
  const nmasters = Math.min(masterCount, n);
  const stackCount = n - nmasters;

  const rects: WindowRect[] = [];

  let mw: number;
  if (n > nmasters) {
    mw = nmasters ? Math.round((container.width + gappih * ie) * masterFactor) : 0;
  } else {
    mw = container.width - 2 * gappoh + gappih * ie;
  }

  let my = gappov;
  let ty = gappov;

  let masterSurplusHeight = container.height - 2 * gappov - gappiv * ie * (nmasters - 1);
  let slaveSurplusHeight = container.height - 2 * gappov - gappiv * ie * (stackCount - 1);

  let masterSurplusRatio = 1.0;
  let slaveSurplusRatio = 1.0;

  for (let i = 0; i < n; i++) {
    if (i < nmasters) {
      const r = Math.min(n, nmasters) - i;
      let h: number;

      if (masterInnerPers[i] && masterInnerPers[i] > 0) {
        h = masterSurplusHeight * masterInnerPers[i] / masterSurplusRatio;
        masterSurplusHeight -= h;
        masterSurplusRatio -= masterInnerPers[i];
      } else {
        h = Math.round((container.height - my - gappov - gappiv * ie * (r - 1)) / r);
      }

      rects.push({
        x: gappoh,
        y: my,
        width: mw - gappih * ie,
        height: h,
      });
      my += h + gappiv * ie;
    } else {
      const stackIdx = i - nmasters;
      const r = n - i;
      let h: number;

      if (stackInnerPers[stackIdx] && stackInnerPers[stackIdx] > 0) {
        h = slaveSurplusHeight * stackInnerPers[stackIdx] / slaveSurplusRatio;
        slaveSurplusHeight -= h;
        slaveSurplusRatio -= stackInnerPers[stackIdx];
      } else {
        h = Math.round((container.height - ty - gappov - gappiv * ie * (r - 1)) / r);
      }

      rects.push({
        x: mw + gappoh,
        y: ty,
        width: container.width - mw - 2 * gappoh,
        height: h,
      });
      ty += h + gappiv * ie;
    }
  }

  return rects;
}

export function calculateVerticalTileLayout(
  container: ContainerDims,
  windowCount: number,
  masterCount: number = 1,
  masterFactor: number = 0.5,
  gapParams: LayoutGapParams = DEFAULT_GAP_PARAMS,
  masterInnerPers: number[] = [],
  stackInnerPers: number[] = []
): WindowRect[] {
  if (windowCount === 0) return [];

  const { gappoh, gappov, gappih, gappiv } = getGaps(windowCount, gapParams);
  const ie = gapParams.enableGaps ? 1 : 0;

  const n = windowCount;
  const nmasters = Math.min(masterCount, n);
  const stackCount = n - nmasters;

  const rects: WindowRect[] = [];

  let mh: number;
  if (n > nmasters) {
    mh = nmasters ? Math.round((container.height + gappiv * ie) * masterFactor) : 0;
  } else {
    mh = container.height - 2 * gappov + gappiv * ie;
  }

  let mx = gappoh;
  let tx = gappoh;

  let masterSurplusWidth = container.width - 2 * gappoh - gappih * ie * (nmasters - 1);
  let slaveSurplusWidth = container.width - 2 * gappoh - gappih * ie * (stackCount - 1);

  let masterSurplusRatio = 1.0;
  let slaveSurplusRatio = 1.0;

  for (let i = 0; i < n; i++) {
    if (i < nmasters) {
      const r = Math.min(n, nmasters) - i;
      let w: number;

      if (masterInnerPers[i] && masterInnerPers[i] > 0) {
        w = masterSurplusWidth * masterInnerPers[i] / masterSurplusRatio;
        masterSurplusWidth -= w;
        masterSurplusRatio -= masterInnerPers[i];
      } else {
        w = Math.round((container.width - mx - gappih - gappih * ie * (r - 1)) / r);
      }

      rects.push({
        x: mx,
        y: gappov,
        width: w,
        height: mh - gappiv * ie,
      });
      mx += w + gappih * ie;
    } else {
      const stackIdx = i - nmasters;
      const r = n - i;
      let w: number;

      if (stackInnerPers[stackIdx] && stackInnerPers[stackIdx] > 0) {
        w = slaveSurplusWidth * stackInnerPers[stackIdx] / slaveSurplusRatio;
        slaveSurplusWidth -= w;
        slaveSurplusRatio -= stackInnerPers[stackIdx];
      } else {
        w = Math.round((container.width - tx - gappih - gappih * ie * (r - 1)) / r);
      }

      rects.push({
        x: tx,
        y: mh + gappov,
        width: w,
        height: container.height - mh - 2 * gappov,
      });
      tx += w + gappih * ie;
    }
  }

  return rects;
}

export function calculateGridLayout(
  container: ContainerDims,
  windowCount: number,
  gapParams: LayoutGapParams = DEFAULT_GAP_PARAMS
): WindowRect[] {
  if (windowCount === 0) return [];

  const { gappoh, gappov, gappih, gappiv } = getGaps(windowCount, gapParams);
  const n = windowCount;

  if (n === 1) {
    const cw = (container.width - 2 * gappoh) * 0.9;
    const ch = (container.height - 2 * gappov) * 0.9;
    return [{
      x: gappoh + (container.width - 2 * gappoh - cw) / 2,
      y: gappov + (container.height - 2 * gappov - ch) / 2,
      width: cw,
      height: ch,
    }];
  }

  if (n === 2) {
    const cw = Math.round((container.width - 2 * gappoh - gappih) / 2);
    const ch = Math.round((container.height - 2 * gappov) * 0.65);
    return [
      { x: gappoh, y: gappov + (container.height - 2 * gappov - ch) / 2, width: cw, height: ch },
      { x: gappoh + cw + gappih, y: gappov + (container.height - 2 * gappov - ch) / 2, width: cw, height: ch },
    ];
  }

  let cols = 0;
  for (cols = 0; cols <= n / 2; cols++) {
    if (cols * cols >= n) break;
  }
  const rows = (cols && (cols - 1) * cols >= n) ? cols - 1 : cols;

  const cellWidth = (container.width - 2 * gappoh - (cols - 1) * gappih) / cols;
  const cellHeight = (container.height - 2 * gappov - (rows - 1) * gappiv) / rows;

  const overcols = n % cols;
  let dx = 0;
  if (overcols) {
    dx = Math.round((container.width - overcols * cellWidth - (overcols - 1) * gappih) / 2 - gappoh);
  }

  const rects: WindowRect[] = [];
  for (let i = 0; i < n; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    let cx = col * (cellWidth + gappih);
    if (overcols && i >= n - overcols) {
      cx += dx;
    }
    rects.push({
      x: gappoh + cx,
      y: gappov + row * (cellHeight + gappiv),
      width: Math.round(cellWidth),
      height: Math.round(cellHeight),
    });
  }

  return rects;
}

export function calculateVerticalGridLayout(
  container: ContainerDims,
  windowCount: number,
  gapParams: LayoutGapParams = DEFAULT_GAP_PARAMS
): WindowRect[] {
  if (windowCount === 0) return [];

  const { gappoh, gappov, gappih, gappiv } = getGaps(windowCount, gapParams);
  const n = windowCount;

  if (n === 1) {
    const cw = (container.width - 2 * gappoh) * 0.9;
    const ch = (container.height - 2 * gappov) * 0.9;
    return [{
      x: gappoh + (container.width - 2 * gappoh - cw) / 2,
      y: gappov + (container.height - 2 * gappov - ch) / 2,
      width: cw,
      height: ch,
    }];
  }

  if (n === 2) {
    const cw = Math.round((container.width - 2 * gappoh) * 0.65);
    const ch = Math.round((container.height - 2 * gappov - gappiv) / 2);
    return [
      { x: gappoh + (container.width - 2 * gappoh - cw) / 2, y: gappov, width: cw, height: ch },
      { x: gappoh + (container.width - 2 * gappoh - cw) / 2, y: gappov + ch + gappiv, width: cw, height: ch },
    ];
  }

  let rows = 0;
  for (rows = 0; rows <= n / 2; rows++) {
    if (rows * rows >= n) break;
  }
  const cols = (rows && (rows - 1) * rows >= n) ? rows - 1 : rows;

  const cellWidth = (container.width - 2 * gappoh - (cols - 1) * gappih) / cols;
  const cellHeight = (container.height - 2 * gappov - (rows - 1) * gappiv) / rows;

  const overrows = n % rows;
  let dy = 0;
  if (overrows) {
    dy = Math.round((container.height - overrows * cellHeight - (overrows - 1) * gappiv) / 2 - gappov);
  }

  const rects: WindowRect[] = [];
  for (let i = 0; i < n; i++) {
    const col = Math.floor(i / rows);
    let row = i % rows;
    let cy = row * (cellHeight + gappiv);
    if (overrows && i >= n - overrows) {
      cy += dy;
    }
    rects.push({
      x: gappoh + col * (cellWidth + gappih),
      y: gappov + cy,
      width: Math.round(cellWidth),
      height: Math.round(cellHeight),
    });
  }

  return rects;
}

export function calculateMonocleLayout(
  container: ContainerDims,
  windowCount: number
): WindowRect[] {
  if (windowCount === 0) return [];

  const { gappoh, gappov } = getGaps(windowCount);

  return Array(windowCount).fill(null).map(() => ({
    x: gappoh,
    y: gappov,
    width: container.width - 2 * gappoh,
    height: container.height - 2 * gappov,
  }));
}

export function calculateDeckLayout(
  container: ContainerDims,
  windowCount: number,
  masterCount: number = 1,
  masterFactor: number = 0.7,
  gapParams: LayoutGapParams = DEFAULT_GAP_PARAMS
): WindowRect[] {
  if (windowCount === 0) return [];

  const { gappoh, gappov, gappih, gappiv } = getGaps(windowCount, gapParams);

  const n = windowCount;
  const nmasters = Math.min(masterCount, n);
  const stackCount = n - nmasters;

  let mw: number;
  if (n > nmasters) {
    mw = nmasters ? Math.round((container.width - 2 * gappoh) * masterFactor) : 0;
  } else {
    mw = container.width - 2 * gappoh;
  }

  const rects: WindowRect[] = [];

  let my = 0;
  for (let i = 0; i < nmasters; i++) {
    const masterHeight = (container.height - 2 * gappov - my) / (Math.min(n, nmasters) - i);
    rects.push({
      x: gappoh,
      y: gappov + my,
      width: mw,
      height: Math.round(masterHeight),
    });
    my += masterHeight;
  }

  for (let i = 0; i < stackCount; i++) {
    rects.push({
      x: mw + gappoh + gappih,
      y: gappov,
      width: container.width - mw - 2 * gappoh - gappih,
      height: container.height - 2 * gappov,
    });
  }

  return rects;
}

export function calculateVerticalDeckLayout(
  container: ContainerDims,
  windowCount: number,
  masterCount: number = 1,
  masterFactor: number = 0.7,
  gapParams: LayoutGapParams = DEFAULT_GAP_PARAMS
): WindowRect[] {
  if (windowCount === 0) return [];

  const { gappoh, gappov, gappih, gappiv } = getGaps(windowCount, gapParams);

  const n = windowCount;
  const nmasters = Math.min(masterCount, n);
  const stackCount = n - nmasters;

  let mh: number;
  if (n > nmasters) {
    mh = nmasters ? Math.round((container.height - 2 * gappov) * masterFactor) : 0;
  } else {
    mh = container.height - 2 * gappov;
  }

  const rects: WindowRect[] = [];

  let mx = 0;
  for (let i = 0; i < nmasters; i++) {
    const masterWidth = (container.width - 2 * gappoh - mx) / (Math.min(n, nmasters) - i);
    rects.push({
      x: gappoh + mx,
      y: gappov,
      width: Math.round(masterWidth),
      height: mh,
    });
    mx += masterWidth;
  }

  for (let i = 0; i < stackCount; i++) {
    rects.push({
      x: gappoh,
      y: mh + gappov + gappiv,
      width: container.width - 2 * gappoh,
      height: container.height - mh - 2 * gappov - gappiv,
    });
  }

  return rects;
}

export interface CenterTileConfig {
  centerMasterOverspread: boolean;
  centerWhenSingleStack: boolean;
}

export function calculateCenterTileLayout(
  container: ContainerDims,
  windowCount: number,
  masterCount: number = 1,
  masterFactor: number = 0.5,
  gapParams: LayoutGapParams = DEFAULT_GAP_PARAMS,
  centerTileConfig?: CenterTileConfig,
  masterInnerPers: number[] = [],
  stackInnerPers: number[] = []
): WindowRect[] {
  if (windowCount === 0) return [];

  const { gappoh, gappov, gappih, gappiv } = getGaps(windowCount, gapParams);
  const ie = gapParams.enableGaps ? 1 : 0;

  const n = windowCount;
  const nmasters = Math.min(masterCount, n);
  const stackCount = n - nmasters;

  const rects: WindowRect[] = [];

  const centerMasterOverspread = centerTileConfig?.centerMasterOverspread ?? false;
  const centerWhenSingleStack = centerTileConfig?.centerWhenSingleStack ?? true;

  const shouldOverspread = centerMasterOverspread && (n <= nmasters);

  let mw: number;
  let mx: number;
  let tw: number;

  if (n > nmasters || !shouldOverspread) {
    mw = nmasters ? Math.round((container.width - 2 * gappoh - gappih * ie) * masterFactor) : 0;

    if (stackCount > 1) {
      tw = Math.round((container.width - mw) / 2 - gappoh - gappih * ie);
      mx = gappoh + tw + gappih * ie;
    } else if (stackCount === 1) {
      if (centerWhenSingleStack) {
        tw = Math.round((container.width - mw) / 2 - gappoh - gappih * ie);
        mx = gappoh + tw + gappih * ie;
      } else {
        tw = container.width - mw - 2 * gappoh - gappih * ie;
        mx = gappoh;
      }
    } else {
      tw = Math.round((container.width - mw) / 2 - gappoh - gappih * ie);
      mx = gappoh + tw + gappih * ie;
    }
  } else {
    mw = container.width - 2 * gappoh;
    mx = gappoh;
    tw = 0;
  }

  let my = gappov;
  let oty = gappov;
  let ety = gappov;

  for (let i = 0; i < n; i++) {
    if (i < nmasters) {
      const r = Math.min(n, nmasters) - i;
      const availableHeight = container.height - my - gappov - gappiv * ie * (r - 1);
      const h = Math.round(availableHeight / r);
      rects.push({
        x: mx,
        y: my,
        width: mw,
        height: h,
      });
      my += h + gappiv * ie;
    } else {
      const stackIndex = i - nmasters;
      const isRightStack = Boolean((stackIndex % 2) ^ (n % 2 === 0 ? 1 : 0));
      
      if (stackCount === 1) {
        const r = n - i;
        const availableHeight = container.height - ety - gappov - gappiv * ie * (r - 1);
        const h = Math.round(availableHeight / r);
        rects.push({
          x: mx + mw + gappih * ie,
          y: ety,
          width: tw,
          height: h,
        });
        ety += h + gappiv * ie;
      } else {
        const r = Math.ceil((n - i) / 2);
        
        if (isRightStack) {
          const availableHeight = container.height - ety - gappov - gappiv * ie * (r - 1);
          const h = Math.round(availableHeight / r);
          rects.push({
            x: mx + mw + gappih * ie,
            y: ety,
            width: tw,
            height: h,
          });
          ety += h + gappiv * ie;
        } else {
          const availableHeight = container.height - oty - gappov - gappiv * ie * (r - 1);
          const h = Math.round(availableHeight / r);
          rects.push({
            x: gappoh,
            y: oty,
            width: tw,
            height: h,
          });
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
  masterCount: number = 1,
  masterFactor: number = 0.5,
  gapParams: LayoutGapParams = DEFAULT_GAP_PARAMS,
  masterInnerPers: number[] = [],
  stackInnerPers: number[] = []
): WindowRect[] {
  if (windowCount === 0) return [];

  const { gappoh, gappov, gappih, gappiv } = getGaps(windowCount, gapParams);
  const ie = gapParams.enableGaps ? 1 : 0;

  const n = windowCount;
  const nmasters = Math.min(masterCount, n);
  const stackCount = n - nmasters;

  const rects: WindowRect[] = [];

  let mw: number;
  if (n > nmasters) {
    mw = nmasters ? Math.round((container.width + gappih * ie) * masterFactor) : 0;
  } else {
    mw = container.width - 2 * gappoh + gappih * ie;
  }

  let my = gappov;
  let ty = gappov;

  for (let i = 0; i < n; i++) {
    if (i < nmasters) {
      const r = Math.min(n, nmasters) - i;
      const availableHeight = container.height - my - gappov - gappiv * ie * (r - 1);
      const h = Math.round(availableHeight / r);
      rects.push({
        x: container.width - mw - gappoh + gappih * ie,
        y: my,
        width: mw - gappih * ie,
        height: h,
      });
      my += h + gappiv * ie;
    } else {
      const r = n - i;
      const availableHeight = container.height - ty - gappov - gappiv * ie * (r - 1);
      const h = Math.round(availableHeight / r);
      rects.push({
        x: gappoh,
        y: ty,
        width: container.width - mw - 2 * gappoh,
        height: h,
      });
      ty += h + gappiv * ie;
    }
  }

  return rects;
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

export function calculateScrollerLayout(
  container: ContainerDims,
  windowCount: number,
  focusIndex: number = 0,
  gapParams: LayoutGapParams = DEFAULT_GAP_PARAMS,
  config: ScrollerConfig,
  stackProportions: number[] = []
): WindowRect[] {
  if (windowCount === 0) return [];

  const { gappoh, gappov, gappih } = getGaps(windowCount, gapParams);
  const ie = gapParams.enableGaps ? 1 : 0;
  const n = windowCount;

  if (n === 1 && !config.scrollerIgnoreSingle) {
    const width = (container.width - 2 * gappoh) * config.scrollerDefaultProportionSingle;
    const height = container.height - 2 * gappov;
    return [{
      x: gappoh + (container.width - 2 * gappoh - width) / 2,
      y: gappov + (container.height - 2 * gappov - height) / 2,
      width: Math.round(width),
      height: Math.round(height),
    }];
  }

  const rects: WindowRect[] = new Array(n);
  const getProportion = (i: number) => stackProportions[i] ?? config.scrollerDefaultProportion;

  const maxClientWidth = container.width - 2 * config.scrollerStructs - gappih * ie;

  const needOverspread = config.scrollerPreferOverspread && n > 1 &&
    (focusIndex === 0 || focusIndex === n - 1) &&
    getProportion(focusIndex) < 1.0;
  
  const overspreadLeft = needOverspread && focusIndex === 0;

  const needCenter = config.scrollerFocusCenter || n === 1 ||
    (config.scrollerPreferCenter && !needOverspread);

  const focusWidth = maxClientWidth * getProportion(focusIndex);
  const focusHeight = container.height - 2 * gappov;
  const focusY = gappov + (container.height - 2 * gappov - focusHeight) / 2;

  let focusX = config.scrollerStructs;
  if (needCenter) {
    focusX = (container.width - focusWidth) / 2;
  } else if (needOverspread) {
    focusX = overspreadLeft ? config.scrollerStructs : container.width - focusWidth - config.scrollerStructs;
  } else if (focusIndex > container.width / 2) {
    focusX = container.width - focusWidth - config.scrollerStructs;
  }

  rects[focusIndex] = {
    x: Math.round(focusX),
    y: Math.round(focusY),
    width: Math.round(focusWidth),
    height: Math.round(focusHeight),
  };

  for (let i = focusIndex - 1; i >= 0; i--) {
    const w = maxClientWidth * getProportion(i);
    rects[i] = {
      x: Math.round(rects[i + 1].x - gappih * ie - w),
      y: Math.round(focusY),
      width: Math.round(w),
      height: Math.round(focusHeight),
    };
  }

  for (let i = focusIndex + 1; i < n; i++) {
    const w = maxClientWidth * getProportion(i);
    rects[i] = {
      x: Math.round(rects[i - 1].x + rects[i - 1].width + gappih * ie),
      y: Math.round(focusY),
      width: Math.round(w),
      height: Math.round(focusHeight),
    };
  }

  return rects;
}

export function calculateVerticalScrollerLayout(
  container: ContainerDims,
  windowCount: number,
  focusIndex: number = 0,
  gapParams: LayoutGapParams = DEFAULT_GAP_PARAMS,
  config: ScrollerConfig,
  stackProportions: number[] = []
): WindowRect[] {
  if (windowCount === 0) return [];

  const { gappoh, gappov, gappiv } = getGaps(windowCount, gapParams);
  const ie = gapParams.enableGaps ? 1 : 0;
  const n = windowCount;

  if (n === 1 && !config.scrollerIgnoreSingle) {
    const height = (container.height - 2 * gappov) * config.scrollerDefaultProportionSingle;
    const width = container.width - 2 * gappoh;
    return [{
      x: gappoh + (container.width - 2 * gappoh - width) / 2,
      y: gappov + (container.height - 2 * gappov - height) / 2,
      width: Math.round(width),
      height: Math.round(height),
    }];
  }

  const rects: WindowRect[] = new Array(n);
  const getProportion = (i: number) => stackProportions[i] ?? config.scrollerDefaultProportion;

  const maxClientHeight = container.height - 2 * config.scrollerStructs - gappiv * ie;

  const needOverspread = config.scrollerPreferOverspread && n > 1 &&
    (focusIndex === 0 || focusIndex === n - 1) &&
    getProportion(focusIndex) < 1.0;
  
  const overspreadUp = needOverspread && focusIndex === 0;

  const needCenter = config.scrollerFocusCenter || n === 1 ||
    (config.scrollerPreferCenter && !needOverspread);

  const focusHeight = maxClientHeight * getProportion(focusIndex);
  const focusWidth = container.width - 2 * gappoh;
  const focusX = gappoh + (container.width - 2 * gappoh - focusWidth) / 2;

  let focusY = config.scrollerStructs;
  if (needCenter) {
    focusY = (container.height - focusHeight) / 2;
  } else if (needOverspread) {
    focusY = overspreadUp ? config.scrollerStructs : container.height - focusHeight - config.scrollerStructs;
  } else if (focusIndex > container.height / 2) {
    focusY = container.height - focusHeight - config.scrollerStructs;
  }

  rects[focusIndex] = {
    x: Math.round(focusX),
    y: Math.round(focusY),
    width: Math.round(focusWidth),
    height: Math.round(focusHeight),
  };

  for (let i = focusIndex - 1; i >= 0; i--) {
    const h = maxClientHeight * getProportion(i);
    rects[i] = {
      x: Math.round(focusX),
      y: Math.round(rects[i + 1].y - gappiv * ie - h),
      width: Math.round(focusWidth),
      height: Math.round(h),
    };
  }

  for (let i = focusIndex + 1; i < n; i++) {
    const h = maxClientHeight * getProportion(i);
    rects[i] = {
      x: Math.round(focusX),
      y: Math.round(rects[i - 1].y + rects[i - 1].height + gappiv * ie),
      width: Math.round(focusWidth),
      height: Math.round(h),
    };
  }

  return rects;
}

export function calculateTgmixLayout(
  container: ContainerDims,
  windowCount: number,
  masterCount: number = 1,
  masterFactor: number = 0.5
): WindowRect[] {
  if (windowCount <= 3) {
    return calculateTileLayout(container, windowCount, masterCount, masterFactor);
  } else {
    return calculateGridLayout(container, windowCount);
  }
}

export function calculateOverviewLayout(
  container: ContainerDims,
  windowCount: number,
  overviewGapOuter: number = 30,
  overviewGapInner: number = 5
): WindowRect[] {
  if (windowCount === 0) return [];

  const n = windowCount;

  if (n === 1) {
    const cw = (container.width - 2 * overviewGapOuter) * 0.7;
    const ch = (container.height - 2 * overviewGapOuter) * 0.8;
    return [{
      x: overviewGapOuter + (container.width - 2 * overviewGapOuter - cw) / 2,
      y: overviewGapOuter + (container.height - 2 * overviewGapOuter - ch) / 2,
      width: cw,
      height: ch,
    }];
  }

  let cols = 0;
  for (cols = 0; cols <= n / 2; cols++) {
    if (cols * cols >= n) break;
  }
  const rows = (cols && (cols - 1) * cols >= n) ? cols - 1 : cols;

  const cellWidth = (container.width - 2 * overviewGapOuter - (cols - 1) * overviewGapInner) / cols;
  const cellHeight = (container.height - 2 * overviewGapOuter - (rows - 1) * overviewGapInner) / rows;

  const overcols = n % cols;
  let dx = 0;
  if (overcols) {
    dx = Math.round((container.width - overcols * cellWidth - (overcols - 1) * overviewGapInner) / 2 - overviewGapOuter);
  }

  const rects: WindowRect[] = [];
  for (let i = 0; i < n; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    let cx = overviewGapOuter + col * (cellWidth + overviewGapInner);
    if (overcols && i >= n - overcols) {
      cx += dx;
    }
    rects.push({
      x: cx,
      y: overviewGapOuter + row * (cellHeight + overviewGapInner),
      width: Math.round(cellWidth),
      height: Math.round(cellHeight),
    });
  }

  return rects;
}
