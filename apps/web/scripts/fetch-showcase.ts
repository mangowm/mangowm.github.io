import "dotenv/config";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { parse } from "yaml";

const RAW_BASE = "https://raw.githubusercontent.com/mangowm/mango-showcase/HEAD";
const FETCH_TIMEOUT = 15_000;
const MAX_RETRIES = 3;

async function fetchWithTimeout(url: string, init?: RequestInit): Promise<Response> {
  return fetch(url, { ...init, signal: AbortSignal.timeout(FETCH_TIMEOUT) });
}

function backoffDelay(attempt: number): number {
  const base = Math.pow(2, attempt) * 1000;
  return base + Math.random() * base * 0.5;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toRawBase(dotfilesUrl: string): string {
  const url = new URL(dotfilesUrl);
  return `https://raw.githubusercontent.com${url.pathname}/HEAD`;
}

type RawEntry = {
  username: string;
  dotfiles: string;
  tags: string[];
  added?: string;
};

type ShowcaseEntry = {
  username: string;
  screenshots: string[];
  videos: string[];
  dotfiles: string;
  tags: string[];
  added: string | null;
};

async function main() {
  if (process.env.SKIP_SHOWCASE === "true") {
    console.log("SKIP_SHOWCASE is set, skipping showcase fetch.");
    return;
  }
  console.log("Fetching showcase entries and downloading images...");

  const __dirname = path.dirname(fileURLToPath(import.meta.url));

  let rawEntries: RawEntry[] = [];
  for (let attempt = 0; ; attempt++) {
    try {
      const res = await fetchWithTimeout(`${RAW_BASE}/entries.yml`);
      if (res.status === 429 && attempt < MAX_RETRIES) {
        const retryAfter = res.headers.get("Retry-After");
        const waitMs = retryAfter ? parseInt(retryAfter) * 1000 : backoffDelay(attempt);
        console.warn(`Rate limited on entries.yml, retrying in ${Math.round(waitMs)}ms...`);
        await sleep(waitMs);
        continue;
      }
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const yamlText = await res.text();
      rawEntries = parse(yamlText) || [];
      break;
    } catch (err: any) {
      if (attempt < MAX_RETRIES && (err.name === "TimeoutError" || err.cause?.code === "ECONNRESET")) {
        console.warn(`Fetch attempt ${attempt + 1} failed, retrying:`, err.message ?? err);
        await sleep(backoffDelay(attempt));
        continue;
      }
      console.warn("Failed to fetch entries.yml, continuing with empty showcase:", err.message ?? err);
      await fs.writeFile(
        path.resolve(__dirname, "../src/showcase.json"),
        JSON.stringify([], null, 2),
      );
      return;
    }
  }

  const imagesDir = path.resolve(__dirname, "../public/showcase");
  await fs.mkdir(imagesDir, { recursive: true });

  const entries: ShowcaseEntry[] = [];

  function getMediaUrl(rawBase: string, name: string): string {
    if (name === "screenshot.png") return `${rawBase}/screenshot.png`;
    if (name.includes("/")) return `${rawBase}/${name}`;
    return `${rawBase}/screenshots/${name}`;
  }

  function getSavedFilename(username: string, name: string): string {
    return `${username}-${path.basename(name)}`;
  }

  for (const item of rawEntries) {
    try {
      if (!item.username || !item.dotfiles) {
        console.warn("  ⚠ Skipping malformed entry (missing username or dotfiles):", item);
        continue;
      }

      const { username, dotfiles, tags = [], added = null } = item;

      const rawBase = toRawBase(dotfiles);

      console.log(`Fetching screenshots for @${username}...`);

      const screenshotNames: string[] = [];

      for (let i = 1; ; i++) {
        const probe = await fetchWithTimeout(`${rawBase}/showcase/images/${i}.png`, { method: "HEAD" });
        if (!probe.ok) break;
        screenshotNames.push(`showcase/images/${i}.png`);
      }

      if (screenshotNames.length === 0) {
        const probe = await fetchWithTimeout(`${rawBase}/showcase/image.png`, { method: "HEAD" });
        if (probe.ok) screenshotNames.push("showcase/image.png");
      }

      if (screenshotNames.length === 0) {
        for (let i = 1; ; i++) {
          const probe = await fetchWithTimeout(`${rawBase}/screenshots/${i}.png`, { method: "HEAD" });
          if (!probe.ok) break;
          screenshotNames.push(`${i}.png`);
        }
      }

      if (screenshotNames.length === 0) {
        const rootProbe = await fetchWithTimeout(`${rawBase}/screenshot.png`, { method: "HEAD" });
        if (rootProbe.ok) screenshotNames.push("screenshot.png");
      }

      if (screenshotNames.length === 0) {
        console.warn(`  ⚠ Skipping @${username}: no screenshots found`);
        continue;
      }

      const savedPaths: string[] = [];
      for (const name of screenshotNames) {
        const url = getMediaUrl(rawBase, name);
        const imgRes = await fetchWithTimeout(url);
        if (!imgRes.ok) continue;
        const buffer = Buffer.from(await imgRes.arrayBuffer());
        const fileName = getSavedFilename(username, name);
        await fs.writeFile(path.join(imagesDir, fileName), buffer);
        savedPaths.push(`/showcase/${fileName}`);
      }

      const videoNames: string[] = [];

      for (let i = 1; ; i++) {
        const probe = await fetchWithTimeout(`${rawBase}/showcase/videos/${i}.mp4`, { method: "HEAD" });
        if (!probe.ok) break;
        videoNames.push(`showcase/videos/${i}.mp4`);
      }

      if (videoNames.length === 0) {
        const probe = await fetchWithTimeout(`${rawBase}/showcase/video.mp4`, { method: "HEAD" });
        if (probe.ok) videoNames.push("showcase/video.mp4");
      }

      const savedVideoPaths: string[] = [];
      for (const name of videoNames) {
        const url = `${rawBase}/${name}`;
        const vidRes = await fetchWithTimeout(url);
        if (!vidRes.ok) continue;
        const buffer = Buffer.from(await vidRes.arrayBuffer());
        const fileName = getSavedFilename(username, name);
        await fs.writeFile(path.join(imagesDir, fileName), buffer);
        savedVideoPaths.push(`/showcase/${fileName}`);
      }

      if (savedVideoPaths.length > 0) {
        console.log(`  ✓ Found ${savedVideoPaths.length} video(s) for @${username}`);
      }

      entries.push({
        username,
        screenshots: savedPaths,
        videos: savedVideoPaths,
        dotfiles,
        tags,
        added,
      });
    } catch (err: any) {
      console.warn(`  ⚠ Failed to fetch entry for @${item.username ?? "unknown"}, skipping:`, err.message ?? err);
    }
  }

  entries.sort((a, b) => {
    if (!a.added && !b.added) return 0;
    if (!a.added) return 1;
    if (!b.added) return -1;
    return b.added.localeCompare(a.added);
  });

  await fs.writeFile(
    path.resolve(__dirname, "../src/showcase.json"),
    JSON.stringify(entries, null, 2),
  );

  console.log(`\nSuccessfully generated showcase.json with ${entries.length} entries.`);
}

main().catch((err) => {
  const isNetwork =
    err?.cause?.code === "ENOTFOUND" ||
    err?.cause?.code === "ECONNRESET" ||
    err?.name === "TypeError" ||
    err?.name === "TimeoutError";
  if (isNetwork) {
    console.warn("Showcase fetch failed (network), continuing build without it:", err.message ?? err);
    process.exit(0);
  }
  throw err;
});
