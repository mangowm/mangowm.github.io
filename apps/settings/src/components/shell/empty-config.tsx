import { FilePlus2, FolderOpen, Upload } from "lucide-react";

import { Button } from "@mangowm/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@mangowm/ui/components/empty";
import { useConfigStore } from "@/lib/config/store";

export function EmptyConfig() {
  const createDefault = useConfigStore((state) => state.createDefault);
  const importConfig = useConfigStore((state) => state.importConfig);
  const openConfigFolder = useConfigStore((state) => state.openConfigFolder);
  const isTauri = useConfigStore((state) => state.isTauri);
  const error = useConfigStore((state) => state.error);

  return (
    <Empty className="mx-auto w-full max-w-xl flex-1 py-16">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FilePlus2 />
        </EmptyMedia>
        <EmptyTitle>No configuration found</EmptyTitle>
        <EmptyDescription>
          Create a default mango configuration, or import an existing config folder.
        </EmptyDescription>
      </EmptyHeader>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <EmptyContent>
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
      </EmptyContent>
    </Empty>
  );
}
