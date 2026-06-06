import { useState, useEffect, useCallback } from "react";
import { exists, readDir, copyFile, mkdir, BaseDirectory } from "@tauri-apps/plugin-fs";
import { join } from "@tauri-apps/api/path";
import { AlertCircle, ArrowRight, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { completeOnboarding } from "@/lib/onboarding";
import { updateSettings } from "@/lib/settings";
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

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [isInitializing, setIsInitializing] = useState(true);
  const [status, setStatus] = useState<"checking" | "none" | "ready" | "running" | "success">(
    "checking",
  );
  const [error, setError] = useState("");

  useEffect(() => {
    // Keep splash incredibly brief, just enough to prevent a jarring flash
    const minSplashTime = new Promise((resolve) => setTimeout(resolve, 800));
    const checkDir = async () => {
      try {
        const dirExists = await exists(BASE, { baseDir: BD });
        return dirExists ? "ready" : "none";
      } catch {
        return "ready";
      }
    };

    Promise.all([minSplashTime, checkDir()]).then(([_, dirStatus]) => {
      setStatus(dirStatus as any);
      setIsInitializing(false);
    });
  }, []);

  const startBackup = useCallback(async () => {
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
  }, []);

  const handleFinish = async () => {
    await completeOnboarding();
    onComplete();
  };

  return (
    <main className="dark min-h-screen bg-background text-foreground flex items-center justify-center p-8 antialiased selection:bg-primary selection:text-primary-foreground">
      <div className="w-full max-w-sm flex flex-col">
        {/* Branding Header */}
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

        {/* Dynamic Content Section */}
        <section className="flex flex-col justify-center min-h-[140px]">
          {isInitializing ? (
            <div className="flex items-center gap-3 text-muted-foreground animate-in fade-in">
              <Loader2 className="size-4 animate-spin" />
              <span className="text-sm">Verifying environment...</span>
            </div>
          ) : status === "none" ? (
            <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-right-4 duration-500">
              <p className="text-sm text-muted-foreground leading-relaxed">
                No existing configuration found. We will start with a fresh default environment.
              </p>
            </div>
          ) : status === "success" ? (
            <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center gap-2.5 text-emerald-500">
                <Check className="size-5" />
                <span className="font-medium">Backup Complete</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your previous configuration has been safely archived.
              </p>
            </div>
          ) : (
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
        </section>

        {/* Actions Footer */}
        <footer className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-border/40">
          {!isInitializing && (
            <>
              {status === "none" && (
                <Button className="gap-2" onClick={handleFinish}>
                  Start Setup
                  <ArrowRight className="size-4" />
                </Button>
              )}

              {(status === "ready" || status === "running") && (
                <>
                  <Button
                    variant="ghost"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={handleFinish}
                    disabled={status === "running"}
                  >
                    Skip
                  </Button>
                  <Button
                    className="w-32 transition-all"
                    onClick={startBackup}
                    disabled={status === "running"}
                  >
                    {status === "running" ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      "Backup Config"
                    )}
                  </Button>
                </>
              )}

              {status === "success" && (
                <Button className="gap-2" onClick={handleFinish}>
                  Continue
                  <ArrowRight className="size-4" />
                </Button>
              )}
            </>
          )}
        </footer>
      </div>
    </main>
  );
}
