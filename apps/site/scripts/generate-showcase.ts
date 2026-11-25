import { createHash } from "node:crypto";
import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ResizeFilterType, Transformer } from "@napi-rs/image";
import { parse } from "yaml";
import type { ShowcaseEntry, ShowcaseImage } from "../src/lib/showcase-data.ts";
import {
  LEGACY_SCREENSHOT_MULTI,
  parseRepo,
  pickScreenshots,
  pickVideos,
  SHOWCASE_DIR,
  SCREENSHOT_MULTI,
  VIDEO_MULTI,
} from "../src/lib/showcase-media.ts";

const ENTRIES_URL = "https://raw.githubusercontent.com/mangowm/mango-showcase/HEAD/entries.yml";
const API = "https://api.github.com";
const DISCOVERY_CONCURRENCY = 5;
const ENTRY_CONCURRENCY = 4;
const USERNAME_RE = /^[A-Za-z0-9-]+$/;

const MAX_WIDTH = 2560;
const WIDTHS: number[] = [480, 768, 1080, 1440, 1920, MAX_WIDTH];
const WEBP_QUALITY = 80;
const HASH_LENGTH = 10;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_FILE = path.resolve(__dirname, "../src/data/showcase.json");
const PUBLIC_MEDIA_DIR = "showcase";
const MEDIA_DIR = path.resolve(__dirname, "../public", PUBLIC_MEDIA_DIR);

type RawEntry = {
  username?: unknown;
  dotfiles?: unknown;
  tags?: unknown;
  added?: unknown;
};

type MediaFile = { url: string; fileName: string };

type ResolvedEntry = Omit<ShowcaseEntry, "screenshots" | "videos"> & {
  screenshots: MediaFile[];
  videos: MediaFile[];
};

function githubHeaders(): Record<string, string> {
  const token = process.env.GITHUB_TOKEN;
  const headers: Record<string, string> = { "X-GitHub-Api-Version": "2022-11-28" };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

function rawUrl(owner: string, repo: string, filePath: string): string {
  const encoded = filePath.split("/").map(encodeURIComponent).join("/");
  return `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/${encoded}`;
}

function safeSegment(value: string): string {
  return value.replace(/[^\w.-]+/g, "-").replace(/^-+/, "");
}

function shortHash(input: Buffer): string {
  return createHash("sha256").update(input).digest("hex").slice(0, HASH_LENGTH);
}

function mediaBase(username: string, fileName: string, input: Buffer): string {
  const stem = path.parse(fileName).name;
  return `${safeSegment(username)}-${safeSegment(stem) || "media"}-${shortHash(input)}`;
}

function widthsFor(width: number): number[] {
  const widths = WIDTHS.filter((candidate) => candidate < width);
  widths.push(Math.min(width, MAX_WIDTH));
  return widths;
}

async function download(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}

async function processScreenshot(username: string, file: MediaFile): Promise<ShowcaseImage> {
  const input = await download(file.url);
  const base = mediaBase(username, file.fileName, input);
  const metadata = await new Transformer(input).metadata();
  const orientation = metadata.orientation ?? 1;
  const swapAxes = orientation >= 5 && orientation <= 8;
  const width = swapAxes ? metadata.height : metadata.width;
  const height = swapAxes ? metadata.width : metadata.height;
  if (width <= 0 || height <= 0) throw new Error("image has invalid dimensions");
  const widths = widthsFor(width);

  for (const variantWidth of widths) {
    const transformer = new Transformer(input);
    transformer.rotate();
    if (variantWidth !== width) {
      transformer.resize({ width: variantWidth, filter: ResizeFilterType.Lanczos3 });
    }
    const webp = await transformer.webp(WEBP_QUALITY);
    await writeFile(path.join(MEDIA_DIR, `${base}-${variantWidth}.webp`), webp);
  }

  return { base: `/${PUBLIC_MEDIA_DIR}/${base}`, width, height, widths };
}

async function processVideo(username: string, file: MediaFile): Promise<string> {
  const input = await download(file.url);
  const name = `${mediaBase(username, file.fileName, input)}${path.extname(file.fileName).toLowerCase()}`;
  await writeFile(path.join(MEDIA_DIR, name), input);
  return `/${PUBLIC_MEDIA_DIR}/${name}`;
}

async function buildEntry(entry: ResolvedEntry): Promise<ShowcaseEntry | null> {
  try {
    const screenshots: ShowcaseImage[] = [];
    for (const file of entry.screenshots) {
      screenshots.push(await processScreenshot(entry.username, file));
    }

    const videos: string[] = [];
    for (const file of entry.videos) {
      videos.push(await processVideo(entry.username, file));
    }

    if (screenshots.length === 0 && videos.length === 0) {
      console.warn(`Showcase: dropping ${entry.username} (no usable media)`);
      return null;
    }

    return {
      username: entry.username,
      dotfiles: entry.dotfiles,
      tags: entry.tags,
      added: entry.added,
      screenshots,
      videos,
    };
  } catch (error) {
    console.warn(`Showcase: dropping ${entry.username} (${(error as Error).message})`);
    return null;
  }
}

async function listContents(owner: string, repo: string, dir: string): Promise<string[] | null> {
  const suffix = dir ? `/${dir}` : "";
  const response = await fetch(`${API}/repos/${owner}/${repo}/contents${suffix}`, {
    headers: githubHeaders(),
  });
  if (!response.ok) return null;
  const data: unknown = await response.json();
  if (!Array.isArray(data)) return null;
  return data
    .map((item) => (item && typeof item === "object" ? (item as { path?: unknown }).path : null))
    .filter((filePath): filePath is string => typeof filePath === "string");
}

async function listRepoPaths(owner: string, repo: string): Promise<string[] | null> {
  const response = await fetch(`${API}/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`, {
    headers: githubHeaders(),
  });
  if (response.ok) {
    const data = (await response.json()) as {
      tree?: Array<{ type?: string; path?: string }>;
      truncated?: boolean;
    };
    if (!data.truncated) {
      return (data.tree ?? [])
        .filter((node) => node.type === "blob" && typeof node.path === "string")
        .map((node) => node.path as string);
    }
  }

  const listings = await Promise.all([
    listContents(owner, repo, SHOWCASE_DIR),
    listContents(owner, repo, SCREENSHOT_MULTI),
    listContents(owner, repo, VIDEO_MULTI),
    listContents(owner, repo, LEGACY_SCREENSHOT_MULTI),
    listContents(owner, repo, ""),
  ]);
  const found = listings.filter((listing): listing is string[] => listing !== null);
  if (found.length === 0) return null;
  return [...new Set(found.flat())];
}

async function mapLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = [];
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await fn(items[index]!);
    }
  });
  await Promise.all(workers);
  return results;
}

function normalizeTags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const tags: string[] = [];
  for (const item of value) {
    if (typeof item !== "string") continue;
    const tag = item.trim().toLowerCase();
    if (!tag || seen.has(tag)) continue;
    seen.add(tag);
    tags.push(tag);
  }
  return tags;
}

async function resolveEntry(raw: RawEntry): Promise<ResolvedEntry | null> {
  const username = typeof raw.username === "string" ? raw.username.trim() : "";
  const dotfiles = typeof raw.dotfiles === "string" ? raw.dotfiles.trim() : "";
  if (!username || !dotfiles) return null;
  if (!USERNAME_RE.test(username)) {
    console.warn(`Showcase: skipping entry with invalid username "${username}"`);
    return null;
  }

  const tags = normalizeTags(raw.tags);
  const added = typeof raw.added === "string" ? raw.added : null;

  const repo = parseRepo(dotfiles);
  if (!repo) {
    console.warn(`Showcase: skipping ${username} (dotfiles is not a GitHub repo)`);
    return null;
  }

  let paths: string[] | null;
  try {
    paths = await listRepoPaths(repo.owner, repo.repo);
  } catch (error) {
    console.warn(`Showcase: skipping ${username} (list failed: ${(error as Error).message})`);
    return null;
  }
  if (!paths) {
    console.warn(`Showcase: skipping ${username} (could not list ${repo.owner}/${repo.repo})`);
    return null;
  }

  const toMedia = (filePaths: string[]): MediaFile[] =>
    filePaths.map((filePath) => ({
      url: rawUrl(repo.owner, repo.repo, filePath),
      fileName: path.basename(filePath),
    }));

  const screenshots = toMedia(pickScreenshots(paths));
  const videos = toMedia(pickVideos(paths));
  if (screenshots.length === 0 && videos.length === 0) {
    console.warn(`Showcase: skipping ${username} (no media found)`);
    return null;
  }

  return { username, dotfiles, tags, added, screenshots, videos };
}

function compareByAdded(a: { added: string | null }, b: { added: string | null }): number {
  if (!a.added && !b.added) return 0;
  if (!a.added) return 1;
  if (!b.added) return -1;
  return b.added.localeCompare(a.added);
}

function dedupeByUsername(entries: ResolvedEntry[]): ResolvedEntry[] {
  const seen = new Set<string>();
  return entries.filter((entry) => {
    const key = entry.username.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function loadEntries(): Promise<ResolvedEntry[]> {
  const response = await fetch(ENTRIES_URL);
  if (!response.ok) throw new Error(`Failed to fetch entries.yml (HTTP ${response.status})`);

  const raw = parse(await response.text()) as unknown;
  if (!Array.isArray(raw)) throw new Error("entries.yml did not parse to a list");

  const resolved = await mapLimit(raw as RawEntry[], DISCOVERY_CONCURRENCY, resolveEntry);
  const entries = resolved
    .filter((entry): entry is ResolvedEntry => entry !== null)
    .sort(compareByAdded);
  return dedupeByUsername(entries);
}

async function outputExists(): Promise<boolean> {
  try {
    await access(OUTPUT_FILE);
    return true;
  } catch {
    return false;
  }
}

async function writeEmpty(): Promise<void> {
  await mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
  await writeFile(OUTPUT_FILE, "[]\n");
}

async function main() {
  try {
    const discovered = await loadEntries();
    await mkdir(MEDIA_DIR, { recursive: true });
    const built = await mapLimit(discovered, ENTRY_CONCURRENCY, buildEntry);
    const entries = built.filter((entry): entry is ShowcaseEntry => entry !== null);
    if (discovered.length > 0 && entries.length === 0) {
      throw new Error("no entries survived media processing");
    }
    await mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
    await writeFile(OUTPUT_FILE, `${JSON.stringify(entries, null, 2)}\n`);
    console.log(`Showcase: wrote ${entries.length} entries to src/data/showcase.json`);
  } catch (error) {
    if (await outputExists()) {
      console.warn("Showcase: generation failed, keeping existing data.", error);
      return;
    }
    await writeEmpty();
    console.warn("Showcase: generation failed and no data exists; wrote an empty list.", error);
  }
}

await main();
