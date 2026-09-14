import { useState, useEffect, useRef } from "react";
import { exists, readDir, copyFile, mkdir, BaseDirectory } from "@tauri-apps/plugin-fs";
import { join } from "@tauri-apps/api/path";
import { AlertCircle, ArrowRight, Check, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { completeOnboarding } from "@/lib/onboarding";
import { updateSettings } from "@/lib/settings";
import { uploadConfigFromDir } from "@/lib/config-file";
import { useConfigStore } from "@/lib/config-store";
import mangowmLogo from "@/assets/mangowm-logo.svg";

const BASE = ".config/mango";
const BD = BaseDirectory.Home;

async function copyRecursive(rel: string, dstRoot: string) {
  const src = rel ? await join(BASE, rel) : BASE;
  const entries = await readDir(src, { baseDir: BD });

  for (const entry of entries) {
    const childRel = rel ? await join(rel, entry.name) : entry.name;
    const childSrc = await join(BASE, childRel);
    const childDst = await join(dstRoot, childRel);

    if (entry.name === "backups") continue;

    if (entry.isDirectory) {
      await mkdir(childDst, { baseDir: BD, recursive: true });
      await copyRecursive(childRel, dstRoot);
    } else {
      await copyFile(childSrc, childDst, {
        fromPathBaseDir: BD,
        toPathBaseDir: BD,
      });
    }
  }
}

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
    (async () => {
      const splash = new Promise((r) => setTimeout(r, 800));
      try {
        const [dirExists] = await Promise.all([exists(BASE, { baseDir: BD }), splash]);
        setMode("tauri");
        setStatus(dirExists ? "ready" : "welcome");
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
      const files = await uploadConfigFromDir(Array.from(fileList));
      if (files.length === 0) {
        setError("No .conf files found in selected folder.");
        setStatus("welcome");
        return;
      }
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
      const now = new Date();
      const ts = (n: number) => n.toString().padStart(2, "0");
      const timestamp = `${now.getFullYear()}-${ts(now.getMonth() + 1)}-${ts(now.getDate())}_${ts(now.getHours())}${ts(now.getMinutes())}${ts(now.getSeconds())}`;
      const dstRoot = `.config/mango/backups/${timestamp}`;

      await mkdir(dstRoot, { baseDir: BD, recursive: true });
      await copyRecursive("", dstRoot);
      await updateSettings({
        backup: { createdAt: new Date().toISOString(), path: dstRoot },
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
      <main className="dark min-h-screen bg-background text-foreground flex items-center justify-center p-8 antialiased selection:bg-primary selection:text-primary-foreground">
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
            <div className="flex items-center gap-3 text-muted-foreground justify-center">
              <Loader2 className="size-4 animate-spin" />
              <span className="text-sm">Verifying environment...</span>
            </div>
          )}

          {status === "uploading" && (
            <div className="flex items-center gap-3 text-muted-foreground justify-center">
              <Loader2 className="size-4 animate-spin" />
              <span className="text-sm">Importing config files...</span>
            </div>
          )}

          {status === "welcome" && (
            <>
              {error && (
                <div className="flex items-center gap-2 text-sm text-destructive justify-center mb-4">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  className="flex flex-col gap-3 rounded-xl bg-card p-5 text-left ring-1 ring-foreground/10 hover:ring-primary/50 transition-all cursor-pointer"
                  onClick={handleStartFresh}
                >
                  <span className="text-sm font-medium">Start Fresh</span>
                  <span className="text-sm text-muted-foreground">Default configuration</span>
                  <span className="self-end text-muted-foreground">
                    <ArrowRight className="size-5" />
                  </span>
                </button>
                <button
                  className="flex flex-col gap-3 rounded-xl bg-card p-5 text-left ring-1 ring-foreground/10 hover:ring-primary/50 transition-all cursor-pointer"
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
    <main className="dark min-h-screen bg-background text-foreground flex items-center justify-center p-8 antialiased selection:bg-primary selection:text-primary-foreground">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        /* @ts-ignore */
        webkitdirectory=""
        onChange={handleFileSelected}
      />
      <div className="w-full max-w-sm flex flex-col">
        <header className="flex items-center gap-4 mb-8">
          <img
            src={mangowmLogo}
            alt="mangowm"
            className="size-12 opacity-90 animate-in fade-in zoom-in-95 duration-500"
          />
          <div className="animate-in fade-in slide-in-from-left-2 duration-500">
            <h1 className="text-xl font-medium tracking-tight">mangowm settings</h1>
            <p className="text-sm text-muted-foreground">Initial Setup</p>
          </div>
        </header>

        <section className="flex flex-col justify-center min-h-[140px]">
          {status === "checking" && (
            <div className="flex items-center gap-3 text-muted-foreground animate-in fade-in">
              <Loader2 className="size-4 animate-spin" />
              <span className="text-sm">Verifying environment...</span>
            </div>
          )}

          {status === "uploading" && (
            <div className="flex items-center gap-3 text-muted-foreground animate-in fade-in">
              <Loader2 className="size-4 animate-spin" />
              <span className="text-sm">Importing config files...</span>
            </div>
          )}

          {status === "welcome" && (
            <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-right-4 duration-500">
              <p className="text-sm text-muted-foreground leading-relaxed">
                No existing configuration found. We will start with a fresh default environment.
              </p>
            </div>
          )}

          {status === "ready" && (
            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-500">
              <p className="text-sm text-muted-foreground leading-relaxed">
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
            <div className="flex items-center gap-3 text-muted-foreground animate-in fade-in">
              <Loader2 className="size-4 animate-spin" />
              <span className="text-sm">Creating backup...</span>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center gap-2.5 text-emerald-500">
                <Check className="size-5" />
                <span className="font-medium">Backup Complete</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your previous configuration has been safely archived.
              </p>
            </div>
          )}
        </section>

        <footer className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-border/40">
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
