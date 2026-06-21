import { useEffect, useMemo, useState } from "react";
import { FileIcon, FolderIcon, FolderOpenIcon, ChevronRightIcon } from "lucide-react";
import { useConfigStore } from "@/lib/config-store";
import type { SourceFile, ConfigLine } from "@/lib/config-types";
import { cn } from "@/lib/utils";

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
              key={child.path}
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
  const num = (
    <span className="text-muted-foreground/20 select-none w-8 text-right shrink-0 text-xs">
      {index + 1}
    </span>
  );

  if (line.type === "blank") {
    return <div className="flex gap-4 px-4 hover:bg-accent/30">{num}</div>;
  }

  if (line.type === "comment") {
    return (
      <div className="flex gap-4 px-4 hover:bg-accent/30">
        {num}
        <span className="text-green-600/70 dark:text-green-400/70">{line.raw}</span>
      </div>
    );
  }

  return (
    <div className="flex gap-4 px-4 hover:bg-accent/30">
      {num}
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
  const [selectedFile, setSelectedFile] = useState<SourceFile | null>(null);

  const rootDir = useMemo(() => {
    if (files.length === 0) return "";
    return files[0].absPath.slice(0, files[0].absPath.lastIndexOf("/"));
  }, [files]);

  const tree = useMemo(() => buildTree(files, rootDir), [files, rootDir]);

  useEffect(() => {
    if (!selectedFile && files.length > 0) {
      setSelectedFile(files[0]);
    }
  }, [files, selectedFile]);

  const displayPath = useMemo(() => {
    if (!selectedFile || !rootDir) return null;
    const p = selectedFile.absPath;
    if (p.startsWith(rootDir + "/")) return p.slice(rootDir.length + 1);
    return p.split("/").pop() ?? p;
  }, [selectedFile, rootDir]);

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
              onSelect={setSelectedFile}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="sticky top-0 border-b border-foreground/10 bg-card px-4 py-2 flex items-center gap-2 text-xs text-muted-foreground/60 z-10">
          <FileIcon className="size-3.5" />
          <span className="font-mono">{displayPath}</span>
          <span className="ml-auto">
            {selectedFile
              ? `${selectedFile.lines.length} line${selectedFile.lines.length !== 1 ? "s" : ""}`
              : ""}
          </span>
        </div>
        <div className="flex-1 overflow-y-auto">
          {selectedFile ? (
            <pre className="font-mono text-sm leading-6 py-2">
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
