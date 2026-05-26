import { createFileRoute } from "@tanstack/react-router";
import { createFromSource } from "fumadocs-core/search/server";

import { source } from "@/lib/source";

function getTag(path: string): string {
  const dir = path.split("/")[0];
  if (!dir || dir === "(git)") return "latest";
  return dir;
}

const server = createFromSource(source, {
  language: "english",
  buildIndex: async (page) => {
    let structuredData: unknown;

    if (page.data.structuredData) {
      structuredData =
        typeof page.data.structuredData === "function"
          ? await page.data.structuredData()
          : page.data.structuredData;
    } else if ("load" in page.data && typeof page.data.load === "function") {
      structuredData = (await page.data.load()).structuredData;
    }

    if (!structuredData)
      throw new Error(
        "Cannot find structured data from page, please define the page to index function.",
      );

    return {
      title: page.data.title ?? page.slugs.at(-1) ?? "untitled",
      description: page.data.description,
      url: page.url,
      id: page.url,
      structuredData,
      tag: getTag(page.path),
    };
  },
});

export const Route = createFileRoute("/api/search")({
  server: {
    handlers: {
      GET: () => server.staticGET(),
    },
  },
});
