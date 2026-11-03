import { File } from "@pierre/diffs/react";

export interface ConfigViewProps {
  name: string;
  contents: string;
}

function languageOf(name: string): "ini" | "toml" {
  return name.endsWith(".toml") ? "toml" : "ini";
}

export function ConfigView({ name, contents }: ConfigViewProps) {
  return (
    <File
      file={{ name, contents, lang: languageOf(name) }}
      options={{
        disableFileHeader: true,
        overflow: "scroll",
        themeType: "system",
      }}
      className="h-full"
    />
  );
}
