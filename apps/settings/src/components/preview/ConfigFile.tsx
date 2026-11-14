import { useCallback, useEffect, useRef, useState } from "react";
import { Editor } from "@pierre/diffs/edit";
import { EditProvider, File, type EditorFactory, type FileOptions } from "@pierre/diffs/react";

import { validateText, type ValidationIssue } from "@mangowm.github.io/config";
import type { FileFormat } from "@/lib/config/types";

const createEditor: EditorFactory<undefined, undefined> = (type, options, key) =>
  new Editor(type, options, key);

const FILE_OPTIONS: FileOptions<undefined, undefined> = {
  disableFileHeader: true,
  overflow: "wrap",
  themeType: "dark",
  theme: "pierre-dark",
};

const COMMIT_DELAY = 400;

export interface ConfigFileProps {
  name: string;
  contents: string;
  revision: number;
  onCommit?: (contents: string) => void;
  onIssues?: (issues: ValidationIssue[]) => void;
}

function languageOf(name: string): "ini" | "toml" {
  return name.endsWith(".toml") ? "toml" : "ini";
}

function formatOf(name: string): FileFormat {
  return name.endsWith(".toml") ? "toml" : "conf";
}

function fileContents(name: string, contents: string, revision: number) {
  return {
    name,
    contents,
    lang: languageOf(name),
    cacheKey: `${name}:${revision}`,
  };
}

export function ConfigFile({ name, contents, revision, onCommit, onIssues }: ConfigFileProps) {
  // The editor owns the live document while a session is active. This state is
  // only replaced for external changes (undo/redo/apply), never for the echo
  // of our own debounced commits.
  const [file, setFile] = useState(() => fileContents(name, contents, revision));
  const lastCommitted = useRef(contents);
  const latest = useRef(contents);
  const timer = useRef<number | null>(null);
  const commitRef = useRef(onCommit);
  const issuesRef = useRef(onIssues);

  useEffect(() => {
    commitRef.current = onCommit;
    issuesRef.current = onIssues;
  });

  useEffect(() => {
    if (contents === lastCommitted.current) return;
    lastCommitted.current = contents;
    latest.current = contents;
    setFile(fileContents(name, contents, revision));
  }, [contents, name, revision]);

  const commit = useCallback(
    (text: string) => {
      lastCommitted.current = text;
      issuesRef.current?.(validateText(text, formatOf(name)));
      commitRef.current?.(text);
    },
    [name],
  );

  const schedule = useCallback(
    (text: string) => {
      latest.current = text;
      if (timer.current !== null) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => {
        timer.current = null;
        commit(text);
      }, COMMIT_DELAY);
    },
    [commit],
  );

  useEffect(
    () => () => {
      if (timer.current !== null) {
        window.clearTimeout(timer.current);
        timer.current = null;
        commit(latest.current);
      }
    },
    [commit],
  );

  return (
    <div className="h-full">
      <EditProvider createEditor={createEditor}>
        <File
          file={file}
          edit
          editStateKey={`${name}:${formatOf(name)}`}
          options={FILE_OPTIONS}
          onEditChange={(event) => schedule(event.file.contents)}
          onEditComplete={() => {
            if (timer.current !== null) {
              window.clearTimeout(timer.current);
              timer.current = null;
            }
            commit(latest.current);
            return "accept";
          }}
          className="h-full"
        />
      </EditProvider>
    </div>
  );
}
