import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import appCss from "../App.css?url";
import { Header } from "../components/header";
import { siteConfig } from "../constants";

const themeScript = `(function(){var theme=localStorage.getItem("theme");if(!theme){theme=window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";}if(theme==="dark"){document.documentElement.classList.add("dark");}})();`;

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1.0",
      },
      {
        title: siteConfig.title,
      },
      {
        name: "description",
        content: siteConfig.description,
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
    ],
    links: [
      {
        rel: "icon",
        type: "image/svg+xml",
        href: "/favicon.svg",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <Header />
        <Outlet />
        <Scripts />
      </body>
    </html>
  );
}
