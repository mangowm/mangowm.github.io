import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Streamdown } from "streamdown";
import { code } from "@streamdown/code";
import releases from "../releases.json";
import { createTitle } from "@/lib/site";

export const Route = createFileRoute("/releases")({
  head: () => ({
    meta: [
      { title: createTitle("Releases") },
      { property: "og:image", content: "/og/releases/image.webp" },
    ],
  }),
  component: Releases,
  loader: async () => {
    return releases as GitHubRelease[];
  },
});

interface GitHubRelease {
  id: number;
  tag_name: string;
  name: string;
  body: string;
  prerelease: boolean;
  draft: boolean;
  published_at: string;
  html_url: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function normalizeBody(body: string) {
  return body.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
}

const STREAMDOWN_COMPONENTS = {
  pre: ({ children, className }: any) => (
    <pre
      className={`mb-3 overflow-x-auto rounded-lg border border-fd-border bg-fd-muted/50 px-4 py-3 text-sm ${className ?? ""}`}
    >
      {children}
    </pre>
  ),
  code: ({ children, className }: any) => (
    <code className={`font-mono text-xs text-fd-foreground ${className ?? ""}`}>{children}</code>
  ),
  h1: ({ children, className }: any) => (
    <h1
      className={`mb-3 mt-6 text-base font-bold text-fd-foreground first:mt-0 ${className ?? ""}`}
    >
      {children}
    </h1>
  ),
  h2: ({ children, className }: any) => (
    <h2
      className={`mb-2 mt-5 text-sm font-bold uppercase tracking-wide text-fd-foreground first:mt-0 ${className ?? ""}`}
    >
      {children}
    </h2>
  ),
  h3: ({ children, className }: any) => (
    <h3 className={`mb-2 mt-4 text-sm font-semibold text-fd-foreground ${className ?? ""}`}>
      {children}
    </h3>
  ),
  p: ({ children, className }: any) => (
    <p className={`mb-3 text-sm leading-relaxed text-fd-foreground/80 ${className ?? ""}`}>
      {children}
    </p>
  ),
  ul: ({ children, className }: any) => (
    <ul className={`mb-3 space-y-1 pl-4 ${className ?? ""}`}>{children}</ul>
  ),
  ol: ({ children, className }: any) => (
    <ol className={`mb-3 space-y-1 pl-4 list-decimal ${className ?? ""}`}>{children}</ol>
  ),
  li: ({ children, className }: any) => (
    <li className={`text-sm leading-relaxed text-fd-foreground ${className ?? ""}`}>{children}</li>
  ),
  a: ({ href, children, className }: any) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`text-fd-primary underline underline-offset-2 hover:opacity-80 ${className ?? ""}`}
    >
      {children}
    </a>
  ),
  blockquote: ({ children, className }: any) => (
    <blockquote
      className={`mb-3 border-l-2 border-fd-primary/40 pl-3 text-sm italic text-fd-foreground/70 ${className ?? ""}`}
    >
      {children}
    </blockquote>
  ),
} as const;

function ReleaseCard({
  release,
  index,
  total,
}: {
  release: GitHubRelease;
  index: number;
  total: number;
}) {
  const isLatest = index === 0 && !release.prerelease;
  const body = useMemo(() => (release.body ? normalizeBody(release.body) : null), [release.body]);

  return (
    <div className="relative flex gap-8 sm:gap-12">
      <div className="flex flex-col items-center">
        <div
          className={`relative z-10 mt-1 h-3 w-3 shrink-0 rounded-full border-2 ${isLatest ? "border-fd-primary bg-fd-primary" : "border-fd-border bg-fd-background"}`}
        />
        {index < total - 1 && <div className="mt-1 w-px flex-1 bg-fd-border" />}
      </div>

      <div className="mb-12 flex-1 pb-2">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span className="font-mono text-xl font-bold text-fd-foreground sm:text-2xl">
            {release.tag_name}
          </span>
          {isLatest && (
            <span className="inline-flex items-center gap-1 rounded-full border border-fd-primary/30 bg-fd-primary/10 px-2.5 py-0.5 text-xs font-semibold text-fd-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-fd-primary" />
              Latest
            </span>
          )}
          {release.prerelease && (
            <span className="inline-flex items-center rounded-full border border-fd-border bg-fd-muted/40 px-2.5 py-0.5 text-xs font-medium text-fd-muted-foreground">
              Pre-release
            </span>
          )}
          <span className="ml-auto text-xs text-fd-foreground/60">
            {formatDate(release.published_at)}
          </span>
        </div>

        {release.name && release.name !== release.tag_name && (
          <p className="mb-3 text-sm font-medium text-fd-foreground">{release.name}</p>
        )}

        <div className="rounded-lg border border-fd-border bg-fd-muted/20 px-5 py-4">
          {body ? (
            <Streamdown mode="static" plugins={{ code }} components={STREAMDOWN_COMPONENTS}>
              {body}
            </Streamdown>
          ) : (
            <p className="text-sm italic text-fd-muted-foreground">No release notes provided.</p>
          )}
        </div>

        <div className="mt-3">
          <a
            href={release.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-fd-foreground/60 transition-colors hover:text-fd-foreground"
          >
            View on GitHub
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
              <path d="M7 7h10v10M7 17 17 7" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}

function ReleaseSkeleton() {
  return (
    <div className="flex gap-8 sm:gap-12">
      <div className="flex flex-col items-center">
        <div className="mt-1 h-3 w-3 rounded-full bg-fd-border" />
        <div className="mt-1 w-px flex-1 bg-fd-border" />
      </div>
      <div className="mb-12 flex-1 space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-7 w-24 animate-pulse rounded bg-fd-muted" />
          <div className="h-5 w-14 animate-pulse rounded-full bg-fd-muted" />
          <div className="ml-auto h-4 w-24 animate-pulse rounded bg-fd-muted" />
        </div>
        <div className="h-32 w-full animate-pulse rounded-lg bg-fd-muted/50" />
      </div>
    </div>
  );
}

function Releases() {
  const releases = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-fd-background px-4 py-12 sm:px-6 lg:px-8">
      <Link
        to="/"
        className="fixed left-6 top-6 z-50 inline-flex items-center gap-2 rounded-full border border-fd-border bg-fd-background px-4 py-2 text-sm font-medium text-fd-foreground shadow-md backdrop-blur-md transition-colors hover:text-fd-primary"
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
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
        Back
      </Link>

      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-12">
          <p className="mb-2 font-mono text-xs font-semibold uppercase tracking-widest text-fd-primary">
            Changelog
          </p>
          <h1 className="text-3xl font-bold text-fd-foreground sm:text-4xl">Releases</h1>
          <p className="mt-3 text-fd-muted-foreground">
            All MangoWM releases, from latest stable to earliest builds.
          </p>
        </div>

        <div>
          {releases.map((release, index) => (
            <ReleaseCard key={release.id} release={release} index={index} total={releases.length} />
          ))}
        </div>
      </div>
    </div>
  );
}
