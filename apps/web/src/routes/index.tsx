import { memo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { HomeLayout } from "fumadocs-ui/layouts/home";
import type { LinkItemType } from "fumadocs-ui/layouts/shared";
import { baseOptions } from "@/lib/layout.shared";
import { latestVersion } from "@/lib/latest-version";

export const Route = createFileRoute("/")({
  component: Home,
});

const DiscordIcon = memo(function DiscordIcon() {
  return (
    <span className="flex items-center">
      <img
        src="/Discord-Symbol-Black.svg"
        alt=""
        aria-hidden="true"
        className="h-5 w-5 dark:hidden"
      />
      <img
        src="/Discord-Symbol-White.svg"
        alt=""
        aria-hidden="true"
        className="hidden h-5 w-5 dark:block"
      />
    </span>
  );
});

const NAV_LINKS: LinkItemType[] = [
  { text: "Docs", url: "/docs" },
  { text: "Editor", url: "/editor" },
  { text: "Releases", url: "/releases" },
  {
    type: "icon",
    url: "https://discord.gg/CPjbDxesh5",
    label: "Discord",
    text: "Discord",
    external: true,
    icon: <DiscordIcon />,
  },
];

function Badges({ version }: { version: string }) {
  return (
    <div className="mb-6 flex items-center justify-center lg:justify-start">
      <Link
        to="/releases"
        className="inline-flex items-center gap-2 rounded-full border border-fd-primary/30 bg-fd-primary/10 px-3 py-1 text-xs font-semibold text-fd-primary transition-colors hover:bg-fd-primary/20"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-fd-primary" />
        {version}
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
}

function Hero({ version }: { version: string }) {
  return (
    <>
      {/* Mobile: text fills viewport */}
      <section className="relative flex min-h-[calc(100dvh-var(--fd-nav-height,4rem))] flex-col overflow-hidden px-4 py-20 sm:px-6 lg:hidden">
        <div
          aria-hidden="true"
          className="grid-bg pointer-events-none absolute inset-0 bg-[size:3rem_3rem] [mask-image:linear-gradient(to_bottom,black_40%,transparent_100%)]"
        />

        <div className="relative z-10 flex flex-1 flex-col items-center justify-center text-center">
          <Badges version={version} />
          <h1 className="mb-6 text-4xl font-bold leading-tight text-fd-foreground sm:text-5xl">
            <span className="block">Lightweight</span>
            <span className="block">
              &amp; <span className="text-fd-primary">Feature-Rich</span>
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-xl text-balance text-base text-fd-muted-foreground sm:text-lg">
            MangoWM is a blazingly fast, lightweight, modern Wayland compositor.
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              to="/docs/$"
              params={{ _splat: "" }}
              className="rounded-full bg-fd-primary px-8 py-3 font-semibold text-fd-primary-foreground shadow-lg shadow-fd-primary/10 transition-opacity hover:opacity-90"
            >
              Get Started
            </Link>

            <a
              href="https://github.com/mangowm/mango"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-fd-border bg-fd-background/60 px-8 py-3 font-semibold text-fd-foreground backdrop-blur-md transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
            >
              View on GitHub
            </a>
          </div>
        </div>

        {/* Scroll arrow */}
        <div aria-hidden="true" className="relative z-10 flex flex-col items-center gap-1.5 pb-2 text-fd-muted-foreground/50">
          <div className="h-6 w-px bg-gradient-to-b from-transparent to-fd-muted-foreground/30" />
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </div>
      </section>

      {/* Mobile: box below fold */}
      <div className="px-4 pb-20 sm:px-6 lg:hidden">
        <div className="relative aspect-[3/2] w-full overflow-hidden rounded-xl border border-fd-border bg-fd-background/50 shadow-sm" />
      </div>

      {/* Desktop: side by side */}
      <section className="relative hidden min-h-[calc(100vh-var(--fd-nav-height,4rem))] items-center justify-center overflow-hidden px-8 py-20 lg:flex">
        <div
          aria-hidden="true"
          className="grid-bg pointer-events-none absolute inset-0 bg-[size:3rem_3rem] [mask-image:linear-gradient(to_bottom,black_40%,transparent_100%)]"
        />

        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-row items-center gap-20">
          <div className="flex-1 text-left">
            <Badges version={version} />
            <h1 className="mb-6 text-7xl font-bold leading-tight text-fd-foreground">
              <span className="block">Lightweight</span>
              <span className="block">
                &amp; <span className="text-fd-primary">Feature-Rich</span>
              </span>
            </h1>

            <p className="mb-10 max-w-xl text-balance text-xl text-fd-muted-foreground">
              MangoWM is a blazingly fast, lightweight, modern Wayland compositor.
            </p>

            <div className="flex items-center gap-4">
              <Link
                to="/docs/$"
                params={{ _splat: "" }}
                className="rounded-full bg-fd-primary px-8 py-3 font-semibold text-fd-primary-foreground shadow-lg shadow-fd-primary/10 transition-opacity hover:opacity-90"
              >
                Get Started
              </Link>

              <a
                href="https://github.com/mangowm/mango"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-fd-border bg-fd-background/60 px-8 py-3 font-semibold text-fd-foreground backdrop-blur-md transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
              >
                View on GitHub
              </a>
            </div>
          </div>

          <div className="w-full flex-1 lg:max-w-[55%]">
            <div className="relative aspect-[3/2] w-full overflow-hidden rounded-xl border border-fd-border bg-fd-background/50 shadow-sm" />
          </div>
        </div>
      </section>
    </>
  );
}

function Home() {
  return (
    <HomeLayout {...baseOptions()} links={NAV_LINKS}>
      <Hero version={latestVersion} />
    </HomeLayout>
  );
}
