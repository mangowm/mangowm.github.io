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
  screenshotIndex,
  setScreenshotIndex,
  onClose,
  onPrev,
  onNext,
}: {
  entries: typeof showcaseEntries;
  index: number;
  screenshotIndex: number;
  setScreenshotIndex: (i: number) => void;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const entry = entries[index];
  const [imgError, setImgError] = useState(false);

  const screenshots = entry.screenshots ?? [];
  const currentScreenshot = screenshots[screenshotIndex] ?? screenshots[0];

  useEffect(() => {
    setImgError(false);
    setScreenshotIndex(0);
  }, [index, setScreenshotIndex]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") {
        if (screenshotIndex > 0) {
          setScreenshotIndex(screenshotIndex - 1);
        } else {
          onPrev();
        }
      }
      if (e.key === "ArrowRight") {
        if (screenshotIndex < screenshots.length - 1) {
          setScreenshotIndex(screenshotIndex + 1);
        } else {
          onNext();
        }
      }
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose, onPrev, onNext, screenshotIndex, setScreenshotIndex, screenshots.length]);

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
      className={`absolute ${side === "left" ? "left-6 sm:left-[5%]" : "right-6 sm:right-[5%]"} top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white/70 backdrop-blur-md transition-all hover:border-white/40 hover:bg-white/20 hover:text-white hover:scale-110 active:scale-95`}
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
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
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
              src={currentScreenshot}
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

        {screenshots.length > 1 && (
          <div className="flex items-center gap-1.5">
            {screenshots.map((_, i) => (
              <button
                key={i}
                onClick={() => setScreenshotIndex(i)}
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  i === screenshotIndex ? "w-4 bg-white/70" : "w-1.5 bg-white/20 hover:bg-white/40"
                }`}
                aria-label={`Screenshot ${i + 1}`}
              />
            ))}
          </div>
        )}

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
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
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
  onOpen,
}: {
  entry: (typeof showcaseEntries)[0];
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
          <>
            <img
              src={entry.screenshots?.[0]}
              alt={`${entry.username}'s desktop`}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              loading="lazy"
              onError={() => setImgError(true)}
            />
            {(entry.screenshots?.length ?? 0) > 1 && (
              <div className="absolute right-2 top-2 rounded-md border border-white/15 bg-black/60 px-2 py-1 text-xs font-medium text-white/80 backdrop-blur-sm">
                1/{entry.screenshots!.length}
              </div>
            )}
          </>
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

const VISIBLE_TAGS = 8;

function TagFilter({
  allTags,
  activeTags,
  entries,
  filteredCount,
  onToggle,
  onClear,
}: {
  allTags: string[];
  activeTags: Set<string>;
  entries: typeof showcaseEntries;
  filteredCount: number;
  onToggle: (tag: string) => void;
  onClear: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  // Auto-expand if an active tag sits beyond the visible fold
  useEffect(() => {
    if (!expanded) {
      const hasHiddenActive = allTags.slice(VISIBLE_TAGS).some((t) => activeTags.has(t));
      if (hasHiddenActive) setExpanded(true);
    }
  }, [activeTags, allTags, expanded]);

  const visible = expanded ? allTags : allTags.slice(0, VISIBLE_TAGS);
  const hiddenCount = allTags.length - VISIBLE_TAGS;

  return (
    <div className="mt-5 space-y-2">
      <div className="flex flex-wrap items-center gap-1.5">
        {visible.map((tag) => {
          const active = activeTags.has(tag);
          const count = entries.filter((e) => e.tags?.includes(tag)).length;
          return (
            <button
              key={tag}
              onClick={() => onToggle(tag)}
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

        {!expanded && hiddenCount > 0 && (
          <button
            onClick={() => setExpanded(true)}
            className="inline-flex items-center gap-1 rounded-full border border-dashed border-fd-border/50 px-3 py-1 text-xs text-fd-muted-foreground transition-colors hover:border-fd-border hover:text-fd-foreground"
          >
            +{hiddenCount} more
          </button>
        )}

        {expanded && allTags.length > VISIBLE_TAGS && (
          <button
            onClick={() => setExpanded(false)}
            className="inline-flex items-center gap-1 rounded-full border border-dashed border-fd-border/50 px-3 py-1 text-xs text-fd-muted-foreground transition-colors hover:border-fd-border hover:text-fd-foreground"
          >
            Show less
          </button>
        )}
      </div>

      {activeTags.size > 0 && (
        <div className="flex items-center gap-2 text-xs text-fd-muted-foreground">
          <span>
            {filteredCount} of {entries.length} setups
          </span>
          <span className="h-3 w-px bg-fd-border/60" />
          <button
            onClick={onClear}
            className="inline-flex items-center gap-1 hover:text-fd-foreground transition-colors"
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
  );
}

type RepoStatus = "idle" | "checking" | "valid" | "private" | "not-found" | "error";
type ScreenshotStatus = "idle" | "checking" | "found" | "missing" | "error";

function useRepoValidation(username: string | null, repo: string | null): RepoStatus {
  const [status, setStatus] = useState<RepoStatus>("idle");

  useEffect(() => {
    if (!username || !repo) {
      setStatus("idle");
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setStatus("checking");
      try {
        const res = await fetch(`https://api.github.com/repos/${username}/${repo}`, {
          signal: controller.signal,
        });
        if (res.status === 404) {
          setStatus("not-found");
        } else if (res.ok) {
          const data = await res.json();
          setStatus(data.private ? "private" : "valid");
        } else {
          setStatus("error");
        }
      } catch {
        if (!controller.signal.aborted) setStatus("error");
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [username, repo]);

  return status;
}

function useScreenshotValidation(
  repoStatus: RepoStatus,
  username: string | null,
  repo: string | null,
): ScreenshotStatus {
  const [status, setStatus] = useState<ScreenshotStatus>("idle");

  useEffect(() => {
    if (repoStatus !== "valid" || !username || !repo) {
      setStatus("idle");
      return;
    }

    const controller = new AbortController();

    async function check() {
      setStatus("checking");
      try {
        const rootRes = await fetch(
          `https://api.github.com/repos/${username}/${repo}/contents/screenshot.png`,
          { signal: controller.signal },
        );
        if (rootRes.ok) {
          setStatus("found");
          return;
        }

        if (rootRes.status === 404) {
          const dirRes = await fetch(
            `https://api.github.com/repos/${username}/${repo}/contents/screenshots`,
            { signal: controller.signal },
          );
          if (dirRes.ok) {
            const files = (await dirRes.json()) as { name: string }[];
            setStatus(files.some((f) => f.name === "1.png") ? "found" : "missing");
          } else if (dirRes.status === 404) {
            setStatus("missing");
          } else {
            setStatus("error");
          }
        } else {
          setStatus("error");
        }
      } catch {
        if (!controller.signal.aborted) setStatus("error");
      }
    }

    check();
    return () => controller.abort();
  }, [repoStatus, username, repo]);

  return status;
}

function useModalBehavior(onClose: () => void) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);
}

type FieldStatusProps = {
  dotfiles: string;
  repoStatus: RepoStatus;
  screenshotStatus: ScreenshotStatus;
  username: string | null;
};

function FieldStatus({ dotfiles, repoStatus, screenshotStatus, username }: FieldStatusProps) {
  if (dotfiles.length > 0 && !dotfiles.startsWith("https://github.com/")) {
    return <p className="text-[11px] text-red-400/80">Must be a GitHub URL</p>;
  }

  if (repoStatus === "checking") {
    return (
      <p className="flex items-center gap-1.5 text-[11px] text-fd-muted-foreground/70">
        <span className="inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-yellow-500/70" />
        Checking repository…
      </p>
    );
  }

  if (repoStatus === "private") {
    return (
      <p className="flex items-center gap-1.5 text-[11px] text-red-400/80">
        Repo exists but is private
      </p>
    );
  }

  if (repoStatus === "not-found") {
    return (
      <p className="flex items-center gap-1.5 text-[11px] text-red-400/80">Repository not found</p>
    );
  }

  if (repoStatus === "error") {
    return (
      <p className="flex items-center gap-1.5 text-[11px] text-amber-400/80">
        Couldn't verify — you can still submit
      </p>
    );
  }

  if (repoStatus === "valid") {
    if (screenshotStatus === "found") {
      return (
        <p className="flex items-center gap-1.5 text-[11px] text-green-400/80">
          Submitting as @{username}
        </p>
      );
    }

    if (screenshotStatus === "missing") {
      return (
        <p className="flex items-center gap-1.5 text-[11px] text-red-400/80">
          No screenshots found
        </p>
      );
    }

    if (screenshotStatus === "error") {
      return (
        <p className="flex items-center gap-1.5 text-[11px] text-amber-400/80">
          Couldn't verify screenshots — you can still submit
        </p>
      );
    }
  }

  return null;
}

function SubmitModal({ onClose }: { onClose: () => void }) {
  const [dotfiles, setDotfiles] = useState("");
  const [tags, setTags] = useState("");

  const parts = dotfiles.startsWith("https://github.com/") ? dotfiles.slice(19).split("/") : null;
  const username = parts?.[0] ?? null;
  const repo = parts?.[1] ?? null;

  const repoStatus = useRepoValidation(username, repo);
  const screenshotStatus = useScreenshotValidation(repoStatus, username, repo);

  useModalBehavior(onClose);

  const canSubmit =
    (repoStatus === "valid" || repoStatus === "not-found" || repoStatus === "error") &&
    screenshotStatus !== "missing";

  function handleSubmit() {
    if (!canSubmit) return;

    const params = new URLSearchParams({
      template: "showcase.yml",
      title: `showcase: ${username!.trim()}`,
      username: username!.trim(),
      dotfiles: dotfiles.trim(),
      ...(tags.trim() ? { tags: tags.trim() } : {}),
    });

    window.open(
      `https://github.com/mangowm/mango-showcase/issues/new?${params.toString()}`,
      "_blank",
    );
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(12px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-t-2xl border border-fd-border/60 bg-fd-background shadow-2xl sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-fd-border/40 px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-fd-foreground">Submit your setup</h2>
            <p className="mt-0.5 text-xs text-fd-muted-foreground">
              Opens a prefilled GitHub issue
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-fd-border/50 text-fd-muted-foreground transition-colors hover:border-fd-border hover:text-fd-foreground"
            aria-label="Close"
          >
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
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-fd-foreground">
              Dotfiles URL <span className="text-fd-primary">*</span>
            </label>
            <input
              autoFocus
              type="url"
              placeholder="https://github.com/your-username/dotfiles"
              value={dotfiles}
              onChange={(e) => setDotfiles(e.target.value)}
              className="w-full rounded-lg border border-fd-border/60 bg-fd-muted/30 px-3 py-2 text-sm text-fd-foreground placeholder:text-fd-muted-foreground/50 outline-none focus:border-fd-border"
            />
            <FieldStatus
              dotfiles={dotfiles}
              repoStatus={repoStatus}
              screenshotStatus={screenshotStatus}
              username={username}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-fd-foreground">
              Tags <span className="ml-1.5 font-normal text-fd-muted-foreground">optional</span>
            </label>
            <input
              type="text"
              placeholder="dark, minimal, CachyOS"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full rounded-lg border border-fd-border/60 bg-fd-muted/30 px-3 py-2 text-sm text-fd-foreground placeholder:text-fd-muted-foreground/50 outline-none focus:border-fd-border"
            />
            <p className="text-[11px] text-fd-muted-foreground/60">Comma-separated</p>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-fd-border/40 px-5 py-4">
          <p className="text-[11px] text-fd-muted-foreground/60">You'll confirm on GitHub</p>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="inline-flex items-center gap-1.5 rounded-lg bg-fd-primary px-4 py-2 text-xs font-semibold text-fd-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-30"
          >
            Open issue
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
          </button>
        </div>
      </div>
    </div>
  );
}

function Showcase() {
  const entries = Route.useLoaderData();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set());
  const [screenshotIndex, setScreenshotIndex] = useState(0);
  const [submitOpen, setSubmitOpen] = useState(false);

  const allTags = useMemo(
    () =>
      Array.from(new Set(entries.flatMap((e) => e.tags ?? [])))
        .filter(Boolean)
        .sort(),
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
      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }
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
              <TagFilter
                allTags={allTags}
                activeTags={activeTags}
                entries={entries}
                filteredCount={filteredEntries.length}
                onToggle={toggleTag}
                onClear={() => setActiveTags(new Set())}
              />
            )}
          </div>

          <button
            onClick={() => setSubmitOpen(true)}
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
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v8M8 12h8" />
            </svg>
            Submit your setup
          </button>
        </div>

        <div className="mb-8 h-px w-full bg-gradient-to-r from-transparent via-fd-border to-transparent" />

        {/* Grid */}
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredEntries.map((entry, i) => (
            <ShowcaseCard key={entry.username} entry={entry} onOpen={() => setLightboxIndex(i)} />
          ))}
        </div>

        {filteredEntries.length === 0 && (
          <div className="py-24 text-center text-fd-muted-foreground text-sm">
            No setups match this filter.
          </div>
        )}
      </div>

      {submitOpen && <SubmitModal onClose={() => setSubmitOpen(false)} />}

      {lightboxIndex !== null && (
        <Lightbox
          entries={filteredEntries}
          index={lightboxIndex}
          screenshotIndex={screenshotIndex}
          setScreenshotIndex={setScreenshotIndex}
          onClose={closeLightbox}
          onPrev={prevLightbox}
          onNext={nextLightbox}
        />
      )}
    </div>
  );
}
