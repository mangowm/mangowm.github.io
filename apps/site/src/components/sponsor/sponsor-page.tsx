import { Check, Copy, Image as ImageIcon } from "lucide-react";
import { cn } from "cn";
import { toast } from "@mangowm/ui/components/toast";
import { DISCORD_URL } from "@/constants";
import { SPONSOR } from "./sponsor-data";
import { Sponsors } from "./sponsors";
import { useCopy, type CopyType } from "./use-copy";

const SHORT_ADDRESS = `${SPONSOR.address.slice(0, 10)}…${SPONSOR.address.slice(-8)}`;

export function SponsorPage() {
  const { copied, copy } = useCopy();

  const handleCopy = async (type: CopyType) => {
    try {
      await copy(type);
    } catch (error) {
      console.error("Copy failed:", error);
      toast.add({ type: "error", description: "Couldn't copy. Try again." });
    }
  };

  return (
    <div className="mx-auto w-full max-w-[46rem] px-5 pt-16 pb-20 sm:px-8">
      <p role="status" className="sr-only">
        {copied ? "Copied to clipboard" : ""}
      </p>

      <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
        Sponsor mango
      </h1>
      <section
        aria-label="Donation details"
        className="mt-10 grid gap-8 sm:grid-cols-[minmax(0,180px)_minmax(0,1fr)] sm:items-center sm:gap-8"
      >
        <button
          type="button"
          onClick={() => handleCopy("qr")}
          aria-label="Copy QR code image"
          className="group relative block aspect-square w-full max-w-[220px] cursor-pointer overflow-hidden rounded-lg border border-border bg-white p-2 transition-colors hover:border-primary focus-visible:border-ring sm:max-w-none"
        >
          <img
            src={SPONSOR.qrSrc}
            alt={`${SPONSOR.network} donation QR code`}
            className="h-full w-full rounded-[4px] object-contain"
          />
          <span
            className={cn(
              "absolute inset-0 flex flex-col items-center justify-center gap-1.5 rounded-lg bg-background/90 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100",
              copied === "qr" && "opacity-100",
            )}
          >
            {copied === "qr" ? (
              <Check className="size-6 text-success" />
            ) : (
              <ImageIcon className="size-5 text-foreground" />
            )}
            <span className="text-xs font-semibold text-foreground">
              {copied === "qr" ? "Copied" : "Copy image"}
            </span>
          </span>
        </button>

        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-foreground">Wallet address</h2>

          <div className="mt-2 flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-2.5">
            <code className="min-w-0 flex-1 font-mono text-[0.8125rem] font-medium whitespace-nowrap text-foreground">
              <span className="sm:hidden">{SHORT_ADDRESS}</span>
              <span className="hidden sm:inline">{SPONSOR.address}</span>
            </code>
            <button
              type="button"
              onClick={() => handleCopy("address")}
              aria-label="Copy wallet address"
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full border border-transparent px-2 py-1 text-xs font-semibold transition-colors focus-visible:border-ring",
                copied === "address"
                  ? "text-success"
                  : "text-muted-foreground hover:bg-card hover:text-foreground",
              )}
            >
              {copied === "address" ? (
                <Check className="size-3.5" />
              ) : (
                <Copy className="size-3.5" />
              )}
              {copied === "address" ? "Copied" : "Copy"}
            </button>
          </div>

          <p className="mt-2 text-xs font-medium text-muted-foreground">{SPONSOR.network} only</p>

          <p className="mt-3 text-xs text-muted-foreground">
            Questions about donating? Ask in{" "}
            <a
              href={DISCORD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground focus-visible:text-foreground focus-visible:decoration-foreground"
            >
              Discord
            </a>
            .
          </p>
        </div>
      </section>

      <section className="mt-12 border-t border-border pt-8">
        <h2 className="text-sm font-semibold text-foreground">Sponsors</h2>
        <Sponsors className="mt-5" />
      </section>
    </div>
  );
}
