import { Button } from "@mangowm/ui/components/button";
import { LayoutPreview } from "@/components/layouts/layout-preview";
import { SponsorButton } from "@/components/sponsor/sponsor-button";
import { Sponsors } from "@/components/sponsor/sponsors";
import { GITHUB_URL } from "@/constants";
import { HeartSvg } from "./icons";

function Hero() {
  return (
    <>
      <section className="relative flex min-h-[calc(100dvh_-_var(--nav-height))] flex-1 items-center overflow-x-clip px-5 py-16 lg:px-8 lg:py-20">
        <div className="mx-auto grid w-full max-w-[75rem] grid-cols-[minmax(0,1fr)] items-center gap-12 lg:grid-cols-[1fr_minmax(0,1.1fr)] lg:gap-16">
          <div className="text-center lg:text-left">
            <h1 className="mb-5 font-display text-[clamp(2.5rem,7vw,4.5rem)] leading-[1.02] font-bold tracking-[-0.035em] text-balance text-foreground">
              <span className="block">Lightweight</span>
              <span className="block text-primary-text">&amp; feature-rich</span>
            </h1>
            <p className="mx-auto mb-8 max-w-[32rem] text-lg leading-[1.55] text-pretty text-muted-foreground lg:mx-0 lg:text-[1.1875rem]">
              A lightweight, feature-rich Wayland compositor built on wlroots and scenefx.
            </p>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Button
                size="lg"
                className="h-11 rounded-full px-6 text-[0.9375rem] font-semibold"
                render={<a href="/docs/" />}
              >
                Get started
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-11 rounded-full px-6 text-[0.9375rem] font-semibold"
                render={<a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" />}
              >
                View on GitHub
              </Button>
            </div>
          </div>

          <div className="hero-visual">
            <LayoutPreview />
          </div>
        </div>
      </section>

      {/* Sponsors */}
      <section className="border-t border-border bg-background">
        <div className="mx-auto max-w-[var(--container)] px-5 py-20 text-center sm:px-8 sm:py-24">
          <h2 className="font-display text-[clamp(1.75rem,3.5vw,2.25rem)] font-bold tracking-[-0.03em] text-foreground">
            Sponsors
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-[1.0625rem] leading-[1.6] text-pretty text-muted-foreground">
            Thanks to the people who support mango&apos;s development.
          </p>

          <Sponsors className="mt-12 justify-center" />

          <div className="mt-16 flex justify-center">
            <div className="relative w-full max-w-[34rem] before:absolute before:inset-[0.85rem_-0.85rem_-0.85rem_0.85rem] before:z-0 before:rotate-[2.5deg] before:rounded-3xl before:bg-leaf before:content-['']">
              <div className="relative z-[1] w-full rounded-3xl border border-border bg-card p-9 shadow-[0_18px_40px_oklch(0.7_0.13_78_/_0.12)]">
                <HeartSvg className="mx-auto size-8 text-brand" />
                <h3 className="mt-3.5 font-display text-xl font-bold tracking-[-0.02em] text-foreground">
                  Become a sponsor
                </h3>
                <p className="mt-2 text-[0.9375rem] leading-[1.6] text-muted-foreground">
                  If mango makes your desktop better, consider supporting its development. Every
                  contribution helps.
                </p>
                <div className="mt-6 flex justify-center">
                  <SponsorButton large />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export function HomePage() {
  return <Hero />;
}
