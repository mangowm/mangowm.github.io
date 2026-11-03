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
