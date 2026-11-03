import { useState, useEffect, useRef } from "react";
import { AlertCircle, ArrowRight, Check, Loader2, Upload } from "lucide-react";
import { Button } from "@mangowm/ui/components/button";
import { completeOnboarding } from "@/lib/onboarding";
import { getHost } from "@/lib/platform";
import { uploadConfigFromDir } from "@/lib/platform/upload";
import { parseConfig } from "@/lib/config/parse";
import { useConfigStore } from "@/lib/config/store";
import mangowmLogo from "@mangowm/assets/logos/mangowm.svg";

interface OnboardingFlowProps {
  onComplete: () => void;
}

type Mode = "browser" | "tauri";
type Status = "checking" | "welcome" | "ready" | "running" | "success" | "uploading";

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [mode, setMode] = useState<Mode | null>(null);
  const [status, setStatus] = useState<Status>("checking");
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void (async () => {
      const splash = new Promise((r) => setTimeout(r, 800));
      try {
        const [hasConfig] = await Promise.all([getHost().hasConfig(), splash]);
        setMode(getHost().kind);
        setStatus(hasConfig ? "ready" : "welcome");
      } catch {
        setMode("browser");
        setStatus("welcome");
      }
    })();
  }, []);

  const handleStartFresh = async () => {
    try {
      await completeOnboarding();
    } catch {}
    onComplete();
  };

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    setStatus("uploading");
    setError("");
    try {
      const raw = await uploadConfigFromDir(Array.from(fileList));
      if (raw.length === 0) {
        setError("No .conf files found in selected folder.");
        setStatus("welcome");
        return;
      }
      const files = raw.map((file) => ({
        ...file,
        lines: parseConfig(file.text).lines,
        original: file.text,
      }));
      useConfigStore.setState({ files, loading: false, error: null });
      useConfigStore.temporal.getState().clear();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to parse config files.");
      setStatus("welcome");
      return;
    }
    try {
      await completeOnboarding();
    } catch {}
    onComplete();
  };

  const startBackup = async () => {
    setStatus("running");
    setError("");

    try {
      const minDelay = new Promise<void>((resolve) => setTimeout(resolve, 600));
      const destination = await getHost().backup?.();
      if (!destination) throw new Error("Backup is not available");

      await getHost().preferences.write({
        backup: { createdAt: new Date().toISOString(), path: destination },
        onboardingCompleted: true,
      });

      await minDelay;
      setStatus("success");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create backup.");
      setStatus("ready");
    }
  };

  const complete = async () => {
    await completeOnboarding();
    onComplete();
  };

  if (mode === "browser") {
    return (
      <main className="dark flex min-h-screen items-center justify-center bg-background p-8 text-foreground antialiased selection:bg-primary selection:text-primary-foreground">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          /* @ts-ignore */
          webkitdirectory=""
          onChange={handleFileSelected}
        />
        <div className="w-full max-w-xl">
          {status === "checking" && (
            <div className="flex items-center justify-center gap-3 text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              <span className="text-sm">Verifying environment...</span>
            </div>
          )}

          {status === "uploading" && (
            <div className="flex items-center justify-center gap-3 text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              <span className="text-sm">Importing config files...</span>
            </div>
          )}

          {status === "welcome" && (
            <>
              {error && (
                <div className="mb-4 flex items-center justify-center gap-2 text-sm text-destructive">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <button
                  className="flex cursor-pointer flex-col gap-3 rounded-xl bg-card p-5 text-left ring-1 ring-foreground/10 transition-all hover:ring-primary/50"
                  onClick={handleStartFresh}
                >
                  <span className="text-sm font-medium">Start Fresh</span>
                  <span className="text-sm text-muted-foreground">Default configuration</span>
                  <span className="self-end text-muted-foreground">
                    <ArrowRight className="size-5" />
                  </span>
                </button>
                <button
                  className="flex cursor-pointer flex-col gap-3 rounded-xl bg-card p-5 text-left ring-1 ring-foreground/10 transition-all hover:ring-primary/50"
                  onClick={handleUploadClick}
                >
                  <span className="text-sm font-medium">Import Folder</span>
                  <span className="text-sm text-muted-foreground">Select ~/.config/mango</span>
                  <span className="self-end text-muted-foreground">
                    <Upload className="size-5" />
                  </span>
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="dark flex min-h-screen items-center justify-center bg-background p-8 text-foreground antialiased selection:bg-primary selection:text-primary-foreground">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        /* @ts-ignore */
        webkitdirectory=""
        onChange={handleFileSelected}
      />
      <div className="flex w-full max-w-sm flex-col">
        <header className="mb-8 flex items-center gap-4">
          <img
            src={mangowmLogo}
            alt="mangowm"
            className="size-12 animate-in opacity-90 duration-500 zoom-in-95 fade-in"
          />
          <div className="animate-in duration-500 fade-in slide-in-from-left-2">
            <h1 className="text-xl font-medium tracking-tight">mangowm settings</h1>
            <p className="text-sm text-muted-foreground">Initial Setup</p>
          </div>
        </header>

        <section className="flex min-h-[140px] flex-col justify-center">
          {status === "checking" && (
            <div className="flex animate-in items-center gap-3 text-muted-foreground fade-in">
              <Loader2 className="size-4 animate-spin" />
              <span className="text-sm">Verifying environment...</span>
            </div>
          )}

          {status === "uploading" && (
            <div className="flex animate-in items-center gap-3 text-muted-foreground fade-in">
              <Loader2 className="size-4 animate-spin" />
              <span className="text-sm">Importing config files...</span>
            </div>
          )}

          {status === "welcome" && (
            <div className="flex animate-in flex-col gap-3 duration-500 fade-in slide-in-from-right-4">
              <p className="text-sm leading-relaxed text-muted-foreground">
                No existing configuration found. We will start with a fresh default environment.
              </p>
            </div>
          )}

          {status === "ready" && (
            <div className="flex animate-in flex-col gap-4 duration-500 fade-in slide-in-from-right-4">
              <p className="text-sm leading-relaxed text-muted-foreground">
                An existing configuration was detected. Would you like to back it up before applying
                new settings?
              </p>
              {error && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          )}

          {status === "running" && (
            <div className="flex animate-in items-center gap-3 text-muted-foreground fade-in">
              <Loader2 className="size-4 animate-spin" />
              <span className="text-sm">Creating backup...</span>
            </div>
          )}

          {status === "success" && (
            <div className="flex animate-in flex-col gap-3 duration-500 fade-in slide-in-from-right-4">
              <div className="flex items-center gap-2.5 text-emerald-500">
                <Check className="size-5" />
                <span className="font-medium">Backup Complete</span>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Your previous configuration has been safely archived.
              </p>
            </div>
          )}
        </section>

        <footer className="mt-6 flex items-center justify-end gap-3 border-t border-border/40 pt-6">
          {status === "checking" || status === "uploading" ? null : status === "running" ? (
            <Button className="w-32 transition-all" disabled>
              <Loader2 className="size-4 animate-spin" />
            </Button>
          ) : status === "welcome" ? (
            <Button className="gap-2" onClick={complete}>
              Start Setup
              <ArrowRight className="size-4" />
            </Button>
          ) : status === "ready" ? (
            <>
              <Button
                variant="ghost"
                className="text-muted-foreground hover:text-foreground"
                onClick={complete}
              >
                Skip
              </Button>
              <Button className="w-32 transition-all" onClick={startBackup}>
                Backup Config
              </Button>
            </>
          ) : status === "success" ? (
            <Button className="gap-2" onClick={complete}>
              Continue
              <ArrowRight className="size-4" />
            </Button>
          ) : null}
        </footer>
      </div>
    </main>
  );
}
