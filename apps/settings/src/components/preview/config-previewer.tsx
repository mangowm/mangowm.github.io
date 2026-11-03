import { useCallback, useEffect, useState } from "react";
import { FileIcon, FolderIcon, FolderOpenIcon, ChevronRightIcon, Copy } from "lucide-react";
import { useConfigStore } from "@/lib/config/store";
import type { SourceFile } from "@/lib/config/types";
import { ConfigDiff } from "@/components/preview/ConfigDiff";
import { ConfigFile } from "@/components/preview/ConfigFile";
import { convertFile, convertName, convertOriginal } from "@/lib/config/convert";
import { commonAncestorDir } from "@/lib/platform/paths";
import { cn } from "cn";

interface TreeNode {
  name: string;
  type: "file" | "folder";
  path: string;
  children: TreeNode[];
  sourceFile?: SourceFile;
}

function buildTree(files: SourceFile[], rootDir: string): TreeNode[] {
  const root: TreeNode[] = [];

  for (const file of files) {
    const relPath = rootDir
      ? file.absPath.startsWith(rootDir + "/")
        ? file.absPath.slice(rootDir.length + 1)
        : (file.absPath.split("/").pop() ?? file.absPath)
      : file.absPath;

    const segments = relPath.split("/");
    let current = root;

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      const isLast = i === segments.length - 1;

      if (isLast) {
        const existing = current.find((n) => n.name === segment && n.type === "file");
        if (!existing) {
          current.push({
            name: segment,
            type: "file",
            path: relPath,
            children: [],
            sourceFile: file,
          });
        }
      } else {
        let folder = current.find((n) => n.name === segment && n.type === "folder");
        if (!folder) {
          folder = {
            name: segment,
            type: "folder",
            path: segments.slice(0, i + 1).join("/"),
            children: [],
          };
          current.push(folder);
        }
        current = folder.children;
      }
    }
  }

  return root;
}

function FileTreeNode({
  node,
  selectedPath,
  onSelect,
  depth = 0,
}: {
  node: TreeNode;
  selectedPath: string | null;
  onSelect: (file: SourceFile) => void;
  depth?: number;
}) {
  const [expanded, setExpanded] = useState(true);

  if (node.type === "file") {
    return (
      <button
        onClick={() => node.sourceFile && onSelect(node.sourceFile)}
        className={cn(
          "flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-left text-sm transition-colors",
          selectedPath === node.path
            ? "bg-accent font-medium text-accent-foreground"
            : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        <FileIcon className="size-4 shrink-0 text-foreground/40" />
        <span className="truncate">{node.name}</span>
      </button>
    );
  }

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        <ChevronRightIcon
          className={cn("size-3.5 shrink-0 transition-transform", expanded && "rotate-90")}
        />
        {expanded ? (
          <FolderOpenIcon className="size-4 shrink-0 text-foreground/60" />
        ) : (
          <FolderIcon className="size-4 shrink-0 text-foreground/60" />
        )}
        <span className="truncate">{node.name}</span>
      </button>
      {expanded && (
        <div>
          {node.children.map((child) => (
            <FileTreeNode
              key={`${child.type}:${child.path}`}
              node={child}
              selectedPath={selectedPath}
              onSelect={onSelect}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function ConfigPreviewer() {
  const files = useConfigStore((s) => s.files);
  const setFileText = useConfigStore((s) => s.setFileText);
  const outputFormat = useConfigStore((s) => s.outputFormat);
  const setOutputFormat = useConfigStore((s) => s.setOutputFormat);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [diffing, setDiffing] = useState(false);
  const [copied, setCopied] = useState(false);

  const rootDir = commonAncestorDir(files.map((f) => f.absPath));
  const tree = buildTree(files, rootDir);
  const selectedFile = selectedPath
    ? (files.find((f) => f.absPath === selectedPath) ?? null)
    : null;

  useEffect(() => {
    if (files.length === 0) {
      setSelectedPath(null);
    } else if (!selectedPath || !files.some((f) => f.absPath === selectedPath)) {
      setSelectedPath(files[0].absPath);
    }
  }, [files, selectedPath]);

  const contents = selectedFile ? convertFile(selectedFile, outputFormat) : "";
  const converted = selectedFile ? outputFormat !== selectedFile.format : false;

  const handleCopy = useCallback(() => {
    navigator.clipboard
      .writeText(contents)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => {});
  }, [contents]);

  const basePath =
    selectedPath && rootDir
      ? selectedPath.startsWith(rootDir + "/")
        ? selectedPath.slice(rootDir.length + 1)
        : (selectedPath.split("/").pop() ?? selectedPath)
      : selectedPath;
  const displayPath = basePath ? convertName(basePath, outputFormat) : basePath;

  if (files.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground/40">
        No config files loaded
      </div>
    );
  }

  return (
    <div className="-m-6 flex flex-1 gap-0 overflow-hidden rounded-xl">
      <div className="w-64 shrink-0 overflow-y-auto border-r border-foreground/10 bg-muted/30">
        <div className="p-3">
          <div className="mb-2 px-2 text-xs font-medium tracking-wider text-muted-foreground/60 uppercase">
            Config Files
          </div>
          {tree.map((node) => (
            <FileTreeNode
              key={node.path}
              node={node}
              selectedPath={displayPath}
              onSelect={(file) => {
                setSelectedPath(file.absPath);
                setEditing(false);
                setDiffing(false);
              }}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-foreground/10 bg-card px-4 py-2 text-xs text-muted-foreground/60">
          <FileIcon className="size-3.5" />
          <span className="font-mono">{displayPath}</span>
          <span className="ml-auto flex items-center gap-1">
            <div className="flex items-center rounded-md border border-border/40 p-0.5">
              {(["conf", "toml"] as const).map((format) => (
                <button
                  key={format}
                  onClick={() => {
                    setEditing(false);
                    setDiffing(false);
                    setOutputFormat(format);
                  }}
                  className={cn(
                    "rounded px-2 py-0.5 font-mono text-[10px] uppercase transition-colors",
                    outputFormat === format
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {format}
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                setEditing(false);
                setDiffing((value) => !value);
              }}
              disabled={!selectedFile}
              className="flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 transition-colors hover:bg-accent/50 hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
            >
              {diffing ? "View" : "Diff"}
            </button>
            <button
              onClick={() => {
                setDiffing(false);
                setEditing((value) => !value);
              }}
              disabled={!selectedFile || converted}
              title={converted ? "Switch to the native format to edit" : undefined}
              className="flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 transition-colors hover:bg-accent/50 hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
            >
              {editing ? "Done" : "Edit"}
            </button>
            <button
              onClick={handleCopy}
              disabled={!selectedFile || copied}
              className="flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 transition-colors hover:bg-accent/50 hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
            >
              {copied ? (
                <span className="text-green-600 dark:text-green-400">Copied!</span>
              ) : (
                <Copy className="size-3.5" />
              )}
            </button>
            <span className="ml-1">
              {selectedFile
                ? `${contents.split("\n").length} line${contents.split("\n").length !== 1 ? "s" : ""}`
                : ""}
            </span>
          </span>
        </div>
        <div className="flex-1 overflow-hidden">
          {selectedFile ? (
            diffing ? (
              <ConfigDiff
                name={displayPath ?? selectedFile.refPath}
                oldContents={convertOriginal(selectedFile, outputFormat)}
                newContents={contents}
              />
            ) : (
              <ConfigFile
                name={displayPath ?? selectedFile.refPath}
                contents={contents}
                editing={editing && !converted}
                onCommit={(text) => setFileText(selectedFile.absPath, text)}
              />
            )
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground/40">
              Select a file to view
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
