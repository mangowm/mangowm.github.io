import { useEffect, useState } from "react";
import { Editor } from "@pierre/diffs/edit";
import { EditProvider, File, type EditorFactory } from "@pierre/diffs/react";

const createEditor: EditorFactory<undefined, undefined> = (type, options, key) =>
  new Editor(type, options, key);

export interface ConfigFileProps {
  name: string;
  contents: string;
  editing?: boolean;
  onCommit?: (contents: string) => void;
}

function languageOf(name: string): "ini" | "toml" {
  return name.endsWith(".toml") ? "toml" : "ini";
}

export function ConfigFile({ name, contents, editing = false, onCommit }: ConfigFileProps) {
  const [pending, setPending] = useState<string | null>(null);

  useEffect(() => {
    if (editing || pending === null) return;
    onCommit?.(pending);
    setPending(null);
  }, [editing, pending, onCommit]);

  return (
    <EditProvider createEditor={createEditor}>
      <File
        file={{ name, contents, lang: languageOf(name) }}
        edit={editing}
        onEditComplete={(event) => {
          setPending(event.file.contents);
          return "accept";
        }}
        options={{
          disableFileHeader: true,
          overflow: "scroll",
          themeType: "system",
        }}
        className="h-full"
      />
    </EditProvider>
  );
}
