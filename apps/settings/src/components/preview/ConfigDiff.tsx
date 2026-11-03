import { MultiFileDiff } from "@pierre/diffs/react";

export interface ConfigDiffProps {
  name: string;
  oldContents: string;
  newContents: string;
}

function languageOf(name: string): "ini" | "toml" {
  return name.endsWith(".toml") ? "toml" : "ini";
}

export function ConfigDiff({ name, oldContents, newContents }: ConfigDiffProps) {
  if (oldContents === newContents) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground/40">
        No changes
      </div>
    );
  }

  return (
    <MultiFileDiff
      oldFile={{ name, contents: oldContents, lang: languageOf(name) }}
      newFile={{ name, contents: newContents, lang: languageOf(name) }}
      options={{
        diffStyle: "unified",
        disableFileHeader: true,
        overflow: "wrap",
        themeType: "system",
      }}
      className="h-full"
    />
  );
}
