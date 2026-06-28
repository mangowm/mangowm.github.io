import { useCallback, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import showcaseEntries from "../showcase.json";
import { createTitle } from "@/lib/site";
import { ArrowLeft, PlusCircle } from "lucide-react";

import { Lightbox } from "@/components/showcase/lightbox";
import { Card } from "@/components/showcase/card";
import { Filter } from "@/components/showcase/filter";
import { SubmitDialog } from "@/components/showcase/submit";

const ShimmerStyle = () => (
  <style>{`
    @keyframes _shimmer {
      0%  { transform: translateX(-100%) }
      100%{ transform: translateX(100%) }
    }
    ._shimmer-track { position:absolute;inset:0;overflow:hidden;background:var(--shimmer-bg,rgba(255,255,255,0.04)); }
    ._shimmer-sweep { position:absolute;inset:0;background:linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.07) 50%,transparent 100%);animation:_shimmer 1.6s linear infinite; }
  `}</style>
);

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

function Showcase() {
  const entries = Route.useLoaderData();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set());
  const [mediaIndex, setMediaIndex] = useState(0);
  const [submitOpen, setSubmitOpen] = useState(false);

  const allTags = useMemo(
    () => Array.from(new Set(entries.flatMap((e) => e.tags ?? []))).filter(Boolean).sort(),
    [entries],
  );

  const filteredEntries = useMemo(() => {
    const filtered =
      activeTags.size === 0
        ? entries
        : entries.filter((e) => e.tags?.some((t) => activeTags.has(t)));
    return [...filtered].sort((a, b) => {
      if (!a.added && !b.added) return 0;
      if (!a.added) return 1;
      if (!b.added) return -1;
      return new Date(b.added).getTime() - new Date(a.added).getTime();
    });
  }, [entries, activeTags]);

  const toggleTag = useCallback((tag: string) => {
    setActiveTags((prev) => {
      const next = new Set(prev);
      next.has(tag) ? next.delete(tag) : next.add(tag);
      return next;
    });
  }, []);

  const openLightbox = useCallback((i: number) => {
    setLightboxIndex(i);
    setMediaIndex(0);
  }, []);

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  const prevLightbox = useCallback(() => {
    setLightboxIndex((i) =>
      i !== null ? (i - 1 + filteredEntries.length) % filteredEntries.length : null,
    );
    setMediaIndex(0);
  }, [filteredEntries.length]);

  const nextLightbox = useCallback(() => {
    setLightboxIndex((i) => (i !== null ? (i + 1) % filteredEntries.length : null));
    setMediaIndex(0);
  }, [filteredEntries.length]);

  return (
    <>
      <ShimmerStyle />
      <div className="relative min-h-screen bg-fd-background px-4 py-12 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="fixed left-4 top-4 z-50 inline-flex items-center gap-1.5 rounded-full border border-fd-border bg-fd-background/80 px-3 py-1.5 text-xs font-medium text-fd-foreground/55 shadow-sm backdrop-blur-md transition-colors hover:border-fd-border hover:bg-fd-muted/50 hover:text-fd-foreground"
        >
          <ArrowLeft size={12} /> Back
        </Link>

        <div className="relative mx-auto w-full max-w-7xl">
          <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-fd-foreground sm:text-5xl">
                Showcase
              </h1>
              <p className="mt-2.5 text-[15px] text-fd-muted-foreground/75">
                <span className="font-semibold text-fd-foreground/85">{entries.length} setups</span>{" "}
                from the community — browse configs, grab dotfiles, get inspired.
              </p>
            </div>

            <button
              onClick={() => setSubmitOpen(true)}
              className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-lg border border-fd-border bg-fd-muted/25 px-4 py-2 text-sm font-medium text-fd-foreground/75 transition-all hover:bg-fd-muted hover:text-fd-foreground sm:w-auto"
            >
              <PlusCircle size={13} /> Submit your setup
            </button>
          </div>

          {allTags.length > 0 && (
            <div className="mb-8">
              <Filter
                allTags={allTags}
                activeTags={activeTags}
                entries={entries}
                filteredCount={filteredEntries.length}
                onToggle={toggleTag}
                onClear={() => setActiveTags(new Set())}
              />
            </div>
          )}

          <div className="mb-8 border-t border-fd-border/40" />

          {filteredEntries.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredEntries.map((entry, i) => (
                <Card
                  key={entry.username}
                  entry={entry}
                  onOpen={() => openLightbox(i)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-24 text-center">
              <p className="text-sm text-fd-muted-foreground/55">No setups match these filters.</p>
              {activeTags.size > 0 && (
                <button
                  onClick={() => setActiveTags(new Set())}
                  className="text-sm font-medium text-fd-primary transition-colors hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>

        {submitOpen && <SubmitDialog onClose={() => setSubmitOpen(false)} />}

        {lightboxIndex !== null && (
          <Lightbox
            entries={filteredEntries}
            index={lightboxIndex}
            mediaIndex={mediaIndex}
            setMediaIndex={setMediaIndex}
            onClose={closeLightbox}
            onPrev={prevLightbox}
            onNext={nextLightbox}
          />
        )}
      </div>
    </>
  );
}
