import { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import showcaseEntries from "../showcase.json";
import { createTitle } from "@/lib/site";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export const Route = createFileRoute("/showcase")({
  head: () => ({
    meta: [
      { title: createTitle("Showcase") },
      { property: "og:image", content: "/og/showcase/image.webp" },
    ],
  }),
  component: Showcase,
  loader: async () => showcaseEntries,
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
    setImgError(false);
  }, [index]);

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

  const NavButton = ({
    onClick,
    label,
    side,
    children,
  }: {
    onClick: (e: React.MouseEvent) => void;
    label: string;
    side: "left" | "right";
    children: React.ReactNode;
  }) => (
    <button
      onClick={onClick}
      className={`absolute ${side}-4 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/40 backdrop-blur transition-all hover:border-white/25 hover:bg-white/10 hover:text-white`}
      aria-label={label}
    >
      {children}
    </button>
  );

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.9)", backdropFilter: "blur(16px)" }}
      onClick={onClose}
    >
      <NavButton
        onClick={(e) => {
          e.stopPropagation();
          onPrev();
        }}
        label="Previous"
        side="left"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
      </NavButton>

      <div className="flex flex-col items-center gap-4 px-16" onClick={(e) => e.stopPropagation()}>
        <div
          className="relative overflow-hidden rounded-xl"
          style={{
            boxShadow: "0 0 0 1px rgba(255,255,255,0.07), 0 32px 80px rgba(0,0,0,0.7)",
          }}
        >
          {!imgError ? (
            <img
              src={entry.screenshot}
              alt={`${entry.username}'s desktop`}
              className="max-h-[80vh] max-w-[85vw] object-contain"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex h-[60vh] w-[70vw] items-center justify-center text-white/40 text-sm">
              Screenshot unavailable
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs backdrop-blur-md">
          <span className="font-mono text-white/25 tracking-widest">
            {String(index + 1).padStart(2, "0")}/{String(entries.length).padStart(2, "0")}
          </span>
          <span className="h-3 w-px bg-white/10" />
          <a
            href={`https://github.com/${entry.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-white/80 hover:text-white transition-colors"
          >
            @{entry.username}
          </a>
          {entry.added && (
            <>
              <span className="h-3 w-px bg-white/10" />
              <span className="text-white/30">{formatDate(entry.added)}</span>
            </>
          )}
          <span className="h-3 w-px bg-white/10" />
          <a
            href={entry.dotfiles}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-white/40 hover:text-white/70 transition-colors"
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

      <NavButton
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
        label="Next"
        side="right"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </NavButton>

      <button
        onClick={onClose}
        className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/30 backdrop-blur transition-all hover:border-white/25 hover:text-white"
        aria-label="Close"
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
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

function ShowcaseCard({
  entry,
  _index,
  onOpen,
}: {
  entry: (typeof showcaseEntries)[0];
  _index: number;
  onOpen: () => void;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-fd-border/50 bg-fd-card transition-all duration-300 hover:border-fd-border hover:shadow-xl">
      <button
        onClick={!imgError ? onOpen : undefined}
        className="relative aspect-video w-full overflow-hidden bg-fd-muted focus:outline-none"
        disabled={imgError}
      >
        {!imgError ? (
          <img
            src={entry.screenshot}
            alt={`${entry.username}'s desktop`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-fd-muted-foreground text-sm">
            Screenshot unavailable
          </div>
        )}

        {!imgError && (
          <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/50 to-transparent pb-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <span className="rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[11px] font-medium text-white/80 backdrop-blur-sm">
              View full size ↗
            </span>
          </div>
        )}
      </button>

      <div className="flex items-center justify-between gap-3 border-t border-fd-border/40 px-4 py-3">
        <div className="min-w-0">
          <a
            href={`https://github.com/${entry.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block truncate text-sm font-semibold text-fd-foreground hover:text-fd-primary transition-colors"
          >
            @{entry.username}
          </a>
          {entry.added && (
            <span className="text-[10px] text-fd-muted-foreground/50">
              {formatDate(entry.added)}
            </span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {entry.tags?.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-fd-border/40 bg-fd-muted/40 px-2 py-0.5 text-[10px] text-fd-muted-foreground"
            >
              {tag}
            </span>
          ))}
          <a
            href={entry.dotfiles}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-md border border-fd-border/60 bg-fd-muted/50 px-2.5 py-1 text-[11px] font-medium text-fd-foreground/60 transition-all hover:border-fd-border hover:text-fd-foreground"
          >
            Dotfiles
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="9"
              height="9"
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
    </div>
  );
}

function Showcase() {
  const entries = Route.useLoaderData();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set());

  const allTags = useMemo(
    () =>
      Array.from(new Set(entries.flatMap((e) => e.tags ?? [])))
        .filter(Boolean)
        .sort(),
    [entries],
  );

  const filteredEntries = useMemo(
    () =>
      activeTags.size === 0
        ? entries
        : entries.filter((e) => e.tags?.some((t) => activeTags.has(t))),
    [entries, activeTags],
  );

  const toggleTag = useCallback((tag: string) => {
    setActiveTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag); else next.add(tag);
      return next;
    });
  }, []);

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const prevLightbox = useCallback(
    () =>
      setLightboxIndex((i) =>
        i !== null ? (i - 1 + filteredEntries.length) % filteredEntries.length : null,
      ),
    [filteredEntries.length],
  );
  const nextLightbox = useCallback(
    () => setLightboxIndex((i) => (i !== null ? (i + 1) % filteredEntries.length : null)),
    [filteredEntries.length],
  );

  return (
    <div className="relative min-h-screen bg-fd-background px-4 py-12 sm:px-6 lg:px-8">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-80 opacity-25"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 0%, color-mix(in srgb, var(--color-fd-primary) 30%, transparent), transparent)",
        }}
      />

      <Link
        to="/"
        className="fixed left-5 top-5 z-50 inline-flex items-center gap-1.5 rounded-full border border-fd-border bg-fd-background/80 px-3.5 py-1.5 text-xs font-medium text-fd-foreground/70 shadow backdrop-blur-md transition-colors hover:text-fd-foreground"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
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
        <div className="mb-12 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-fd-foreground sm:text-5xl">
              Showcase
            </h1>
            <p className="mt-2 text-fd-muted-foreground">
              Browse configs, grab dotfiles, get inspired.
            </p>

            {/* Tag filters */}
            {allTags.length > 0 && (
              <div className="mt-5 space-y-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  {allTags.map((tag) => {
                    const active = activeTags.has(tag);
                    const count = entries.filter((e) => e.tags?.includes(tag)).length;
                    return (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all duration-150 ${
                          active
                            ? "border-fd-primary bg-fd-primary/10 text-fd-primary"
                            : "border-fd-border/50 text-fd-muted-foreground hover:border-fd-border hover:text-fd-foreground"
                        }`}
                      >
                        {active && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="9"
                            height="9"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        )}
                        {tag}
                        <span
                          className={`rounded-full px-1 py-px text-[9px] font-semibold tabular-nums ${
                            active
                              ? "bg-fd-primary/15 text-fd-primary"
                              : "bg-fd-muted text-fd-muted-foreground/60"
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {activeTags.size > 0 && (
                  <div className="flex items-center gap-2 text-xs text-fd-muted-foreground">
                    <span>
                      {filteredEntries.length} of {entries.length} setups
                    </span>
                    <span className="h-3 w-px bg-fd-border/60" />
                    <button
                      onClick={() => setActiveTags(new Set())}
                      className="inline-flex items-center gap-1 text-fd-muted-foreground hover:text-fd-foreground transition-colors"
                    >
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
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                      Clear filters
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <a
            href="https://github.com/mangowm/mango-showcase"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-fd-border bg-fd-muted/30 px-4 py-2 text-sm font-medium text-fd-foreground transition-all hover:bg-fd-muted sm:mt-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="13"
              height="13"
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

        <div className="mb-8 h-px w-full bg-gradient-to-r from-transparent via-fd-border to-transparent" />

        {/* Grid */}
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredEntries.map((entry, i) => (
            <ShowcaseCard
              key={entry.username}
              entry={entry}
              index={i}
              onOpen={() => setLightboxIndex(i)}
            />
          ))}
        </div>

        {filteredEntries.length === 0 && (
          <div className="py-24 text-center text-fd-muted-foreground text-sm">
            No setups match this filter.
          </div>
        )}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          entries={filteredEntries}
          index={lightboxIndex}
          onClose={closeLightbox}
          onPrev={prevLightbox}
          onNext={nextLightbox}
        />
      )}
    </div>
  );
}
