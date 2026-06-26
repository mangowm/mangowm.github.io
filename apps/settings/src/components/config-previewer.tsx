import { useCallback, useEffect, useState } from "react";
import { FileIcon, FolderIcon, FolderOpenIcon, ChevronRightIcon, Copy } from "lucide-react";
import { useConfigStore } from "@/lib/config-store";
import type { SourceFile, ConfigLine } from "@/lib/config-types";
import { serializeConfig } from "@/lib/config-parse";
import { cn } from "@/lib/utils";

interface TreeNode {
  name: string;
  type: "file" | "folder";
  path: string;
  children: TreeNode[];
  sourceFile?: SourceFile;
}

function commonAncestorDir(absPaths: string[]): string {
  if (absPaths.length === 0) return "";
  if (absPaths.length === 1) {
    return absPaths[0].slice(0, absPaths[0].lastIndexOf("/"));
  }

  const splitPaths = absPaths.map((p) => p.split("/"));
  let i = 0;
  while (i < splitPaths[0].length) {
    const seg = splitPaths[0][i];
    if (splitPaths.every((s) => i < s.length && s[i] === seg)) {
      i++;
    } else {
      break;
    }
  }

  if (i < 2) return "/";
  return splitPaths[0].slice(0, i).join("/");
}

function buildTree(files: SourceFile[], rootDir: string): TreeNode[] {
  const root: TreeNode[] = [];

  for (const file of files) {
    const relPath = file.absPath.startsWith(rootDir + "/")
      ? file.absPath.slice(rootDir.length + 1)
      : file.absPath.split("/").pop() ?? file.absPath;

    const segments = relPath.split("/");
    let current = root;

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      const isLast = i === segments.length - 1;

      if (isLast) {
        const existing = current.find(
          (n) => n.name === segment && n.type === "file",
        );
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
        let folder = current.find(
          (n) => n.name === segment && n.type === "folder",
        );
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
          "flex w-full items-center gap-2 px-2 py-1 text-sm rounded-md text-left transition-colors cursor-pointer",
          selectedPath === node.path
            ? "bg-accent text-accent-foreground font-medium"
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
        className="flex w-full items-center gap-2 px-2 py-1 text-sm rounded-md text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors cursor-pointer"
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

function ConfigLineRow({ line, index }: { line: ConfigLine; index: number }) {
  const gutter = (
    <span className="text-muted-foreground/20 select-none min-w-[4ch] text-right pr-4 shrink-0 tabular-nums">
      {index + 1}
    </span>
  );

  if (line.type === "blank") {
    return <div className="flex px-4 leading-6 hover:bg-accent/30">{gutter}</div>;
  }

  if (line.type === "comment") {
    return (
      <div className="flex px-4 leading-6 hover:bg-accent/30">
        {gutter}
        <span className="text-green-600/70 dark:text-green-400/70">{line.raw}</span>
      </div>
    );
  }

  return (
    <div className="flex px-4 leading-6 hover:bg-accent/30">
      {gutter}
      <span>
        <span className="text-blue-600 dark:text-blue-400">{line.key}</span>
        <span className="text-muted-foreground/50"> = </span>
        <span>{line.value}</span>
      </span>
    </div>
  );
}

export function ConfigPreviewer() {
  const files = useConfigStore((s) => s.files);
  const [selectedAbsPath, setSelectedAbsPath] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const rootDir = commonAncestorDir(files.map((f) => f.absPath));
  const tree = buildTree(files, rootDir);
  const selectedFile = selectedAbsPath
    ? files.find((f) => f.absPath === selectedAbsPath) ?? null
    : null;

  useEffect(() => {
    if (files.length === 0) {
      setSelectedAbsPath(null);
    } else if (!selectedAbsPath || !files.some((f) => f.absPath === selectedAbsPath)) {
      setSelectedAbsPath(files[0].absPath);
    }
  }, [files, selectedAbsPath]);

  const handleCopy = useCallback(() => {
    if (!selectedFile) return;
    navigator.clipboard.writeText(serializeConfig(selectedFile.lines));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [selectedFile]);

  const displayPath =
    selectedAbsPath && rootDir
      ? (selectedAbsPath.startsWith(rootDir + "/")
          ? selectedAbsPath.slice(rootDir.length + 1)
          : selectedAbsPath.split("/").pop() ?? selectedAbsPath)
      : null;

  if (files.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground/40 text-sm">
        No config files loaded
      </div>
    );
  }

  return (
    <div className="flex flex-1 gap-0 -m-6 rounded-xl overflow-hidden">
      <div className="w-64 shrink-0 border-r border-foreground/10 overflow-y-auto bg-muted/30">
        <div className="p-3">
          <div className="text-xs font-medium text-muted-foreground/60 uppercase tracking-wider mb-2 px-2">
            Config Files
          </div>
          {tree.map((node) => (
            <FileTreeNode
              key={node.path}
              node={node}
              selectedPath={displayPath}
              onSelect={(file) => setSelectedAbsPath(file.absPath)}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="sticky top-0 border-b border-foreground/10 bg-card px-4 py-2 flex items-center gap-2 text-xs text-muted-foreground/60 z-10">
          <FileIcon className="size-3.5" />
          <span className="font-mono">{displayPath}</span>
          <span className="ml-auto flex items-center gap-1">
            <button
              onClick={handleCopy}
              disabled={!selectedFile}
              className="flex items-center gap-1 rounded-md px-2 py-1 transition-colors cursor-pointer hover:bg-accent/50 hover:text-foreground disabled:opacity-30 disabled:pointer-events-none"
            >
              {copied ? (
                <span className="text-green-600 dark:text-green-400">Copied!</span>
              ) : (
                <Copy className="size-3.5" />
              )}
            </button>
            <span className="ml-1">
              {selectedFile
                ? `${selectedFile.lines.length} line${selectedFile.lines.length !== 1 ? "s" : ""}`
                : ""}
            </span>
          </span>
        </div>
        <div className="flex-1 overflow-auto">
          {selectedFile ? (
            <pre className="font-mono text-sm leading-6 py-2 min-w-min">
              {selectedFile.lines.map((line, i) => (
                <ConfigLineRow key={i} line={line} index={i} />
              ))}
            </pre>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground/40 text-sm">
              Select a file to view
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
