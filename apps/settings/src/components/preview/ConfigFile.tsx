import { useCallback, useEffect, useRef, useState } from "react";
import { Editor } from "@pierre/diffs/edit";
import { EditProvider, File, type EditorFactory } from "@pierre/diffs/react";

const createEditor: EditorFactory<undefined, undefined> = (type, options, key) =>
  new Editor(type, options, key);

const COMMIT_DELAY = 400;

export interface ConfigFileProps {
  name: string;
  contents: string;
  onCommit?: (contents: string) => void;
}

function languageOf(name: string): "ini" | "toml" {
  return name.endsWith(".toml") ? "toml" : "ini";
}

export function ConfigFile({ name, contents, onCommit }: ConfigFileProps) {
  const [draft, setDraft] = useState(contents);
  const draftRef = useRef(contents);
  const commitRef = useRef(onCommit);
  const dirty = useRef(false);
  const timer = useRef<number | null>(null);

  commitRef.current = onCommit;

  const flush = useCallback(() => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
    if (!dirty.current) return;

    dirty.current = false;
    commitRef.current?.(draftRef.current);
  }, []);

  const schedule = useCallback(() => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(flush, COMMIT_DELAY);
  }, [flush]);

  useEffect(() => {
    if (dirty.current || contents === draftRef.current) return;

    draftRef.current = contents;
    setDraft(contents);
  }, [contents]);

  useEffect(() => () => flush(), [flush]);

  return (
    <EditProvider createEditor={createEditor}>
      <File
        file={{ name, contents: draft, lang: languageOf(name) }}
        edit
        editStateKey={name}
        onEditChange={(event) => {
          draftRef.current = event.file.contents;
          dirty.current = true;
          setDraft(event.file.contents);
          schedule();
        }}
        options={{
          disableFileHeader: true,
          overflow: "wrap",
          themeType: "system",
        }}
        className="h-full"
      />
    </EditProvider>
  );
}
