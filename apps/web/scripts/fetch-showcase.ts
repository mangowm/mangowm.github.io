import "dotenv/config";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { parse } from "yaml";

const RAW_BASE = "https://raw.githubusercontent.com/mangowm/mango-showcase/HEAD";

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

  const res = await fetch(`${RAW_BASE}/entries.yml`);
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

  const yamlText = await res.text();
  const rawEntries: RawEntry[] = parse(yamlText) || [];

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const imagesDir = path.resolve(__dirname, "../public/showcase");
  await fs.mkdir(imagesDir, { recursive: true });

  const entries: ShowcaseEntry[] = [];

  for (const item of rawEntries) {
    if (!item.username || !item.dotfiles) {
      console.warn("  ⚠ Skipping malformed entry (missing username or dotfiles):", item);
      continue;
    }

    const { username, dotfiles, tags = [], added = null } = item;

    const rawBase = toRawBase(dotfiles);

    console.log(`Fetching screenshots for @${username}...`);

    const screenshotNames: string[] = [];

    for (let i = 1; i <= 10; i++) {
      const probe = await fetch(`${rawBase}/screenshots/${i}.png`, { method: "HEAD" });
      if (!probe.ok) break;
      screenshotNames.push(`${i}.png`);
    }

    if (screenshotNames.length === 0) {
      const rootProbe = await fetch(`${rawBase}/screenshot.png`, { method: "HEAD" });
      if (rootProbe.ok) screenshotNames.push("screenshot.png");
    }

    if (screenshotNames.length === 0) {
      console.warn(`  ⚠ Skipping @${username}: no screenshots found`);
      continue;
    }

    const savedPaths: string[] = [];
    for (const name of screenshotNames) {
      const isRoot = name === "screenshot.png";
      const url = isRoot ? `${rawBase}/screenshot.png` : `${rawBase}/screenshots/${name}`;
      const imgRes = await fetch(url);
      if (!imgRes.ok) continue;
      const buffer = Buffer.from(await imgRes.arrayBuffer());
      const fileName = `${username}-${name}`;
      await fs.writeFile(path.join(imagesDir, fileName), buffer);
      savedPaths.push(`/showcase/${fileName}`);
    }

    entries.push({
      username,
      screenshots: savedPaths,
      dotfiles,
      tags,
      added,
    });
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

main();
