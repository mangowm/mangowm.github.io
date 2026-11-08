import { useState } from "react";
import { ExternalLink, PlusCircle } from "lucide-react";
import { cn } from "cn";
import { Button } from "@mangowm/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@mangowm/ui/components/dialog";
import { Input } from "@mangowm/ui/components/input";
import { Label } from "@mangowm/ui/components/label";
import { parseRepo, submissionProbes } from "@/lib/showcase-media";

type Status =
  | "idle"
  | "checking"
  | "ready"
  | "invalid-url"
  | "not-found"
  | "private"
  | "no-media"
  | "error";

async function checkRepo(owner: string, repo: string): Promise<Status> {
  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
    if (response.status === 404) return "not-found";
    if (!response.ok) return "error";

    const data = (await response.json()) as { private?: boolean };
    if (data.private) return "private";

    for (const probe of submissionProbes()) {
      const listing = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${probe.path}`,
      );
      if (listing.status === 404) continue;
      if (!listing.ok) return "error";

      const files = (await listing.json()) as Array<{ name?: string; type?: string }>;
      const found = files.some(
        (file) => file.type === "file" && typeof file.name === "string" && probe.matches(file.name),
      );
      if (found) return "ready";
    }
    return "no-media";
  } catch {
    return "error";
  }
}

function FieldStatus({ status, username }: { status: Status; username: string | null }) {
  if (status === "checking") {
    return (
      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-warning" />
        Checking…
      </p>
    );
  }
  if (status === "invalid-url") {
    return <p className="text-[11px] text-destructive">Must be a GitHub URL</p>;
  }
  if (status === "not-found") {
    return <p className="text-[11px] text-destructive">Repository not found</p>;
  }
  if (status === "private") {
    return <p className="text-[11px] text-destructive">Repo is private</p>;
  }
  if (status === "no-media") {
    return <p className="text-[11px] text-destructive">No showcase/ media found in repo</p>;
  }
  if (status === "error") {
    return <p className="text-[11px] text-warning">Can&apos;t verify — you can still submit</p>;
  }
  if (status === "ready") {
    return <p className="text-[11px] text-success">Ready · submitting as @{username}</p>;
  }
  return null;
}

export function SubmitDialog({ className }: { className?: string }) {
  const [dotfiles, setDotfiles] = useState("");
  const [tags, setTags] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const repo = parseRepo(dotfiles);

  const handleSubmit = async () => {
    if (!repo) {
      setStatus("invalid-url");
      return;
    }

    setStatus("checking");
    const result = await checkRepo(repo.owner, repo.repo);
    setStatus(result);
    if (result !== "ready" && result !== "error") return;

    const params = new URLSearchParams({
      template: "showcase.yml",
      title: `showcase: ${repo.owner}`,
      username: repo.owner,
      dotfiles: dotfiles.trim(),
      ...(tags.trim() ? { tags: tags.trim() } : {}),
    });
    window.open(
      `https://github.com/mangowm/mango-showcase/issues/new?${params.toString()}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            className={cn("gap-2 rounded-full bg-card font-medium hover:bg-accent", className)}
          />
        }
      >
        <PlusCircle size={14} /> Submit your setup
      </DialogTrigger>

      <DialogContent className="sm:max-w-[27rem]">
        <DialogHeader className="px-5 pt-5">
          <DialogTitle>Submit your setup</DialogTitle>
          <DialogDescription>Opens a prefilled GitHub issue.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-5 py-5">
          <div className="space-y-1.5">
            <Label htmlFor="showcase-dotfiles" className="text-xs">
              Dotfiles URL <span className="text-primary-text">*</span>
            </Label>
            <Input
              id="showcase-dotfiles"
              type="url"
              placeholder="https://github.com/your-username/dotfiles"
              value={dotfiles}
              onChange={(event) => {
                setDotfiles(event.target.value);
                setStatus("idle");
              }}
            />
            <FieldStatus status={status} username={repo?.owner ?? null} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="showcase-tags" className="text-xs">
              Tags <span className="font-normal text-muted-foreground">optional</span>
            </Label>
            <Input
              id="showcase-tags"
              type="text"
              placeholder="dark, minimal, CachyOS"
              value={tags}
              onChange={(event) => setTags(event.target.value)}
            />
            <p className="text-[11px] text-muted-foreground">Comma-separated</p>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border px-5 py-4">
          <p className="text-[11px] text-muted-foreground">You&apos;ll confirm on GitHub</p>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!dotfiles.trim() || status === "checking"}
            className="gap-1.5 rounded-full text-xs font-semibold"
          >
            Open issue <ExternalLink size={8} strokeWidth={2.5} />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
