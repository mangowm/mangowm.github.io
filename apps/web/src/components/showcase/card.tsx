import { useEffect, useRef, useState } from "react";
import showcaseEntries from "@/showcase.json";
import { ExternalLink, Image, Play } from "lucide-react";
import { formatDate } from "@/lib/date";

function LazyImage({
  src,
  alt,
  className,
  onError,
}: {
  src: string;
  alt: string;
  className?: string;
  onError?: () => void;
}) {
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setInView(true); io.disconnect(); }
      },
      { rootMargin: "150px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="relative h-full w-full">
      {!loaded && (
        <div className="_shimmer-track">
          <div className="_shimmer-sweep" />
        </div>
      )}
      {inView && (
        <img
          src={src}
          alt={alt}
          className={className}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={onError}
          style={{ opacity: loaded ? 1 : 0, transition: "opacity 0.25s ease" }}
        />
      )}
    </div>
  );
}

export function Card({
  entry,
  onOpen,
}: {
  entry: (typeof showcaseEntries)[0];
  onOpen: () => void;
}) {
  const [imgError, setImgError] = useState(false);
  const screenshotCount = entry.screenshots?.length ?? 0;
  const videoCount = entry.videos?.length ?? 0;
  const totalMedia = screenshotCount + videoCount;

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-fd-border/40 bg-fd-card transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-fd-border hover:shadow-xl hover:shadow-black/10">
      <button
        onClick={!imgError ? onOpen : undefined}
        disabled={imgError}
        aria-label={`View ${entry.username}'s setup`}
        className="relative aspect-video w-full overflow-hidden bg-fd-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-fd-background"
      >
        {!imgError ? (
          <>
            <LazyImage
              src={entry.screenshots?.[0] ?? ""}
              alt={`${entry.username}'s desktop`}
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
              onError={() => setImgError(true)}
            />

            {totalMedia > 1 && (
              <div className="absolute right-2 top-2 flex items-center gap-1">
                {screenshotCount > 1 && (
                  <span className="flex items-center gap-1 rounded-full border border-white/10 bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white/70 backdrop-blur-sm">
                    <Image size={9} strokeWidth={2.5} /> {screenshotCount}
                  </span>
                )}
                {videoCount > 0 && (
                  <span className="flex items-center gap-1 rounded-full border border-white/10 bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white/70 backdrop-blur-sm">
                    <Play size={9} /> {videoCount}
                  </span>
                )}
              </div>
            )}

            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <span className="rounded-full border border-white/15 bg-black/60 px-3.5 py-1.5 text-xs font-semibold text-white shadow-lg backdrop-blur-sm">
                Open
              </span>
            </div>
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-fd-muted-foreground/40">
            No screenshot
          </div>
        )}
      </button>

      <div className="flex flex-col gap-2 border-t border-fd-border/30 px-4 py-3">
        <div className="flex items-baseline justify-between gap-2">
          <a
            href={`https://github.com/${entry.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate text-sm font-semibold text-fd-foreground transition-colors hover:text-fd-primary"
          >
            @{entry.username}
          </a>
          {entry.added && (
            <time className="shrink-0 text-[11px] text-fd-muted-foreground/40">
              {formatDate(entry.added)}
            </time>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            {entry.tags?.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="truncate rounded-full border border-fd-border/40 bg-fd-muted/30 px-2 py-0.5 text-[11px] font-medium text-fd-muted-foreground/70"
              >
                {tag}
              </span>
            ))}
          </div>
          <a
            href={entry.dotfiles}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex shrink-0 items-center gap-1 rounded border border-fd-border/50 bg-fd-muted/40 px-2 py-0.5 text-[11px] font-medium text-fd-foreground/55 transition-all hover:border-fd-border hover:bg-fd-muted/70 hover:text-fd-foreground"
          >
            Dotfiles <ExternalLink size={8} strokeWidth={2.5} />
          </a>
        </div>
      </div>
    </article>
  );
}
