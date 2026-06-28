import { useEffect, useState } from "react";
import { ExternalLink, X } from "lucide-react";

type RepoStatus = "idle" | "checking" | "valid" | "private" | "not-found" | "error";
type ScreenshotStatus = "idle" | "checking" | "found" | "missing" | "error";

function useRepoValidation(username: string | null, repo: string | null): RepoStatus {
  const [status, setStatus] = useState<RepoStatus>("idle");
  useEffect(() => {
    if (!username || !repo) { setStatus("idle"); return; }
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      setStatus("checking");
      try {
        const res = await fetch(`https://api.github.com/repos/${username}/${repo}`, { signal: ctrl.signal });
        if (res.status === 404) setStatus("not-found");
        else if (res.ok) { const d = await res.json(); setStatus(d.private ? "private" : "valid"); }
        else setStatus("error");
      } catch { if (!ctrl.signal.aborted) setStatus("error"); }
    }, 500);
    return () => { clearTimeout(timer); ctrl.abort(); };
  }, [username, repo]);
  return status;
}

function useScreenshotValidation(repoStatus: RepoStatus, username: string | null, repo: string | null): ScreenshotStatus {
  const [status, setStatus] = useState<ScreenshotStatus>("idle");
  useEffect(() => {
    if (repoStatus !== "valid" || !username || !repo) { setStatus("idle"); return; }
    const ctrl = new AbortController();
    async function check() {
      setStatus("checking");
      try {
        const r1 = await fetch(`https://api.github.com/repos/${username}/${repo}/contents/screenshot.png`, { signal: ctrl.signal });
        if (r1.ok) { setStatus("found"); return; }
        if (r1.status === 404) {
          const r2 = await fetch(`https://api.github.com/repos/${username}/${repo}/contents/screenshots`, { signal: ctrl.signal });
          if (r2.ok) {
            const files = (await r2.json()) as { name: string }[];
            setStatus(files.some((f) => f.name === "1.png") ? "found" : "missing");
          } else if (r2.status === 404) setStatus("missing");
          else setStatus("error");
        } else setStatus("error");
      } catch { if (!ctrl.signal.aborted) setStatus("error"); }
    }
    check();
    return () => ctrl.abort();
  }, [repoStatus, username, repo]);
  return status;
}

function FieldStatus({
  dotfiles, repoStatus, screenshotStatus, username,
}: { dotfiles: string; repoStatus: RepoStatus; screenshotStatus: ScreenshotStatus; username: string | null; }) {
  if (dotfiles.length > 0 && !dotfiles.startsWith("https://github.com/"))
    return <p className="text-[11px] text-red-400/80">Must be a GitHub URL</p>;
  if (repoStatus === "checking")
    return <p className="flex items-center gap-1.5 text-[11px] text-fd-muted-foreground/60"><span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400/70" />Checking…</p>;
  if (repoStatus === "private")
    return <p className="text-[11px] text-red-400/80">Repo is private</p>;
  if (repoStatus === "not-found")
    return <p className="text-[11px] text-red-400/80">Repository not found</p>;
  if (repoStatus === "error")
    return <p className="text-[11px] text-amber-400/70">Can't verify — you can still submit</p>;
  if (repoStatus === "valid") {
    if (screenshotStatus === "found")
      return <p className="text-[11px] text-green-400/80">Ready · submitting as @{username}</p>;
    if (screenshotStatus === "missing")
      return <p className="text-[11px] text-red-400/80">No screenshots found in repo</p>;
    if (screenshotStatus === "error")
      return <p className="text-[11px] text-amber-400/70">Screenshots unverified — you can still submit</p>;
  }
  return null;
}

export function SubmitDialog({ onClose }: { onClose: () => void }) {
  const [dotfiles, setDotfiles] = useState("");
  const [tags, setTags] = useState("");

  const parts = dotfiles.startsWith("https://github.com/") ? dotfiles.slice(19).split("/") : null;
  const username = parts?.[0] ?? null;
  const repo = parts?.[1] ?? null;

  const repoStatus = useRepoValidation(username, repo);
  const screenshotStatus = useScreenshotValidation(repoStatus, username, repo);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

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
    window.open(`https://github.com/mangowm/mango-showcase/issues/new?${params.toString()}`, "_blank");
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(12px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-sm rounded-t-2xl border border-fd-border/60 bg-fd-background shadow-2xl sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-fd-border/40 px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-fd-foreground">Submit your setup</h2>
            <p className="mt-0.5 text-xs text-fd-muted-foreground/55">Opens a prefilled GitHub issue</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-fd-border/40 text-fd-muted-foreground/60 transition-colors hover:border-fd-border hover:text-fd-foreground"
            aria-label="Close"
          >
            <X size={11} strokeWidth={2.5} />
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
              className="w-full rounded-lg border border-fd-border/60 bg-fd-muted/30 px-3 py-2 text-sm text-fd-foreground placeholder:text-fd-muted-foreground/35 outline-none focus:border-fd-border"
            />
            <FieldStatus dotfiles={dotfiles} repoStatus={repoStatus} screenshotStatus={screenshotStatus} username={username} />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-fd-foreground">
              Tags <span className="ml-1 font-normal text-fd-muted-foreground/50">optional</span>
            </label>
            <input
              type="text"
              placeholder="dark, minimal, CachyOS"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full rounded-lg border border-fd-border/60 bg-fd-muted/30 px-3 py-2 text-sm text-fd-foreground placeholder:text-fd-muted-foreground/35 outline-none focus:border-fd-border"
            />
            <p className="text-[11px] text-fd-muted-foreground/40">Comma-separated</p>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-fd-border/40 px-5 py-4">
          <p className="text-[11px] text-fd-muted-foreground/40">You'll confirm on GitHub</p>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="inline-flex items-center gap-1.5 rounded-lg bg-fd-primary px-4 py-2 text-xs font-semibold text-fd-primary-foreground transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-25"
          >
            Open issue <ExternalLink size={8} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
