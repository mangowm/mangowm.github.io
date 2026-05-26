import { memo } from "react";
import { Heart } from "lucide-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { HomeLayout } from "fumadocs-ui/layouts/home";
import type { LinkItemType } from "fumadocs-ui/layouts/shared";
import { baseOptions } from "@/lib/layout.shared";
import { createTitle, siteConfig } from "@/lib/site";
import { latestVersion } from "@/lib/latest-version";
import { MangoLayouts } from "@/components/mango-layouts";
import { SponsorButton } from "@/components/sponsor-button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [{ title: createTitle("Home") }],
    links: [{ rel: "canonical", href: siteConfig.url }],
  }),
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
  ...(import.meta.env.DEV ? [{ text: "Editor", url: "/editor" }] : []),
  { text: "Showcase", url: "/showcase" },
  { text: "Releases", url: "/releases" },
  {
    type: "icon",
    url: "https://discord.gg/CPjbDxesh5",
    label: "Discord",
    text: "Discord",
    external: true,
    icon: <DiscordIcon />,
  },
  {
    type: "custom",
    children: <SponsorButton />,
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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
}

function Hero({ version }: { version: string }) {
  return (
    <>
      {/* Mobile: hero fills exactly one viewport, layouts start below */}
      <section className="relative flex h-[calc(100dvh-var(--fd-nav-height,4rem))] flex-col overflow-hidden px-4 py-16 sm:px-6 lg:hidden">
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
            mangowm is a lightweight, feature rich modern wayland compositor.
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

        {/* Scroll indicator pinned to bottom */}
        <div
          aria-hidden="true"
          className="relative z-10 flex flex-col items-center gap-1.5 text-fd-muted-foreground/50"
        >
          <div className="h-6 w-px bg-gradient-to-b from-transparent to-fd-muted-foreground/30" />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </div>
      </section>

      {/* Mobile: layouts preview below the fold */}
      <div className="px-4 py-16 sm:px-6 lg:hidden">
        <MangoLayouts />
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
              mangowm is a modern wayland compositor based on wlroots & scenefx.
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
            <MangoLayouts />
          </div>
        </div>
      </section>

      {/* Sponsors */}
      <section className="relative overflow-hidden bg-gradient-to-b from-transparent via-fd-primary/[0.02] to-fd-background">
        <div
          aria-hidden="true"
          className="grid-bg pointer-events-none absolute inset-0 bg-[size:3rem_3rem] opacity-30 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]"
        />

        <div className="relative mx-auto max-w-5xl px-4 py-24 sm:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-fd-foreground sm:text-4xl">Our Sponsors</h2>
            <p className="mx-auto mt-3 max-w-lg text-balance text-sm text-fd-muted-foreground sm:text-base">
              Thank you to these amazing people for supporting mango.
            </p>
          </div>

          <div className="mt-14 flex flex-wrap items-center justify-center gap-10">
            <a
              href="https://github.com/dl09r"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-3"
            >
              <div className="relative">
                <div className="absolute -inset-1 rounded-full bg-fd-primary/10 opacity-0 blur-lg transition-opacity duration-300 group-hover:opacity-100" />
                <img
                  src="https://unavatar.io/github/dl09r"
                  alt="dl09r"
                  className="relative h-18 w-18 rounded-full ring-2 ring-fd-border/60 transition-all duration-300 group-hover:scale-110 group-hover:ring-fd-primary/40 sm:h-20 sm:w-20"
                />
              </div>
              <span className="text-sm font-semibold text-fd-foreground transition-colors group-hover:text-fd-primary">
                dl09r
              </span>
            </a>
            <a
              href="https://github.com/tonybanters"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-3"
            >
              <div className="relative">
                <div className="absolute -inset-1 rounded-full bg-fd-primary/10 opacity-0 blur-lg transition-opacity duration-300 group-hover:opacity-100" />
                <img
                  src="https://unavatar.io/github/tonybanters"
                  alt="tonybanters"
                  className="relative h-18 w-18 rounded-full ring-2 ring-fd-border/60 transition-all duration-300 group-hover:scale-110 group-hover:ring-fd-primary/40 sm:h-20 sm:w-20"
                />
              </div>
              <span className="text-sm font-semibold text-fd-foreground transition-colors group-hover:text-fd-primary">
                tonybanters
              </span>
            </a>
            <a
              href="https://github.com/vinthara"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-3"
            >
              <div className="relative">
                <div className="absolute -inset-1 rounded-full bg-fd-primary/10 opacity-0 blur-lg transition-opacity duration-300 group-hover:opacity-100" />
                <img
                  src="https://unavatar.io/github/vinthara"
                  alt="vinthara"
                  className="relative h-18 w-18 rounded-full ring-2 ring-fd-border/60 transition-all duration-300 group-hover:scale-110 group-hover:ring-fd-primary/40 sm:h-20 sm:w-20"
                />
              </div>
              <span className="text-sm font-semibold text-fd-foreground transition-colors group-hover:text-fd-primary">
                vinthara
              </span>
            </a>
          </div>

          <div className="mt-16 text-center">
            <div className="mx-auto max-w-lg rounded-2xl border border-fd-border/50 bg-fd-card/50 p-8 backdrop-blur-sm">
              <Heart className="mx-auto h-8 w-8 text-red-500" />
              <h3 className="mt-4 text-lg font-bold text-fd-foreground">Become a Sponsor</h3>
              <p className="mt-2 text-sm text-fd-muted-foreground">
                If mango makes your desktop better, consider supporting its development. Every
                contribution helps.
              </p>
              <div className="mt-6 flex justify-center">
                <SponsorButton size="lg" className="px-8 text-base" />
              </div>
            </div>
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
