import { useState, useEffect } from "react";
import {
  exists,
  readDir,
  copyFile,
  mkdir,
  writeTextFile,
  BaseDirectory,
} from "@tauri-apps/plugin-fs";
import { join } from "@tauri-apps/api/path";

function App() {
  const [backupDone, setBackupDone] = useState<boolean | null>(null);
  const [backupRunning, setBackupRunning] = useState(false);
  const [mangoDirExists, setMangoDirExists] = useState(false);
  const [backupError, setBackupError] = useState("");

  async function copyRecursive(rel: string) {
    const srcRel = rel ? await join(".config/mango", rel) : ".config/mango";
    const entries = await readDir(srcRel, { baseDir: BaseDirectory.Home });
    for (const entry of entries) {
      if (entry.name === "backup") continue;
      const childRel = rel ? await join(rel, entry.name) : entry.name;
      const childSrc = await join(".config/mango", childRel);
      const childDst = await join(".config/mango/backup", childRel);
      if (entry.isDirectory) {
        await mkdir(childDst, { baseDir: BaseDirectory.Home, recursive: true });
        await copyRecursive(childRel);
      } else {
        await copyFile(childSrc, childDst, {
          fromPathBaseDir: BaseDirectory.Home,
          toPathBaseDir: BaseDirectory.Home,
        });
      }
    }
  }

  async function startBackup() {
    setBackupRunning(true);
    setBackupError("");
    try {
      await mkdir(".config/mango/backup", { baseDir: BaseDirectory.Home, recursive: true });
      await copyRecursive("");
      const settings = {
        backup: { createdAt: new Date().toISOString() },
      };
      await writeTextFile(".config/mango/.settings", JSON.stringify(settings, null, 2), {
        baseDir: BaseDirectory.Home,
      });
      setBackupDone(true);
    } catch (e) {
      setBackupError(e instanceof Error ? e.message : String(e));
    } finally {
      setBackupRunning(false);
    }
  }

  useEffect(() => {
    async function init() {
      try {
        const dirExists = await exists(".config/mango", { baseDir: BaseDirectory.Home });
        setMangoDirExists(dirExists);
        if (dirExists) {
          const done = await exists(".config/mango/.settings", { baseDir: BaseDirectory.Home });
          setBackupDone(done);
        } else {
          setBackupDone(false);
        }
      } catch {
        setBackupDone(false);
      }
    }
    init();
  }, []);

  return (
    <main>
      <h1>Mango Settings</h1>

      <section>
        <h2>Backup</h2>
        {backupError && <p style={{ color: "red" }}>Error: {backupError}</p>}
        {backupDone === null ? (
          <p>Checking...</p>
        ) : backupDone ? (
          <p style={{ color: "green" }}>Backup already completed.</p>
        ) : !mangoDirExists ? (
          <p style={{ color: "gray" }}>Nothing to back up — config directory does not exist yet.</p>
        ) : (
          <div>
            <p>Create a backup of your current config before making changes.</p>
            <button onClick={startBackup} disabled={backupRunning}>
              {backupRunning ? "Backing up..." : "Start Backup"}
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

export default App;
