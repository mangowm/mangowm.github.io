import { type InferPageType, loader } from "fumadocs-core/source";
import { lucideIconsPlugin } from "fumadocs-core/source/lucide-icons";
import { docs } from "fumadocs-mdx:collections/server";

export const source = loader({
  source: docs.toFumadocsSource(),
  baseUrl: "/docs",
  plugins: [lucideIconsPlugin()],
});

export type Page = InferPageType<typeof source>;

export function getPageImage(page: Page) {
  const segments = [...page.slugs, "image.webp"];
  return {
    segments,
    url: `/og/docs/${segments.join("/")}`,
  };
}

export function getAllOgPaths(): Array<{ path: string }> {
  return source.getPages().map((page) => ({
    path: getPageImage(page).url,
  }));
}

export async function getLLMText(page: InferPageType<typeof source>) {
  const processed = await page.data.getText("processed");

  return `# ${page.data.title}

${processed}`;
}
