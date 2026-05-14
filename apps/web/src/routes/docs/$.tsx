import { createFileRoute, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useFumadocsLoader } from "fumadocs-core/source/client";
import browserCollections from "collections/browser";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
} from "fumadocs-ui/layouts/docs/page";
import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions";
import { Suspense } from "react";

import { useMDXComponents } from "@/components/mdx";
import { baseOptions, sourceGitConfig } from "@/lib/layout.shared";
import { source } from "@/lib/source";
import { ViewOptions } from "@/components/view-options";

export const Route = createFileRoute("/docs/$")({
  component: Page,
  pendingMs: 100,
  pendingMinMs: 300,
  loader: async ({ params }) => {
    const slugs = params._splat?.split("/") ?? [];
    const data = await serverLoader({ data: slugs });
    await clientLoader.preload(data.path);
    return data;
  },
  head: ({ loaderData }) => {
    const ogUrl = `/og/docs/${[...loaderData.slugs, "image.webp"].join("/")}`;
    return {
      meta: [{ property: "og:image", content: ogUrl }],
    };
  },
});

const serverLoader = createServerFn({
  method: "GET",
})
  .inputValidator((slugs: string[]) => slugs)
  .middleware([staticFunctionMiddleware])
  .handler(async ({ data: slugs }) => {
    const page = source.getPage(slugs);
    if (!page) throw notFound();

    return {
      slugs: page.slugs,
      path: page.path,
      pageTree: await source.serializePageTree(source.getPageTree()),
    };
  });

const clientLoader = browserCollections.docs.createClientLoader({
  component(
    { toc, frontmatter, default: MDX },
    {
      markdownUrl,
      path,
    }: {
      markdownUrl: string;
      path: string;
    },
  ) {
    const title = `${frontmatter.title} | mangowm`;

    return (
      <DocsPage
        toc={toc}
        tableOfContent={{
          style: "clerk",
        }}
      >
        <title>{title}</title>
        <meta name="description" content={frontmatter.description} />
        <DocsTitle>{frontmatter.title}</DocsTitle>
        <DocsDescription>{frontmatter.description}</DocsDescription>
        <div className="flex flex-row gap-2 items-center border-b -mt-4 pb-6">
          <MarkdownCopyButton markdownUrl={markdownUrl} />
          <ViewOptions
            markdownUrl={markdownUrl}
            githubUrl={`https://github.com/${sourceGitConfig.user}/${sourceGitConfig.repo}/tree/${sourceGitConfig.branch}/${sourceGitConfig.docsPath}/${path}`}
          />
        </div>
        <DocsBody>
          <MDX components={useMDXComponents()} />
        </DocsBody>
      </DocsPage>
    );
  },
});

function Page() {
  const { pageTree, slugs, path } = useFumadocsLoader(Route.useLoaderData());
  const markdownUrl = `/docs/${slugs.join("/")}.md`;

  return (
    <DocsLayout {...baseOptions()} tree={pageTree}>
      <a href={markdownUrl} hidden aria-hidden />
      <Suspense>{clientLoader.useContent(path, { markdownUrl, path })}</Suspense>
    </DocsLayout>
  );
}
