import { useEffect, useMemo, useRef, useState } from "react";
import showcaseEntries from "@/showcase.json";
import { ArrowLeft, ArrowRight, ExternalLink, Play, X } from "lucide-react";
import { formatDate } from "@/lib/date";

function buildMedia(entry: (typeof showcaseEntries)[0]) {
  const items: Array<{ type: "image" | "video"; url: string }> = [];
  for (const url of entry.screenshots ?? []) items.push({ type: "image", url });
  for (const url of entry.videos ?? []) items.push({ type: "video", url });
  return items;
}

function VideoPlayer({
  url,
  poster,
  onError,
}: {
  url: string;
  poster: string | undefined;
  onError: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(false);
  }, [url]);

  const validPoster = poster && poster.length > 0 ? poster : undefined;

  return (
    <div className="relative flex items-center justify-center">
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/10 border-t-white/50" />
        </div>
      )}
      <video
        ref={videoRef}
        key={url}
        controls
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        {...(validPoster ? { poster: validPoster } : {})}
        className="block max-h-[calc(100vh-130px)] max-w-[calc(100vw-140px)] rounded-lg"
        style={{
          opacity: isReady ? 1 : 0,
          transition: "opacity 0.2s ease",
          boxShadow: "0 0 0 1px rgba(255,255,255,0.06), 0 20px 60px rgba(0,0,0,0.7)",
        }}
        onLoadedMetadata={() => setIsReady(true)}
        onCanPlay={() => setIsReady(true)}
        onError={onError}
      >
        <source src={url} type="video/mp4" onError={onError} />
        Your browser does not support video playback.
      </video>
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
  entries: typeof showcaseEntries;
  index: number;
  mediaIndex: number;
  setMediaIndex: (i: number) => void;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const entry = entries[index];
  const [mediaError, setMediaError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const media = useMemo(() => buildMedia(entry), [entry]);
  const current = media[mediaIndex] ?? media[0];
  const safeMediaIndex = Math.min(mediaIndex, media.length - 1);

  useEffect(() => {
    setMediaError(false);
    setImgLoaded(false);
  }, [index, mediaIndex]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        safeMediaIndex > 0 ? setMediaIndex(safeMediaIndex - 1) : onPrev();
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        safeMediaIndex < media.length - 1 ? setMediaIndex(safeMediaIndex + 1) : onNext();
      }
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose, onPrev, onNext, safeMediaIndex, setMediaIndex, media.length]);

  const atFirstMedia = media.length === 0 || safeMediaIndex === 0;
  const atLastMedia = media.length === 0 || safeMediaIndex === media.length - 1;
  const atFirstEntry = index === 0;
  const atLastEntry = index === entries.length - 1;

  const prevDisabled = atFirstEntry && atFirstMedia;
  const nextDisabled = atLastEntry && atLastMedia;

  return (
    <div
      className="fixed inset-0 z-[100] overflow-hidden"
      style={{ background: "rgba(0,0,0,0.95)", backdropFilter: "blur(20px)" }}
      onClick={onClose}
    >
      <div
        className="fixed left-4 top-4 z-20 flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-2 text-xs text-white/65 backdrop-blur-md sm:left-5 sm:top-5"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="font-mono tabular-nums">{index + 1} / {entries.length}</span>
      </div>

      <div
        className="fixed right-4 top-4 z-20 flex items-center gap-2 sm:right-5 sm:top-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5 rounded-full bg-white/10 px-3.5 py-2 text-xs backdrop-blur-md">
          <a
            href={`https://github.com/${entry.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-white/85 transition-colors hover:text-white"
          >
            @{entry.username}
          </a>
          {entry.added && (
            <span className="hidden text-white/35 sm:inline">{formatDate(entry.added)}</span>
          )}
          <a
            href={entry.dotfiles}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium text-white/55 transition-colors hover:text-white"
          >
            Dotfiles <ExternalLink size={8} strokeWidth={2.5} />
          </a>
        </div>
        <button
          onClick={onClose}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/70 backdrop-blur-md transition-all hover:bg-white/20 hover:text-white"
          aria-label="Close"
        >
          <X size={13} strokeWidth={2.5} />
        </button>
      </div>

      <div
        className="flex h-full w-full items-center justify-center p-6 sm:p-12"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            atFirstMedia ? onPrev() : setMediaIndex(safeMediaIndex - 1);
          }}
          disabled={prevDisabled}
          aria-label="Previous"
          className="fixed left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white/65 backdrop-blur-md transition-all hover:bg-white/20 hover:text-white active:scale-95 disabled:pointer-events-none disabled:opacity-0 sm:left-5"
        >
          <ArrowLeft size={16} />
        </button>

        {!mediaError && current ? (
          current.type === "video" ? (
            <VideoPlayer
              url={current.url}
              poster={entry.screenshots?.[0]}
              onError={() => setMediaError(true)}
            />
          ) : (
            <div
              className="relative overflow-hidden rounded-lg"
              style={{ boxShadow: "0 16px 50px rgba(0,0,0,0.6)" }}
            >
              {!imgLoaded && (
                <div
                  className="absolute inset-0 flex items-center justify-center bg-white/[0.03]"
                  style={{ minWidth: 320, minHeight: 200 }}
                >
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/10 border-t-white/40" />
                </div>
              )}
              <img
                key={current.url}
                src={current.url}
                alt={`${entry.username}'s desktop`}
                className="block max-h-[82vh] max-w-[88vw] object-contain"
                style={{ opacity: imgLoaded ? 1 : 0, transition: "opacity 0.2s ease" }}
                onLoad={() => setImgLoaded(true)}
                onError={() => setMediaError(true)}
              />
            </div>
          )
        ) : (
          <div
            className="flex items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.02] text-sm text-white/25"
            style={{ minWidth: 320, minHeight: 200 }}
          >
            Media unavailable
          </div>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            atLastMedia ? onNext() : setMediaIndex(safeMediaIndex + 1);
          }}
          disabled={nextDisabled}
          aria-label="Next"
          className="fixed right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white/65 backdrop-blur-md transition-all hover:bg-white/20 hover:text-white active:scale-95 disabled:pointer-events-none disabled:opacity-0 sm:right-5"
        >
          <ArrowRight size={16} />
        </button>
      </div>

      {media.length > 1 && (
        <div
          className="fixed bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/10 px-3 py-2 backdrop-blur-md"
          onClick={(e) => e.stopPropagation()}
        >
          {media.map((item, i) => {
            const active = i === safeMediaIndex;
            return (
              <button
                key={i}
                onClick={() => setMediaIndex(i)}
                aria-label={`${item.type === "video" ? "Video" : "Screenshot"} ${i + 1}`}
                className="flex h-4 items-center justify-center"
              >
                {item.type === "video" ? (
                  <span className={`transition-colors ${active ? "text-white" : "text-white/35 hover:text-white/60"}`}>
                    <Play size={9} />
                  </span>
                ) : (
                  <span
                    className={`block rounded-full transition-all duration-200 ${
                      active ? "h-1.5 w-5 bg-white" : "h-1.5 w-1.5 bg-white/30 hover:bg-white/55"
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
