#!/usr/bin/env node
// @ts-nocheck
/**
 * Builds /docs/_previews/ for the mangowm Discord app (command: /preview).
 *
 * Contract with the worker:
 *   - one image per heading with an id, latest docs tree only
 *   - anchors only, no page-level image
 *   - <out>/<page>/<anchor>.webp, then <anchor>.2.webp, <anchor>.3.webp when a
 *     section is split
 *   - anchor ids must match /^[a-z0-9_-]+$/ or the build fails
 *   - every clip is the content column, never the sidebar or the toc
 *
 * Usage:
 *   node scripts/previews.mjs --dry-run
 *   node scripts/previews.mjs
 *   node scripts/previews.mjs --only configuration/input
 */
import { createServer } from "node:http";
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, extname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const DIST = fileURLToPath(new URL("../dist/public", import.meta.url));
const OUT_NAME = "_previews";
const ANCHOR_RE = /^[a-z0-9_-]+$/;
const SKIP_DIRS = /^(_|v\d+\.)/;

const VIEWPORT = { width: 1200, height: 900 };
const SCALE = Number(process.env.PREVIEWS_SCALE ?? 2);
const PART_HEIGHT = Number(process.env.PREVIEWS_PART_HEIGHT ?? 1000);
const HARD_HEIGHT = Number(process.env.PREVIEWS_HARD_HEIGHT ?? 1400);
const MIN_PART = Number(process.env.PREVIEWS_MIN_PART ?? 400);
const MAX_PARTS = Number(process.env.PREVIEWS_MAX_PARTS ?? 24);
const PAD_X = Number(process.env.PREVIEWS_PAD_X ?? 16);
const TIMEOUT = 30_000;

const argv = process.argv.slice(2);

function option(name, fallback) {
  const index = argv.indexOf(`--${name}`);
  if (index === -1) return fallback;
  const value = argv[index + 1];
  return value && !value.startsWith("--") ? value : fallback;
}

const distDir = resolve(String(option("dist", DIST)));
const outDir = resolve(String(option("out", join(distDir, OUT_NAME))));
const only = option("only", null);
const baseUrl = String(option("base-url", "https://mangowm.github.io/docs/_previews/"));
const dryRun = argv.includes("--dry-run");

async function findPages(dir, found = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.test(entry.name)) await findPages(join(dir, entry.name), found);
    } else if (entry.name === "index.html") {
      found.push(join(dir, entry.name));
    }
  }
  return found.sort((a, b) => a.localeCompare(b));
}

function pagePath(file) {
  const rel = relative(distDir, file)
    .split(sep)
    .join("/")
    .replace(/\/?index\.html$/, "");
  return `/docs/${rel ? `${rel}/` : ""}`;
}

function pageDir(file) {
  return relative(distDir, dirname(file)).split(sep).join("/");
}

const HEADING_RE = /<h([1-4])\b([^>]*)>/g;
const ID_RE = /\bid="([^"]+)"/;

function readAnchors(html) {
  const anchors = [];
  for (const match of html.matchAll(HEADING_RE)) {
    const id = ID_RE.exec(match[2])?.[1];
    if (id && id !== "toc-title") anchors.push(id);
  }
  return anchors;
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".txt": "text/plain; charset=utf-8",
};

function startServer(root) {
  const server = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, "http://local").pathname);
      if (!pathname.startsWith("/docs/")) throw new Error("outside /docs");
      let rel = pathname.slice("/docs/".length);
      if (rel === "" || rel.endsWith("/")) rel += "index.html";
      const file = join(root, rel);
      if (!file.startsWith(root + sep)) throw new Error("traversal");
      const body = await readFile(file);
      response.writeHead(200, {
        "content-type": MIME[extname(file)] ?? "application/octet-stream",
        "cache-control": "no-store",
      });
      response.end(body);
    } catch {
      response.writeHead(404, { "content-type": "text/plain" });
      response.end("not found");
    }
  });

  return new Promise((done) => {
    server.listen(0, "127.0.0.1", () => done({ server, port: server.address().port }));
  });
}

// Runs inside the page. Cuts a section into cards, preferring authored dividers,
// then sub-headings, then lead-in lines, and falling back to size.
function measure({ partHeight, hardHeight, minPart, maxParts, padX }) {
  const article = document.querySelector("#nd-page");
  if (!article) return { error: "no-content" };

  const prose = article.querySelector(".prose") ?? article;
  const offset = window.scrollY;

  const rect = (element) => {
    const box = element.getBoundingClientRect();
    return { top: box.top + offset, bottom: box.bottom + offset };
  };

  const column = prose.getBoundingClientRect();
  const proseBottom = rect(prose).bottom;

  const headings = [...prose.querySelectorAll("h1[id], h2[id], h3[id], h4[id]")]
    .filter((heading) => !heading.closest("#nd-toc, #nd-sidebar, #nd-subnav, nav"))
    .map((heading) => ({
      level: Number(heading.tagName[1]),
      id: heading.id,
      title: (heading.textContent ?? "").replace(/\s*Copy Anchor Link\s*$/, "").trim(),
      ...rect(heading),
    }));

  const blocks = [...prose.children].map((element) => ({
    element,
    level: /^H[1-6]$/.test(element.tagName) ? Number(element.tagName[1]) : 0,
    lead: element.tagName === "P" && /:\s*$/.test(element.textContent.trim()),
    ...rect(element),
  }));

  const rules = blocks.filter((block) => block.element.tagName === "HR");

  const splitBlock = (block) => {
    const pack = (rows) => {
      const usable = rows.filter((row) => row.bottom > row.top + 1);
      if (usable.length < 2) return null;

      const parts = [];
      let start = usable[0].top;
      let bottom = start;
      for (const row of usable) {
        if (row.bottom - start > partHeight && bottom > start) {
          parts.push({ top: start, bottom });
          start = row.top;
        }
        bottom = row.bottom;
      }
      parts.push({ top: start, bottom });
      return parts;
    };

    const element = block.element;
    const table = element.matches("table") ? element : element.querySelector("table");
    if (table) return pack([...table.querySelectorAll("tr")].map(rect));

    const list = element.matches("ol, ul") ? element : element.querySelector("ol, ul");
    if (list) return pack([...list.children].map(rect));

    return null;
  };

  const sections = headings.map((heading, index) => {
    let end = proseBottom;
    for (let next = index + 1; next < headings.length; next++) {
      if (headings[next].level <= heading.level) {
        end = headings[next].top - 24;
        break;
      }
    }
    end = Math.min(end, proseBottom);

    const owned = blocks.filter(
      (block) =>
        block.bottom > heading.top + 1 &&
        block.top < end - 1 &&
        block.element.tagName !== "HR" &&
        !(block.element.tagName === "P" && !block.element.textContent.trim()),
    );

    const atoms = [];
    let ranges;

    if (owned.length === 0) {
      ranges = [{ top: heading.top, bottom: Math.min(end, heading.top + partHeight) }];
    } else {
      for (const block of owned) {
        if (block.bottom - block.top > hardHeight) {
          const rows = splitBlock(block);
          if (rows) {
            for (const row of rows) atoms.push({ top: row.top, bottom: row.bottom, level: 0 });
            continue;
          }
        }
        atoms.push({ top: block.top, bottom: block.bottom, level: block.level, lead: block.lead });
      }

      const softLimit = partHeight * 1.15;

      const greedy = (from, to) => {
        const out = [];
        let first = from;
        let cursor = from;

        while (cursor <= to) {
          const height = atoms[cursor].bottom - atoms[first].top;
          if (height > softLimit && cursor > first) {
            let rule = null;
            for (const candidate of rules) {
              if (
                candidate.top > atoms[from].top &&
                candidate.top < atoms[cursor].top &&
                (!rule || candidate.top > rule.top)
              ) {
                rule = candidate;
              }
            }
            if (rule) {
              let last = cursor - 1;
              while (last >= first && atoms[last].bottom > rule.top) last -= 1;
              if (last >= first && atoms[last].bottom - atoms[first].top >= minPart) {
                out.push({ top: atoms[first].top, bottom: atoms[last].bottom });
                first = last + 1;
                continue;
              }
            }

            let last = cursor - 1;
            while (last >= first && (atoms[last].level > 0 || atoms[last].lead)) last -= 1;
            if (last >= first) {
              out.push({ top: atoms[first].top, bottom: atoms[last].bottom });
              first = last + 1;
              continue;
            }
          }
          cursor += 1;
        }

        out.push({ top: atoms[first].top, bottom: atoms[to].bottom });
        return out;
      };

      const layout = (from, to, level) => {
        if (atoms[to].bottom - atoms[from].top <= softLimit) {
          return [{ top: atoms[from].top, bottom: atoms[to].bottom }];
        }

        const cuts = [];
        for (let index = from + 1; index <= to; index++) {
          if (atoms[index].level > level) cuts.push(index);
        }
        if (!cuts.length) return greedy(from, to);

        const units = [];
        let start = from;
        for (const cut of cuts) {
          if (cut > start) units.push([start, cut - 1]);
          start = cut;
        }
        units.push([start, to]);

        let index = 0;
        while (index < units.length - 1) {
          const [a, b] = units[index];
          if (a === b && atoms[a].level > 0) {
            units[index + 1][0] = a;
            units.splice(index, 1);
          } else {
            index += 1;
          }
        }
        if (units.length === 1) return greedy(from, to);

        if (atoms[units[0][0]].level === level) {
          const intro = atoms[units[0][1]].bottom - atoms[units[0][0]].top;
          if (intro < minPart) {
            units[1][0] = units[0][0];
            units.splice(0, 1);
          }
        }
        if (units.length === 1) return greedy(from, to);

        return units.flatMap(([a, b]) => layout(a, b, atoms[a].level));
      };

      ranges = layout(0, atoms.length - 1, heading.level);

      for (let index = 0; index < ranges.length - 1; index++) {
        const inside = atoms.filter(
          (atom) => atom.bottom > ranges[index].top + 1 && atom.top < ranges[index].bottom - 1,
        );
        const last = inside.at(-1);
        if (!last || inside.length < 2) continue;
        if (last.level === 0 && !last.lead) continue;
        ranges[index].bottom = inside.at(-2).bottom;
        ranges[index + 1].top = Math.min(ranges[index + 1].top, last.top);
      }

      while (ranges.length > maxParts) {
        let best = 0;
        let smallest = Infinity;
        for (let index = 0; index < ranges.length - 1; index++) {
          const height = ranges[index + 1].bottom - ranges[index].top;
          if (height < smallest) {
            smallest = height;
            best = index;
          }
        }
        ranges[best].bottom = ranges[best + 1].bottom;
        ranges.splice(best + 1, 1);
      }
    }

    for (const range of ranges) {
      if (range.bottom - range.top > hardHeight) range.oversize = true;
    }

    while (ranges.length > 1 && ranges.at(-1).bottom - ranges.at(-1).top < minPart) {
      const last = ranges.pop();
      ranges[ranges.length - 1].bottom = last.bottom;
    }

    return {
      anchor: heading.id,
      title: heading.title,
      parts: ranges.map((range) => {
        const inside = atoms.filter(
          (atom) => atom.bottom > range.top + 1 && atom.top < range.bottom - 1,
        );
        const problems = [];
        if (inside.length && inside.every((atom) => atom.level > 0)) problems.push("heading-only");
        if (inside.length && inside.at(-1).level > 0) problems.push("ends-on-heading");
        if (inside.length && inside.at(-1).lead) problems.push("ends-on-lead");
        if (
          rules.some(
            (rule) =>
              rule.top > range.top && rule.bottom < range.bottom && range.bottom - rule.top < 60,
          )
        ) {
          problems.push("tail-divider");
        }

        return {
          top: Math.max(0, range.top - 16),
          bottom: range.bottom + 16,
          ...(range.oversize ? { oversize: true } : {}),
          ...(problems.length ? { problems } : {}),
        };
      }),
    };
  });

  const sidebar = document.querySelector("#nd-sidebar")?.getBoundingClientRect();
  const articleBox = article.getBoundingClientRect();
  const room = Math.max(
    0,
    Math.min(column.left - articleBox.left, articleBox.right - column.right),
  );
  const padding = Math.min(padX, room, column.left);

  return {
    pageTitle: (article.querySelector("h1")?.textContent ?? document.title).trim(),
    sidebarOverlap: Boolean(sidebar && column.left - padding < sidebar.right - 1),
    pageHeight: Math.max(document.body.scrollHeight, document.documentElement.scrollHeight),
    column: {
      x: Math.max(0, Math.floor(column.left - padding)),
      width: Math.max(320, Math.floor(column.width + padding * 2)),
    },
    sections,
  };
}

async function readManifestPages(file) {
  try {
    return JSON.parse(await readFile(file, "utf8")).pages ?? {};
  } catch {
    return {};
  }
}

async function main() {
  const pages = (await findPages(distDir))
    .map((file) => ({ file, path: pagePath(file), dir: pageDir(file) }))
    .filter((page) => !only || page.path.includes(only));

  if (!pages.length) throw new Error(`no pages found under ${distDir}`);

  const parsed = await Promise.all(
    pages.map(async (page) => ({
      ...page,
      anchors: readAnchors(await readFile(page.file, "utf8")),
    })),
  );

  const invalid = parsed.flatMap((page) =>
    page.anchors.filter((id) => !ANCHOR_RE.test(id)).map((id) => `${page.path}#${id}`),
  );
  if (invalid.length) {
    console.error("invalid anchor ids, the worker's path rule cannot express them:");
    for (const item of invalid) console.error(`  ${item}`);
    process.exit(1);
  }

  const total = parsed.reduce((sum, page) => sum + page.anchors.length, 0);
  console.log(`pages:    ${parsed.length}`);
  console.log(`sections: ${total}`);

  if (dryRun) {
    console.log("\ndry run, nothing written");
    return;
  }

  const { chromium } = await import("playwright");
  if (!only) await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });

  const { server, port } = await startServer(distDir);
  const browser = await chromium.launch({ args: ["--disable-dev-shm-usage"] });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: SCALE,
    colorScheme: "dark",
    reducedMotion: "reduce",
    locale: "en-US",
  });
  const tab = await context.newPage();
  tab.setDefaultTimeout(TIMEOUT);

  const manifest = {
    version: 1,
    generatedAt: new Date().toISOString(),
    base: baseUrl,
    partHeight: PART_HEIGHT,
    pages: only ? await readManifestPages(join(outDir, "index.json")) : {},
  };

  let images = 0;
  let bytes = 0;
  let splitSections = 0;
  const problems = [];
  const started = Date.now();

  try {
    for (const page of parsed) {
      if (!page.anchors.length) continue;

      await tab.goto(`http://127.0.0.1:${port}${page.path}`, { waitUntil: "domcontentloaded" });
      await tab.waitForSelector("#nd-page", { state: "attached" });
      await tab.evaluate(() => document.fonts.ready);
      await tab.evaluate(() => {
        document.documentElement.classList.add("dark");
        document.documentElement.setAttribute("data-theme", "dark");
        document.documentElement.style.colorScheme = "dark";
      });
      await tab.waitForTimeout(200);

      const measured = await tab.evaluate(measure, {
        partHeight: PART_HEIGHT,
        hardHeight: HARD_HEIGHT,
        minPart: MIN_PART,
        maxParts: MAX_PARTS,
        padX: PAD_X,
      });
      if (measured.error) throw new Error(`${page.path}: ${measured.error}`);
      if (measured.sidebarOverlap) console.warn(`  ${page.path}: sidebar overlaps the clip`);

      const sections = {};
      await mkdir(join(outDir, page.dir), { recursive: true });

      for (const section of measured.sections) {
        const files = [];

        for (const [index, part] of section.parts.entries()) {
          if (part.problems) {
            problems.push(
              `${page.path}#${section.anchor} part ${index + 1}: ${part.problems.join(", ")}`,
            );
          }

          const name = index === 0 ? section.anchor : `${section.anchor}.${index + 1}`;
          const webp = await tab.screenshot({
            clip: {
              x: measured.column.x,
              y: part.top,
              width: measured.column.width,
              height: Math.min(part.bottom, measured.pageHeight) - part.top,
            },
            fullPage: true,
            type: "webp",
            quality: 100,
            animations: "disabled",
            caret: "hide",
          });

          const file = `${page.dir ? `${page.dir}/` : ""}${name}.webp`;
          await writeFile(join(outDir, file), webp);
          files.push(file);
          bytes += webp.length;
          images += 1;
        }

        if (files.length > 1) splitSections += 1;
        sections[section.anchor] = {
          title: section.title,
          parts: files,
          ...(section.parts.some((part) => part.oversize) ? { oversize: true } : {}),
        };
      }

      manifest.pages[page.path] = {
        title: measured.pageTitle || page.path,
        sections,
      };
      console.log(
        `  ${page.path.padEnd(38)} ${String(Object.keys(sections).length).padStart(3)} sections`,
      );
    }
  } finally {
    await context.close().catch(() => {});
    await browser.close().catch(() => {});
    server.close();
  }

  await writeFile(join(outDir, "index.json"), `${JSON.stringify(manifest, null, 2)}\n`);

  const seconds = ((Date.now() - started) / 1000).toFixed(1);
  console.log(
    `\n${images} images (${splitSections} sections split), ${(bytes / 1024 / 1024).toFixed(1)} MB, ${seconds}s`,
  );
  console.log(`→ ${outDir}`);

  if (problems.length) {
    console.error(`\n${problems.length} layout problems:`);
    for (const problem of problems) console.error(`  ${problem}`);
    process.exitCode = 1;
  }
}

await main();
