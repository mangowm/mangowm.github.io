import { useCallback, useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import showcaseEntries from "../showcase.json";
import { createTitle } from "@/lib/site";

export const Route = createFileRoute("/showcase")({
  head: () => ({ meta: [{ title: createTitle("Showcase") }] }),
  component: Showcase,
  loader: async () => {
    return showcaseEntries;
  },
});

function Lightbox({
  entries,
  index,
  onClose,
  onPrev,
  onNext,
}: {
  entries: typeof showcaseEntries;
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const entry = entries[index];
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose, onPrev, onNext]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.92)", backdropFilter: "blur(12px)" }}
      onClick={onClose}
    >
      {/* Prev */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onPrev();
        }}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 group"
        aria-label="Previous"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 backdrop-blur transition-all duration-200 group-hover:border-white/30 group-hover:bg-white/10 group-hover:text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </span>
      </button>

      {/* Content */}
      <div
        className="flex flex-col items-center gap-5 px-16"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="relative overflow-hidden rounded-xl shadow-2xl"
          style={{
            boxShadow:
              "0 0 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.06)",
          }}
        >
          {!imgError
            ? (
              <img
                src={entry.screenshot}
                alt={`${entry.username}'s mangowm desktop`}
                className="max-h-[80vh] max-w-[85vw] object-contain"
                onError={() => setImgError(true)}
              />
            )
            : (
              <div className="flex h-[60vh] w-[70vw] items-center justify-center text-white/60">
                Screenshot unavailable
              </div>
            )}
        </div>

        {/* Meta bar */}
        <div className="flex items-center gap-4 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm backdrop-blur-md">
          <span className="text-white/30 text-xs font-mono tracking-widest uppercase">
            {String(index + 1).padStart(2, "0")} /{" "}
            {String(entries.length).padStart(2, "0")}
          </span>
          <span className="h-3 w-px bg-white/15" />
          <a
            href={`https://github.com/${entry.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-white/90 transition-colors hover:text-white"
          >
            @{entry.username}
          </a>
          <span className="h-3 w-px bg-white/15" />
          <a
            href={entry.dotfiles}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-white/50 transition-colors hover:text-white/80"
          >
            Dotfiles
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7 7h10v10M7 17 17 7" />
            </svg>
          </a>
        </div>
      </div>

      {/* Next */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 group"
        aria-label="Next"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 backdrop-blur transition-all duration-200 group-hover:border-white/30 group-hover:bg-white/10 group-hover:text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </span>
      </button>

      {/* Close */}
      <button
        onClick={onClose}
        className="absolute right-5 top-5 group"
        aria-label="Close"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/40 backdrop-blur transition-all duration-200 group-hover:border-white/30 group-hover:text-white">
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
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </span>
      </button>
    </div>
  );
}

function ShowcaseCard({
  entry,
  index,
  onOpen,
}: {
  entry: (typeof showcaseEntries)[0];
  index: number;
  onOpen: () => void;
}) {
  const num = String(index + 1).padStart(2, "0");
  const [imgError, setImgError] = useState(false);
  return (
    <div
      className="showcase-card group relative flex flex-col overflow-hidden rounded-xl border border-fd-border/50 bg-fd-card transition-all duration-500 hover:border-fd-border hover:shadow-2xl"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Image */}
      <button
        onClick={!imgError ? onOpen : undefined}
        className="relative aspect-video w-full overflow-hidden bg-fd-muted text-left focus:outline-none"
      >
        {!imgError
          ? (
            <img
              src={entry.screenshot}
              alt={`${entry.username} mangowm desktop`}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          )
          : (
            <div className="flex h-full w-full items-center justify-center bg-fd-muted text-fd-muted-foreground text-sm">
              Screenshot unavailable
            </div>
          )}

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 transition-opacity duration-400 group-hover:opacity-100" />

        {/* Index number — top-left badge */}
        <span className="absolute left-3 top-3 font-mono text-[10px] font-bold tracking-widest text-white/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          {num}
        </span>

        {/* Expand hint — bottom center */}
        <span className="absolute bottom-4 left-1/2 -translate-x-1/2 translate-y-2 rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[11px] font-medium tracking-wide text-white/80 opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          View full size ↗
        </span>
      </button>

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 border-t border-fd-border/40 bg-fd-card px-4 py-3">
        <a
          href={`https://github.com/${entry.username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="truncate text-sm font-semibold text-fd-foreground transition-colors hover:text-fd-primary"
        >
          @{entry.username}
        </a>

        <a
          href={entry.dotfiles}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1 rounded-md border border-fd-border/60 bg-fd-muted/50 px-2.5 py-1 text-[11px] font-medium text-fd-foreground/60 transition-all duration-200 hover:border-fd-border hover:bg-fd-muted hover:text-fd-foreground"
        >
          Dotfiles
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M7 7h10v10M7 17 17 7" />
          </svg>
        </a>
      </div>
    </div>
  );
}

function Showcase() {
  const entries = Route.useLoaderData();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox = useCallback((i: number) => setLightboxIndex(i), []);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const prevLightbox = useCallback(
    () =>
      setLightboxIndex((
        i,
      ) => (i !== null ? (i - 1 + entries.length) % entries.length : null)),
    [entries.length],
  );
  const nextLightbox = useCallback(
    () =>
      setLightboxIndex((i) => (i !== null ? (i + 1) % entries.length : null)),
    [entries.length],
  );

  return (
    <div className="relative min-h-screen bg-fd-background px-4 py-12 sm:px-6 lg:px-8">
      {/* Subtle radial glow at the top */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-96 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, color-mix(in srgb, var(--color-fd-primary) 25%, transparent), transparent)",
        }}
      />

      {/* Back button */}
      <Link
        to="/"
        className="fixed left-6 top-6 z-50 inline-flex items-center gap-2 rounded-full border border-fd-border bg-fd-background/80 px-4 py-2 text-sm font-medium text-fd-foreground shadow-lg backdrop-blur-md transition-colors hover:text-fd-primary"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
        Back
      </Link>

      <div className="relative mx-auto w-full max-w-7xl">
        {/* Header */}
        <div className="mb-14 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-fd-foreground sm:text-5xl">
              Showcase
            </h1>
            <p className="mt-4 max-w-md text-fd-muted-foreground leading-relaxed">
              Browse configs, grab dotfiles, and get inspired.
            </p>

            {/* Entry count pill */}
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-fd-border/60 bg-fd-muted/30 px-3.5 py-1.5 text-xs text-fd-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-fd-primary" />
              {entries.length} setups
            </div>
          </div>

          <a
            href="https://github.com/mangowm/mango-showcase"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-fd-border bg-fd-muted/30 px-5 py-2.5 text-sm font-medium text-fd-foreground shadow-sm transition-all duration-200 hover:bg-fd-muted hover:border-fd-border/80"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
            Submit your setup
          </a>
        </div>

        {/* Divider */}
        <div className="mb-10 h-px w-full bg-gradient-to-r from-transparent via-fd-border to-transparent" />

        {/* Grid */}
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {entries.map((entry, i) => (
            <ShowcaseCard
              key={entry.username}
              entry={entry}
              index={i}
              onOpen={() => openLightbox(i)}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        {entries.length > 0 && (
          <div className="mt-16 flex flex-col items-center gap-3 text-center">
            <p className="text-sm text-fd-muted-foreground">
              Have a setup to share?
            </p>
            <a
              href="https://github.com/mangowm/mango-showcase"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-fd-primary underline underline-offset-4 hover:opacity-75 transition-opacity"
            >
              Submit via pull request →
            </a>
          </div>
        )}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          entries={entries}
          index={lightboxIndex}
          onClose={closeLightbox}
          onPrev={prevLightbox}
          onNext={nextLightbox}
        />
      )}
    </div>
  );
}
