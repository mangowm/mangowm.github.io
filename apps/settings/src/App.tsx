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
      await copyFile(childSrc, childDst, { fromPathBaseDir: BD, toPathBaseDir: BD });
    }
  }
}

export default function App() {
  const [status, setStatus] = useState<
    "checking" | "none" | "ready" | "running" | "exists" | "success"
  >("checking");
  const [error, setError] = useState("");

  useEffect(() => {
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
  }, []);

  const startBackup = useCallback(async () => {
    setStatus("running");
    setError("");
    try {
      await mkdir(BACKUP, { baseDir: BD, recursive: true });
      await copyRecursive("");
      await writeTextFile(
        SETTINGS,
        JSON.stringify({ backup: { createdAt: new Date().toISOString() } }, null, 2),
        { baseDir: BD },
      );
      setStatus("success");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setStatus("ready");
    }
  }, []);

  return (
    <main>
      <h1>Mango Settings</h1>
      <section>
        <h2>Backup</h2>
        {error && <p style={{ color: "red" }}>Error: {error}</p>}
        {
          {
            checking: <p>Checking...</p>,
            none: <p>No config directory found — nothing to back up.</p>,
            ready: (
              <>
                <p>Back up your config before making changes.</p>
                <Button onClick={startBackup}>Start Backup</Button>
              </>
            ),
            running: <p>Backing up...</p>,
            exists: (
              <>
                <p>A backup already exists.</p>
                <Button onClick={startBackup}>Overwrite Backup</Button>
              </>
            ),
            success: (
              <>
                <p>Backup complete.</p>
                <Button onClick={startBackup}>Back Up Again</Button>
              </>
            ),
          }[status]
        }
      </section>
    </main>
  );
}
