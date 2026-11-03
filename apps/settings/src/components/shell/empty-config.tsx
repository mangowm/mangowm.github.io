import { FilePlus2, FolderOpen, Upload } from "lucide-react";

import { Button } from "@mangowm/ui/components/button";
import { useConfigStore } from "@/lib/config/store";

export function EmptyConfig() {
  const createDefault = useConfigStore((state) => state.createDefault);
  const importConfig = useConfigStore((state) => state.importConfig);
  const openConfigFolder = useConfigStore((state) => state.openConfigFolder);
  const isTauri = useConfigStore((state) => state.isTauri);
  const error = useConfigStore((state) => state.error);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-6 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full border border-border/50 bg-muted/20 text-muted-foreground/50">
        <FilePlus2 className="size-6" />
      </div>

      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          No configuration found
        </h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          Create a default mango configuration, or import an existing config folder.
        </p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button onClick={() => void createDefault()}>
          <FilePlus2 className="mr-1.5 size-4" />
          Create default config
        </Button>
        <Button variant="secondary" onClick={() => void importConfig()}>
          <Upload className="mr-1.5 size-4" />
          Import folder
        </Button>
        {isTauri && (
          <Button variant="ghost" onClick={() => void openConfigFolder()}>
            <FolderOpen className="mr-1.5 size-4" />
            Open config folder
          </Button>
        )}
      </div>
    </div>
  );
}
