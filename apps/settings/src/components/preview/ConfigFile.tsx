import { useCallback, useEffect, useRef, useState } from "react";
import { Editor } from "@pierre/diffs/edit";
import { EditProvider, File, type EditorFactory } from "@pierre/diffs/react";

import { validateText, type ValidationIssue } from "@mangowm.github.io/config";
import type { FileFormat } from "@/lib/config/types";

const createEditor: EditorFactory<undefined, undefined> = (type, options, key) =>
  new Editor(type, options, key);

const COMMIT_DELAY = 400;

export interface ConfigFileProps {
  name: string;
  contents: string;
  onCommit?: (contents: string) => void;
  onIssues?: (issues: ValidationIssue[]) => void;
}

function languageOf(name: string): "ini" | "toml" {
  return name.endsWith(".toml") ? "toml" : "ini";
}

function formatOf(name: string): FileFormat {
  return name.endsWith(".toml") ? "toml" : "conf";
}

export function ConfigFile({ name, contents, onCommit, onIssues }: ConfigFileProps) {
  const [draft, setDraft] = useState(contents);
  const draftRef = useRef(contents);
  const commitRef = useRef(onCommit);
  const issuesRef = useRef(onIssues);
  const dirty = useRef(false);
  const timer = useRef<number | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  commitRef.current = onCommit;
  issuesRef.current = onIssues;

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
    issuesRef.current?.(validateText(draft, formatOf(name)));
  }, [draft, name]);

  // The previewer stays mounted while the settings view is shown, so pick up
  // config changes made outside the editor. Never clobber an in-progress edit
  // or the text the user is currently typing into.
  useEffect(() => {
    if (contents === draftRef.current || dirty.current) return;
    const root = rootRef.current;
    if (root && root.contains(document.activeElement)) return;
    draftRef.current = contents;
    setDraft(contents);
  }, [contents]);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const root = rootRef.current;
      if (root && event.composedPath().includes(root)) return;
      flush();
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [flush]);

  useEffect(() => () => flush(), [flush]);

  return (
    <div ref={rootRef} className="h-full">
      <EditProvider createEditor={createEditor}>
        <File
          file={{ name, contents: draft, lang: languageOf(name) }}
          edit
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
    </div>
  );
}
