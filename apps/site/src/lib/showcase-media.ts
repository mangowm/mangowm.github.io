const IMAGE_EXTS = ["png", "jpg", "jpeg", "webp", "avif"] as const;
const VIDEO_EXTS = ["mp4", "webm"] as const;

export const SHOWCASE_DIR = "showcase";
export const SCREENSHOT_MULTI = `${SHOWCASE_DIR}/images`;
const SCREENSHOT_SINGLE = `${SHOWCASE_DIR}/image`;
export const VIDEO_MULTI = `${SHOWCASE_DIR}/videos`;
const VIDEO_SINGLE = `${SHOWCASE_DIR}/video`;
export const LEGACY_SCREENSHOT_MULTI = "screenshots";
const LEGACY_SCREENSHOT_SINGLE = "screenshot.png";

function basename(filePath: string): string {
  return filePath.slice(filePath.lastIndexOf("/") + 1);
}

function inDir(filePath: string, dir: string): boolean {
  return filePath.startsWith(`${dir}/`) && !filePath.slice(dir.length + 1).includes("/");
}

function numberIn(filePath: string): number {
  const match = /(\d+)\.[^./]+$/.exec(filePath);
  return match ? Number(match[1]) : 0;
}

const IMAGE_ALT = IMAGE_EXTS.join("|");
const VIDEO_ALT = VIDEO_EXTS.join("|");

const NUMBERED_IMAGE_RE = new RegExp(`^\\d+\\.(?:${IMAGE_ALT})$`, "i");
const NUMBERED_VIDEO_RE = new RegExp(`^\\d+\\.(?:${VIDEO_ALT})$`, "i");
const SINGLE_IMAGE_RE = new RegExp(`^${basename(SCREENSHOT_SINGLE)}\\.(?:${IMAGE_ALT})$`, "i");
const SINGLE_VIDEO_RE = new RegExp(`^${basename(VIDEO_SINGLE)}\\.(?:${VIDEO_ALT})$`, "i");

const VIDEO_MIME: Record<string, string> = {
  mp4: "video/mp4",
  webm: "video/webm",
};

export function videoMimeType(url: string): string | undefined {
  const path = url.split(/[?#]/)[0] ?? "";
  return VIDEO_MIME[path.slice(path.lastIndexOf(".") + 1).toLowerCase()];
}

export function pickScreenshots(paths: string[]): string[] {
  const multiple = paths
    .filter(
      (filePath) => inDir(filePath, SCREENSHOT_MULTI) && NUMBERED_IMAGE_RE.test(basename(filePath)),
    )
    .sort((a, b) => numberIn(a) - numberIn(b));
  if (multiple.length > 0) return multiple;

  const single = paths.filter(
    (filePath) => inDir(filePath, SHOWCASE_DIR) && SINGLE_IMAGE_RE.test(basename(filePath)),
  );
  if (single.length > 0) return single.slice(0, 1);

  const legacy = paths
    .filter(
      (filePath) =>
        inDir(filePath, LEGACY_SCREENSHOT_MULTI) && NUMBERED_IMAGE_RE.test(basename(filePath)),
    )
    .sort((a, b) => numberIn(a) - numberIn(b));
  if (legacy.length > 0) return legacy;

  return paths
    .filter((filePath) => filePath.toLowerCase() === LEGACY_SCREENSHOT_SINGLE)
    .slice(0, 1);
}

export function pickVideos(paths: string[]): string[] {
  const multiple = paths
    .filter(
      (filePath) => inDir(filePath, VIDEO_MULTI) && NUMBERED_VIDEO_RE.test(basename(filePath)),
    )
    .sort((a, b) => numberIn(a) - numberIn(b));
  if (multiple.length > 0) return multiple;

  return paths
    .filter((filePath) => inDir(filePath, SHOWCASE_DIR) && SINGLE_VIDEO_RE.test(basename(filePath)))
    .slice(0, 1);
}

export function parseRepo(dotfiles: string): { owner: string; repo: string } | null {
  try {
    const url = new URL(dotfiles);
    if (url.protocol !== "https:" || url.hostname !== "github.com") return null;
    const [owner, repo, ...rest] = url.pathname.replace(/^\/+|\/+$/g, "").split("/");
    if (!owner || !repo || rest.length || repo.toLowerCase().endsWith(".git")) return null;
    return { owner, repo };
  } catch {
    return null;
  }
}
