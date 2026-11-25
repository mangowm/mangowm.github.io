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
import { parseRepo } from "@/lib/showcase-media";

export function SubmitDialog({ className }: { className?: string }) {
  const [dotfiles, setDotfiles] = useState("");
  const [tags, setTags] = useState("");
  const [invalid, setInvalid] = useState(false);

  const handleSubmit = () => {
    const repo = parseRepo(dotfiles);
    setInvalid(!repo);
    if (!repo) return;

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
              placeholder="https://github.com/<username>/<repo>"
              value={dotfiles}
              onChange={(event) => {
                setDotfiles(event.target.value);
                setInvalid(false);
              }}
            />
            {invalid && <p className="text-[11px] text-destructive">Must be a GitHub repo URL</p>}
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
            disabled={!dotfiles.trim()}
            className="gap-1.5 rounded-full text-xs font-semibold"
          >
            Open issue <ExternalLink size={8} strokeWidth={2.5} />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
