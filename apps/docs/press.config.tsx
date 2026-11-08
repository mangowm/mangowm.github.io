import { createPress, recommendedPreset, type RenderPageProps } from "fumapress";
import { metaSchema, pageSchema } from "fumapress/schema";
import { googleFonts } from "fumapress/plugins/takumi";
import { lucideIconsPlugin } from "fumadocs-core/source/plugins/lucide-icons";
import { defineDocs } from "fumadocs-mdx/macro";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  PageLastUpdate,
} from "fumadocs-ui/layouts/docs/page";
import { OgImage } from "@mangowm/og";
import appleTouchIcon from "@mangowm/assets/favicons/apple-touch-icon.png";
import faviconIco from "@mangowm/assets/favicons/favicon.ico";
import faviconSvg from "@mangowm/assets/favicons/favicon.svg";
import { NavTitle } from "./src/components/nav-title";

const ogFonts = googleFonts([{ name: "Geist", weight: [400, 600, 800] }]);

const docs = defineDocs({
  dir: "content",
  docs: {
    async: true,
    schema: pageSchema,
    lastModified: true,
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
});

export const app = createPress(
  { docs: docs.toFumadocsSource() },
  {
    mode: "force-static",
    loaderPlugins: [lucideIconsPlugin()],
  },
);

function Docs(props: RenderPageProps<typeof app, "docs">) {
  const { layoutProps, pageData, toc, body } = props;

  return (
    <DocsLayout {...layoutProps}>
      <DocsPage toc={toc} full={pageData.full}>
        <DocsTitle>{pageData.title}</DocsTitle>
        <DocsDescription>{pageData.description}</DocsDescription>
        <DocsBody>{body}</DocsBody>
        {pageData.lastModified && <PageLastUpdate date={pageData.lastModified} />}
      </DocsPage>
    </DocsLayout>
  );
}

export default app.config({
  site: {
    name: "mangowm",
    baseUrl: "https://mangowm.github.io/docs",
    git: {
      user: "mangowm",
      repo: "mango",
      branch: "main",
    },
  },
  preset: recommendedPreset({
    image: false,
    ogImage: {
      options: { fonts: ogFonts },
      getImage(page) {
        return {
          node: (
            <OgImage
              eyebrow="Documentation"
              title={page.data.title}
              description={page.data.description}
            />
          ),
        };
      },
    },
  }),
  head: [
    { tag: "link", attrs: { rel: "icon", href: faviconIco, sizes: "32x32" } },
    { tag: "link", attrs: { rel: "icon", href: faviconSvg, type: "image/svg+xml" } },
    {
      tag: "link",
      attrs: { rel: "apple-touch-icon", sizes: "180x180", href: appleTouchIcon },
    },
    { tag: "link", attrs: { rel: "preconnect", href: "https://fonts.googleapis.com" } },
    {
      tag: "link",
      attrs: {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossorigin: "",
      },
    },
    {
      tag: "link",
      attrs: {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Geist:ital,wght@0,100..900;1,100..900&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap",
      },
    },
  ],
  ui: {
    layoutProps: {
      slots: {
        navTitle: NavTitle,
      },
    },
    renderPage(props) {
      return <Docs {...props} />;
    },
  },
});
