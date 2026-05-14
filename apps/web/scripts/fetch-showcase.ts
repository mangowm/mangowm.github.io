import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { parse } from "yaml";

const RAW_BASE =
  "https://raw.githubusercontent.com/mangowm/mango-showcase/main";

/**
 * Converts:
 * https://github.com/user/repo
 * ->
 * https://raw.githubusercontent.com/user/repo/main
 */
function toRawBase(dotfilesUrl: string): string {
  const url = new URL(dotfilesUrl);
  return `https://raw.githubusercontent.com${url.pathname}/main`;
}

type Entry = Record<string, string>; // username -> repo url

async function main() {
  console.log("Fetching showcase entries and downloading images...");

  const res = await fetch(`${RAW_BASE}/entries.yml`);
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

  const yamlText = await res.text();
  const rawEntries: Entry[] = parse(yamlText) || [];

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const imagesDir = path.resolve(__dirname, "../public/showcase");
  await fs.mkdir(imagesDir, { recursive: true });

  const entries: { username: string; screenshot: string; dotfiles: string }[] =
    [];

  for (const item of rawEntries) {
    const username = Object.keys(item)[0];
    const dotfiles = item[username];

    const rawBase = toRawBase(dotfiles);
    const screenshotUrl = `${rawBase}/screenshot.png`;

    console.log(
      `Downloading screenshot for @${username} from ${screenshotUrl}...`,
    );

    const imgRes = await fetch(screenshotUrl);
    if (!imgRes.ok) {
      console.warn(
        `  ⚠ Skipping @${username}: screenshot.png not found (${imgRes.status})`,
      );
      continue;
    }

    const buffer = Buffer.from(await imgRes.arrayBuffer());
    const fileName = `${username}.png`;

    await fs.writeFile(path.join(imagesDir, fileName), buffer);

    entries.push({
      username,
      screenshot: `/showcase/${fileName}`,
      dotfiles,
    });
  }

  await fs.writeFile(
    path.resolve(__dirname, "../src/showcase.json"),
    JSON.stringify(entries, null, 2),
  );

  console.log(
    `\nSuccessfully generated showcase.json with ${entries.length} entries.`,
  );
}

main();
