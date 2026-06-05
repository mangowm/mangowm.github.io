import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, parse, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { ImageResponse } from "@takumi-rs/image-response";
import { generate, generateHomePage } from "../src/lib/og/generate";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = resolve(__dirname, "../content/docs");
const OUT_DIR = resolve(__dirname, "../.output/public");

const logoPaths: Array<{ fill: string; d: string }> = (() => {
  const raw = readFileSync(resolve(__dirname, "../public/logo.svg"), "utf-8");
  const result: Array<{ fill: string; d: string }> = [];
  const re = /<path\s+fill="([^"]*)"[^>]*d="([^"]*)"/g;
  let m;
  while ((m = re.exec(raw)) !== null) {
    result.push({ fill: m[1], d: m[2].replace(/\n\s*/g, " ") });
  }
  return result;
})();

const groupRegex = /^\(.+\)$/;

function getSlugs(filePath: string, baseDir: string): string[] {
  const rel = relative(baseDir, filePath);
  const parsed = parse(rel);
  const parts = parsed.dir ? parsed.dir.split(sep) : [];
  const slugs = parts.filter((seg) => seg.length > 0 && !groupRegex.test(seg));
  if (parsed.name !== "index") slugs.push(parsed.name);
  return slugs;
}

function parseFrontmatter(content: string): Record<string, string> {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!match) return {};

  const result: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    result[key] = value;
  }
  return result;
}

function collectPages(
  dir: string,
): Array<{ slugs: string[]; title: string; description?: string }> {
  const pages: Array<{ slugs: string[]; title: string; description?: string }> = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const fullPath = resolve(dir, entry.name);
    if (entry.isDirectory()) {
      pages.push(...collectPages(fullPath));
    } else if (entry.isFile() && /\.mdx?$/.test(entry.name)) {
      const slugs = getSlugs(fullPath, CONTENT_DIR);
      const content = readFileSync(fullPath, "utf-8");
      const fm = parseFrontmatter(content);
      if (fm.title) {
        pages.push({ slugs, title: fm.title, description: fm.description });
      }
    }
  }
  return pages;
}

async function main() {
  const pages = collectPages(CONTENT_DIR);
  if (pages.length === 0) {
    console.warn("No pages found.");
    return;
  }

  let count = 0;

  const homeResponse = new ImageResponse(generateHomePage({ logoPaths }), {
    width: 1200,
    height: 630,
    format: "webp",
  });

  const homePath = resolve(OUT_DIR, "og/home/image.webp");
  mkdirSync(dirname(homePath), { recursive: true });
  writeFileSync(homePath, Buffer.from(await homeResponse.arrayBuffer()));
  count++;

  for (const page of pages) {
    const segments = [...page.slugs, "image.webp"];
    const filePath = resolve(OUT_DIR, "og/docs", ...segments);
    mkdirSync(dirname(filePath), { recursive: true });

    const response = new ImageResponse(
      generate({
        title: page.title,
        description: page.description,
        icon: (
          <svg width="56" height="56" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
            {logoPaths.map((p, i) => (
              <path key={i} fill={p.fill} d={p.d} />
            ))}
          </svg>
        ),
        site: "mangowm",
      }),
      { width: 1200, height: 630, format: "webp" },
    );

    writeFileSync(filePath, Buffer.from(await response.arrayBuffer()));
    count++;
  }

  const staticPages = [
    {
      path: "og/showcase/image.webp",
      title: "Showcase",
      description: "Community setup showcases",
    },
    {
      path: "og/releases/image.webp",
      title: "Releases",
      description: "All mangowm releases and changelogs",
    },
  ];

  for (const page of staticPages) {
    const filePath = resolve(OUT_DIR, page.path);
    mkdirSync(dirname(filePath), { recursive: true });
    const response = new ImageResponse(
      generate({
        title: page.title,
        description: page.description,
        icon: (
          <svg width="56" height="56" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
            {logoPaths.map((p, i) => (
              <path key={i} fill={p.fill} d={p.d} />
            ))}
          </svg>
        ),
        site: "mangowm",
      }),
      { width: 1200, height: 630, format: "webp" },
    );
    writeFileSync(filePath, Buffer.from(await response.arrayBuffer()));
    count++;
  }

  console.log(`Generated ${count} OG images.`);
}

main().catch((err) => {
  console.error("Failed to generate OG images:", err);
  process.exit(1);
});
