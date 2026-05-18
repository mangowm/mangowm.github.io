import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { parse } from "yaml";

const RAW_BASE = "https://raw.githubusercontent.com/mangowm/mango-showcase/main";

function toRawBase(dotfilesUrl: string): string {
  const url = new URL(dotfilesUrl);
  return `https://raw.githubusercontent.com${url.pathname}/main`;
}

type RawEntry = {
  username: string;
  dotfiles: string;
  tags: string[];
  added?: string;
};

type ShowcaseEntry = {
  username: string;
  screenshot: string;
  dotfiles: string;
  tags: string[];
  added: string | null;
};

async function main() {
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
    const screenshotUrl = `${rawBase}/screenshot.png`;

    console.log(`Downloading screenshot for @${username} from ${screenshotUrl}...`);

    const imgRes = await fetch(screenshotUrl);
    if (!imgRes.ok) {
      console.warn(`  ⚠ Skipping @${username}: screenshot.png not found (${imgRes.status})`);
      continue;
    }

    const buffer = Buffer.from(await imgRes.arrayBuffer());
    const fileName = `${username}.png`;

    await fs.writeFile(path.join(imagesDir, fileName), buffer);

    entries.push({
      username,
      screenshot: `/showcase/${fileName}`,
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
