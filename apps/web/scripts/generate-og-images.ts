import { writeFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import { resolve, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createElement } from "react";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function generateOgImages() {
  console.log("Generating OG images...");

  const contentDir = resolve(__dirname, "../content/docs");
  const outputDir = resolve(__dirname, "../.output/public/og/docs");

  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  function getSlugsFromPath(filePath: string): string[] {
    const relativePath = relative(contentDir, filePath);
    const withoutExt = relativePath.replace(/\.(md|mdx)$/, "");
    if (withoutExt === "index") return [];
    return withoutExt.split("/");
  }

  const files: string[] = [];

  function scanDir(dir: string) {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = resolve(dir, entry.name);
      if (entry.isDirectory()) {
        scanDir(fullPath);
      } else if (entry.name.endsWith(".md") || entry.name.endsWith(".mdx")) {
        files.push(fullPath);
      }
    }
  }

  scanDir(contentDir);
  console.log(`Found ${files.length} doc files`);

  const { ImageResponse } = await import("@takumi-rs/image-response");
  const { generate, getImageResponseOptions } = await import("../src/lib/og/generate");

  const imageOptions = await getImageResponseOptions();

  for (const file of files) {
    const slugs = getSlugsFromPath(file);
    const outputPath = resolve(outputDir, ...slugs, "image.webp");

    const dir = resolve(outputDir, ...slugs);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    const title = slugs[slugs.length - 1]?.replace(/-/g, " ") ?? "Docs";
    const description = `Documentation for ${title}`;

    const imageResponse = new ImageResponse(
      createElement(await generate, {
        title,
        description,
      }),
      imageOptions,
    );

    const arrayBuffer = await imageResponse.arrayBuffer();
    writeFileSync(outputPath, Buffer.from(arrayBuffer));

    console.log(`✓ Generated ${outputPath}`);
  }

  console.log(`✓ Generated ${files.length} OG images`);
}

generateOgImages().catch((err) => {
  console.error("Failed to generate OG images:", err);
  process.exit(1);
});
