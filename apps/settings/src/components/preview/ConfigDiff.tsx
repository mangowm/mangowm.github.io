import { useMemo } from "react";
import { MultiFileDiff } from "@pierre/diffs/react";
import type { FileDiffOptions } from "@pierre/diffs";

import type { ConfigDiffModel } from "@/lib/config/diff";

const DIFF_OPTIONS: FileDiffOptions<undefined, undefined> = {
  diffStyle: "unified",
  disableFileHeader: true,
  overflow: "wrap",
  themeType: "dark",
  theme: "pierre-dark",
};

export interface ConfigDiffProps {
  diff: ConfigDiffModel;
}

export function ConfigDiff({ diff }: ConfigDiffProps) {
  const oldFile = useMemo(
    () => ({ name: diff.name, contents: diff.oldText, lang: diff.language }),
    [diff.name, diff.oldText, diff.language],
  );
  const newFile = useMemo(
    () => ({ name: diff.name, contents: diff.newText, lang: diff.language }),
    [diff.name, diff.newText, diff.language],
  );

  if (!diff.changed) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground/40">
        No changes
      </div>
    );
  }

  return (
    <MultiFileDiff oldFile={oldFile} newFile={newFile} options={DIFF_OPTIONS} className="h-full" />
  );
}
