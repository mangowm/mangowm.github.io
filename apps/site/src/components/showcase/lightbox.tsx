import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ExternalLink, Play } from "lucide-react";
import { cn } from "cn";
import { Button } from "@mangowm/ui/components/button";
import { Dialog, DialogContent, DialogTitle } from "@mangowm/ui/components/dialog";
import { Skeleton } from "@mangowm/ui/components/skeleton";
import { formatDate } from "@/lib/date";
import { entryMedia, imageSrc, type ShowcaseEntry, type ShowcaseImage } from "@/lib/showcase-data";
import { videoMimeType } from "@/lib/showcase-media";
import { ShowcasePicture } from "./showcase-picture";

type MediaStatus = "loading" | "loaded" | "error";

function MediaUnavailable() {
  return (
    <div className="flex h-full w-full items-center justify-center text-sm text-white/30">
      Media unavailable
    </div>
  );
}

function VideoPlayer({ url, poster }: { url: string; poster?: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) return <MediaUnavailable />;

  return (
    <div className="flex h-full w-full items-center justify-center">
      <video
        controls
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster={poster}
        onError={() => setFailed(true)}
        className="block max-h-full max-w-full rounded-lg"
      >
        <source src={url} type={videoMimeType(url)} />
        Your browser does not support video playback.
      </video>
    </div>
  );
}

function ImageView({ image, username }: { image: ShowcaseImage; username: string }) {
  const [status, setStatus] = useState<MediaStatus>("loading");
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (element?.complete) setStatus(element.naturalWidth > 0 ? "loaded" : "error");
  }, []);

  if (status === "error") return <MediaUnavailable />;

  return (
    <div className="flex h-full w-full items-center justify-center">
      {status === "loading" && <Skeleton className="h-3/4 w-3/4 rounded-lg bg-white/[0.06]" />}
      <ShowcasePicture
        ref={ref}
        image={image}
        alt={`${username}'s desktop`}
        sizes="100vw"
        loading="eager"
        fetchPriority="high"
        decoding="async"
        onLoad={() => setStatus("loaded")}
        onError={() => setStatus("error")}
        className={cn(
          "block max-h-full max-w-full rounded-lg object-contain shadow-[0_16px_50px_rgba(0,0,0,0.6)] transition-opacity duration-200",
          status === "loaded" ? "opacity-100" : "opacity-0",
        )}
      />
    </div>
  );
}

export function Lightbox({
  entries,
  index,
  mediaIndex,
  setMediaIndex,
  onClose,
  onPrev,
  onNext,
}: {
  entries: ShowcaseEntry[];
  index: number;
  mediaIndex: number;
  setMediaIndex: (index: number) => void;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const popupRef = useRef<HTMLDivElement>(null);
  const entry = entries[index];
  if (!entry) return null;

  const media = entryMedia(entry);
  const safeMediaIndex = Math.min(mediaIndex, media.length - 1);
  const current = media[safeMediaIndex];

  const atFirstMedia = safeMediaIndex === 0;
  const atLastMedia = safeMediaIndex === media.length - 1;
  const prevDisabled = index === 0 && atFirstMedia;
  const nextDisabled = index === entries.length - 1 && atLastMedia;

  const goPrev = () => {
    if (!atFirstMedia) setMediaIndex(safeMediaIndex - 1);
    else if (index > 0) onPrev();
  };
  const goNext = () => {
    if (!atLastMedia) setMediaIndex(safeMediaIndex + 1);
    else if (index < entries.length - 1) onNext();
  };

  return (
    <Dialog
      open
      modal
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        ref={popupRef}
        initialFocus={popupRef}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            goPrev();
          } else if (event.key === "ArrowRight") {
            event.preventDefault();
            goNext();
          }
        }}
        className="flex h-dvh w-screen max-w-none flex-col gap-0 rounded-none bg-black/95 p-0 text-white ring-0 focus-visible:outline-none sm:max-w-none"
      >
        <DialogTitle className="sr-only">
          {entry.username}&apos;s setup, item {safeMediaIndex + 1} of {media.length}
        </DialogTitle>

        <div className="flex shrink-0 items-center justify-between gap-2 px-4 py-3 pr-14">
          <div className="rounded-full border border-white/10 bg-black/60 px-3.5 py-2 font-mono text-xs text-white/70 tabular-nums backdrop-blur-md">
            {index + 1} / {entries.length}
          </div>

          <div className="flex min-w-0 items-center gap-2.5 rounded-full border border-white/10 bg-black/60 px-3.5 py-2 text-xs backdrop-blur-md">
            <a
              href={`https://github.com/${entry.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate font-semibold text-white/85 transition-colors hover:text-white"
            >
              @{entry.username}
            </a>
            {entry.added && (
              <span className="hidden shrink-0 text-white/40 sm:inline">
                {formatDate(entry.added)}
              </span>
            )}
            <a
              href={entry.dotfiles}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-1 font-medium text-white/60 transition-colors hover:text-white"
            >
              Dotfiles <ExternalLink size={8} strokeWidth={2.5} />
            </a>
          </div>
        </div>

        <div className="relative flex min-h-0 flex-1 items-center justify-center px-6 py-4">
          <Button
            variant="ghost"
            size="icon-lg"
            onClick={goPrev}
            disabled={prevDisabled}
            aria-label="Previous"
            className="absolute inset-y-0 left-4 z-20 my-auto rounded-full bg-white/10 text-white/70 backdrop-blur-md hover:bg-white/20 hover:text-white disabled:opacity-0"
          >
            <ArrowLeft size={16} />
          </Button>

          {current ? (
            current.type === "video" ? (
              <VideoPlayer
                key={current.url}
                url={current.url}
                poster={entry.screenshots[0] ? imageSrc(entry.screenshots[0]) : undefined}
              />
            ) : (
              <ImageView key={current.image.base} image={current.image} username={entry.username} />
            )
          ) : null}

          <Button
            variant="ghost"
            size="icon-lg"
            onClick={goNext}
            disabled={nextDisabled}
            aria-label="Next"
            className="absolute inset-y-0 right-4 z-20 my-auto rounded-full bg-white/10 text-white/70 backdrop-blur-md hover:bg-white/20 hover:text-white disabled:opacity-0"
          >
            <ArrowRight size={16} />
          </Button>
        </div>

        <div className="flex h-12 shrink-0 items-center justify-center gap-2 px-4">
          {media.length > 1 &&
            media.map((item, mediaItemIndex) => {
              const active = mediaItemIndex === safeMediaIndex;
              return (
                <button
                  key={mediaItemIndex}
                  type="button"
                  onClick={() => setMediaIndex(mediaItemIndex)}
                  aria-label={`${item.type === "video" ? "Video" : "Screenshot"} ${mediaItemIndex + 1}`}
                  aria-current={active ? "true" : undefined}
                  className="flex h-4 items-center justify-center"
                >
                  {item.type === "video" ? (
                    <span
                      className={cn(
                        "transition-colors",
                        active ? "text-white" : "text-white/40 hover:text-white/70",
                      )}
                    >
                      <Play size={9} />
                    </span>
                  ) : (
                    <span
                      className={cn(
                        "block rounded-full transition-all duration-200",
                        active ? "h-1.5 w-5 bg-white" : "h-1.5 w-1.5 bg-white/30 hover:bg-white/60",
                      )}
                    />
                  )}
                </button>
              );
            })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
