import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { Toaster } from "@mangowm/ui/components/toast";
import appleTouchIcon from "@mangowm/assets/favicons/apple-touch-icon.png";
import faviconIco from "@mangowm/assets/favicons/favicon.ico";
import faviconSvg from "@mangowm/assets/favicons/favicon.svg";
import appCss from "@/App.css?url";
import bricolageFont from "@fontsource/bricolage-grotesque/files/bricolage-grotesque-latin-700-normal.woff2?url";
import geistFont from "@fontsource-variable/geist/files/geist-latin-wght-normal.woff2?url";
import geistMonoFont from "@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2?url";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";
import { ogPages } from "@/lib/og-pages";
import { pageMeta } from "@/lib/seo";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1.0" },
      ...pageMeta(ogPages.home),
    ],
    links: [
      { rel: "icon", href: faviconIco, sizes: "32x32" },
      { rel: "icon", type: "image/svg+xml", href: faviconSvg },
      { rel: "apple-touch-icon", sizes: "180x180", href: appleTouchIcon },
      {
        rel: "preload",
        href: bricolageFont,
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      { rel: "preload", href: geistFont, as: "font", type: "font/woff2", crossOrigin: "anonymous" },
      {
        rel: "preload",
        href: geistMonoFont,
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <ThemeProvider defaultTheme="system" storageKey="theme">
          <Header />
          <main id="main-content">
            <Outlet />
          </main>
          <Footer />
        </ThemeProvider>
        <Toaster />
        <Scripts />
      </body>
    </html>
  );
}
