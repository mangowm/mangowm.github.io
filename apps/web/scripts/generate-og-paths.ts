import { writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from "node:fs";
import { resolve, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function getPageImage(slugs: string[]) {
  const segments = [...slugs, "image.webp"];
  return {
    segments,
    url: `/og/docs/${segments.join("/")}`,
  };
}

function getSlugsFromPath(filePath: string, basePath: string): string[] {
  const relativePath = relative(basePath, filePath);
  const withoutExt = relativePath.replace(/\.(md|mdx)$/, "");
  if (withoutExt === "index") return [];
  return withoutExt.split("/");
}

async function generateOgPaths() {
  console.log("Generating OG image paths...");

  const contentDir = resolve(__dirname, "../content/docs");
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

  const ogPaths = files.map((file) => {
    const slugs = getSlugsFromPath(file, contentDir);
    const { segments } = getPageImage(slugs);
    return { path: `/og/docs/${segments.join("/")}` };
  });

  const outputDir = resolve(__dirname, "../src/generated");
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  const output = `// Auto-generated - do not edit
export const ogPages = ${JSON.stringify(ogPaths, null, 2)} as const;
`;

  const outputPath = resolve(outputDir, "og-paths.ts");
  writeFileSync(outputPath, output, "utf-8");

  console.log(`✓ Generated ${ogPaths.length} OG paths to ${outputPath}`);
}

generateOgPaths().catch((err) => {
  console.error("Failed to generate OG paths:", err);
  process.exit(1);
});
