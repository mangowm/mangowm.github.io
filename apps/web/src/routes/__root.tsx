import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { RootProvider } from "fumadocs-ui/provider/tanstack";
import * as React from "react";

import SearchDialog from "@/components/search";
import appCss from "@/styles/app.css?url";
import { siteConfig } from "@/lib/site";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        name: "description",
        content: siteConfig.description,
      },
      {
        name: "theme-color",
        media: "(prefers-color-scheme: light)",
        content: "#ffffff",
      },
      {
        name: "theme-color",
        media: "(prefers-color-scheme: dark)",
        content: "#0A0A0A",
      },
      {
        name: "robots",
        content: "index, follow",
      },
      {
        property: "og:title",
        content: siteConfig.title,
      },
      {
        property: "og:description",
        content: siteConfig.description,
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        property: "og:image",
        content: siteConfig.url + siteConfig.ogImage,
      },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
      {
        name: "twitter:title",
        content: siteConfig.title,
      },
      {
        name: "twitter:description",
        content: siteConfig.description,
      },
      {
        name: "twitter:image",
        content: siteConfig.url + siteConfig.ogImage,
      },
      {
        title: siteConfig.name,
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="flex flex-col min-h-screen antialiased">
        <RootProvider search={{ SearchDialog }} theme={{ enabled: true }}>
          {children}
        </RootProvider>
        <Scripts />
      </body>
    </html>
  );
}
