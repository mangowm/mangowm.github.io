import { useState, useEffect, useCallback } from "react";
import {
  exists,
  readDir,
  copyFile,
  mkdir,
  writeTextFile,
  BaseDirectory,
} from "@tauri-apps/plugin-fs";
import { join } from "@tauri-apps/api/path";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SettingsPage } from "@/components/settings-page";
import "./index.css";
import mangowmLogo from "@/assets/mangowm-logo.svg";

const BASE = ".config/mango";
const BACKUP = ".config/mango/backup";
const SETTINGS = ".config/mango/.settings";
const BD = BaseDirectory.Home;

async function copyRecursive(rel: string) {
  const src = rel ? await join(BASE, rel) : BASE;
  const entries = await readDir(src, { baseDir: BD });

  for (const entry of entries) {
    if (entry.name === "backup") continue;
    const childRel = rel ? await join(rel, entry.name) : entry.name;
    const childSrc = await join(BASE, childRel);
    const childDst = await join(BACKUP, childRel);

    if (entry.isDirectory) {
      await mkdir(childDst, { baseDir: BD, recursive: true });
      await copyRecursive(childRel);
    } else {
      await copyFile(childSrc, childDst, {
        fromPathBaseDir: BD,
        toPathBaseDir: BD,
      });
    }
  }
}

export default function App() {
  const [step, setStep] = useState<"welcome" | "backup" | "settings">("welcome");
  const [status, setStatus] = useState<
    "checking" | "none" | "ready" | "running" | "running-overwrite" | "exists" | "success"
  >("checking");
  const [error, setError] = useState("");

  useEffect(() => {
    const splash = setTimeout(() => setStep("backup"), 2000);
    (async () => {
      try {
        const dirExists = await exists(BASE, { baseDir: BD });
        if (!dirExists) return setStatus("none");

        const backupExists = await exists(BACKUP, { baseDir: BD });
        setStatus(backupExists ? "exists" : "ready");
      } catch {
        setStatus("ready");
      }
    })();
    return () => clearTimeout(splash);
  }, []);

  const startBackup = useCallback(async (isOverwrite = false) => {
    setStatus(isOverwrite ? "running-overwrite" : "running");
    setError("");

    try {
      const minDelay = new Promise<void>((resolve) => setTimeout(resolve, 600));

      await mkdir(BACKUP, { baseDir: BD, recursive: true });
      await copyRecursive("");
      await writeTextFile(
        SETTINGS,
        JSON.stringify({ backup: { createdAt: new Date().toISOString() } }, null, 2),
        { baseDir: BD },
      );

      await minDelay;
      setStatus("success");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setStatus(isOverwrite ? "exists" : "ready");
    }
  }, []);

  return (
    <>
      {step === "welcome" || step === "backup" ? (
        <main className="dark min-h-screen bg-background text-foreground flex items-center justify-center p-6 selection:bg-primary selection:text-primary-foreground">
          <div className="w-full max-w-lg">
            {step === "welcome" && (
              <div className="flex items-center justify-center gap-5">
                <img
                  src={mangowmLogo}
                  alt="mangowm logo"
                  className="size-16 animate-in fade-in zoom-in duration-500 fill-mode-both"
                />
                <h1 className="text-5xl font-semibold tracking-tight text-foreground animate-in fade-in slide-in-from-left-2 duration-500 delay-150 fill-mode-both">
                  mangowm
                </h1>
              </div>
            )}

            {step === "backup" && (
              <Card className="p-8 border-border bg-card/50 backdrop-blur-sm animate-in slide-in-from-bottom-4 fade-in duration-500 shadow-2xl">
                <div className="flex flex-col items-center text-center space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-xl font-medium tracking-tight">Secure Configuration</h2>
                    <p className="text-sm text-muted-foreground max-w-sm">
                      Create a restoration point for your existing environment before modifying core
                      parameters.
                    </p>
                  </div>

                  {error && (
                    <div className="p-3 w-full border border-destructive/50 bg-destructive/10 text-destructive text-sm rounded-md animate-in fade-in">
                      {error}
                    </div>
                  )}

                  <div className="w-full pt-4 min-h-[40px] flex items-center justify-center">
                    {
                      {
                        checking: (
                          <Button disabled className="w-full" variant="outline">
                            Verifying Environment...
                          </Button>
                        ),
                        none: (
                          <Button className="w-full" onClick={() => setStep("settings")}>
                            No Config Found — Continue
                          </Button>
                        ),
                        ready: (
                          <Button className="w-full" onClick={() => startBackup(false)}>
                            Create Backup
                          </Button>
                        ),
                        running: (
                          <Button disabled className="w-full">
                            <span className="animate-pulse">Securing Backup...</span>
                          </Button>
                        ),
                        exists: (
                          <div className="flex gap-3 w-full">
                            <Button
                              variant="secondary"
                              className="flex-1"
                              onClick={() => setStep("settings")}
                            >
                              Skip
                            </Button>
                            <Button className="flex-1" onClick={() => startBackup(true)}>
                              Overwrite
                            </Button>
                          </div>
                        ),
                        "running-overwrite": (
                          <div className="flex gap-3 w-full">
                            <Button disabled variant="secondary" className="flex-1">
                              Skip
                            </Button>
                            <Button disabled className="flex-1">
                              <span className="animate-pulse">Overwriting...</span>
                            </Button>
                          </div>
                        ),
                        success: (
                          <Button
                            className="w-full bg-green-900/20 text-green-500 border-green-900/50 border hover:bg-green-900/30 hover:text-green-400"
                            variant="outline"
                            onClick={() => setStep("settings")}
                          >
                            Continue to Settings
                          </Button>
                        ),
                      }[status]
                    }
                  </div>
                </div>
              </Card>
            )}
          </div>
        </main>
      ) : (
        <TooltipProvider>
          <div className="dark bg-background text-foreground min-h-screen selection:bg-primary selection:text-primary-foreground">
            <SettingsPage />
          </div>
        </TooltipProvider>
      )}
    </>
  );
}
