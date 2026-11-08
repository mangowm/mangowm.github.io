import { ExternalLink, Image, Play } from "lucide-react";
import { Badge } from "@mangowm/ui/components/badge";
import { formatDate } from "@/lib/date";
import type { ShowcaseEntry } from "@/lib/showcase-data";
import { ShowcasePicture } from "./showcase-picture";

const CARD_SIZES =
  "(min-width: 1200px) 365px, (min-width: 1024px) calc(33.33vw - 35px), (min-width: 640px) calc(50vw - 42px), calc(100vw - 40px)";

export function Card({
  entry,
  onOpen,
  priority = false,
}: {
  entry: ShowcaseEntry;
  onOpen: () => void;
  priority?: boolean;
}) {
  const screenshotCount = entry.screenshots.length;
  const videoCount = entry.videos.length;
  const totalMedia = screenshotCount + videoCount;
  const screenshot = entry.screenshots[0];
  const video = screenshot ? undefined : entry.videos[0];

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-border hover:shadow-xl hover:shadow-black/10">
      <button
        type="button"
        onClick={onOpen}
        aria-label={`View ${entry.username}'s setup`}
        className="relative aspect-video w-full overflow-hidden border border-transparent bg-muted focus-visible:border-ring"
      >
        {screenshot ? (
          <ShowcasePicture
            image={screenshot}
            alt={`${entry.username}'s desktop`}
            sizes={CARD_SIZES}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            decoding="async"
            className="relative h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.04]"
          />
        ) : video ? (
          <video
            src={`${video}#t=0.1`}
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
            className="relative h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.04]"
          />
        ) : null}

        {video && (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm">
              <Play size={14} className="translate-x-px fill-current" />
            </span>
          </span>
        )}

        {totalMedia > 1 && (
          <div className="absolute top-2 right-2 flex items-center gap-1">
            {screenshotCount > 1 && (
              <Badge className="border-white/10 bg-black/60 text-white/70 backdrop-blur-sm">
                <Image size={9} strokeWidth={2.5} /> {screenshotCount}
              </Badge>
            )}
            {videoCount > 0 && (
              <Badge className="border-white/10 bg-black/60 text-white/70 backdrop-blur-sm">
                <Play size={9} /> {videoCount}
              </Badge>
            )}
          </div>
        )}
      </button>

      <div className="flex flex-col gap-2 border-t border-border/40 px-4 py-3">
        <div className="flex items-baseline justify-between gap-2">
          <a
            href={`https://github.com/${entry.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate text-sm font-semibold text-foreground transition-colors hover:text-primary-text focus-visible:underline"
          >
            @{entry.username}
          </a>
          {entry.added && (
            <time className="shrink-0 text-[11px] text-muted-foreground">
              {formatDate(entry.added)}
            </time>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            {entry.tags.slice(0, 2).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="max-w-[8rem] truncate text-muted-foreground"
              >
                {tag}
              </Badge>
            ))}
          </div>
          <a
            href={entry.dotfiles}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border/60 bg-muted/40 px-2 py-0.5 text-[11px] font-medium text-muted-foreground transition-colors hover:border-border hover:bg-muted hover:text-foreground focus-visible:border-ring"
          >
            Dotfiles <ExternalLink size={8} strokeWidth={2.5} />
          </a>
        </div>
      </div>
    </article>
  );
}
