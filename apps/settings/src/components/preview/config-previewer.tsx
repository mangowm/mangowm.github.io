import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowUpRight,
  ChevronRightIcon,
  Copy,
  FileIcon,
  FolderIcon,
  FolderOpenIcon,
} from "lucide-react";
import { useConfigStore } from "@/lib/config/store";
import type { ValidationIssue } from "@mangowm.github.io/config";
import type { FileFormat, SourceFile } from "@/lib/config/types";
import { ConfigFile } from "@/components/preview/ConfigFile";
import { Button } from "@mangowm/ui/components/button";
import { ToggleGroup, ToggleGroupItem } from "@mangowm/ui/components/toggle-group";
import { convertFile, convertName } from "@/lib/config/convert";
import { diffConfigFile } from "@/lib/config/diff";
import { commonAncestorDir } from "@/lib/platform/paths";
import { cn } from "cn";

const ConfigDiff = lazy(() =>
  import("@/components/preview/ConfigDiff").then((module) => ({
    default: module.ConfigDiff,
  })),
);

interface SectionSuggestion {
  id: string;
  label: string;
}

interface ConfigPreviewerProps {
  resolveSection?: (key: string | undefined) => SectionSuggestion | undefined;
  onOpenSection?: (sectionId: string, key?: string) => void;
}

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
  disabled = false,
  depth = 0,
}: {
  node: TreeNode;
  selectedPath: string | null;
  onSelect: (file: SourceFile) => void;
  disabled?: boolean;
  depth?: number;
}) {
  const [expanded, setExpanded] = useState(true);

  if (node.type === "file") {
    return (
      <button
        onClick={() => node.sourceFile && onSelect(node.sourceFile)}
        disabled={disabled}
        title={disabled ? "Fix the error first to switch files." : undefined}
        className={cn(
          "flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-left text-sm transition-colors",
          selectedPath === node.path
            ? "bg-accent font-medium text-accent-foreground"
            : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
          disabled && "cursor-not-allowed opacity-40 hover:bg-transparent",
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
              disabled={disabled}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function ConfigPreviewer({ resolveSection, onOpenSection }: ConfigPreviewerProps = {}) {
  const files = useConfigStore((s) => s.files);
  const setFileText = useConfigStore((s) => s.setFileText);
  const outputFormat = useConfigStore((s) => s.outputFormat);
  const setOutputFormat = useConfigStore((s) => s.setOutputFormat);
  const revision = useConfigStore((s) => s.revision);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [diffing, setDiffing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [issues, setIssues] = useState<ValidationIssue[]>([]);

  const invalid = issues.some((issue) => issue.severity === "error");
  const firstIssue = issues[0];
  const suggestion = resolveSection?.(firstIssue?.key);
  const handleIssues = useCallback((next: ValidationIssue[]) => setIssues(next), []);

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
  const diff = selectedFile ? diffConfigFile(selectedFile, outputFormat) : null;

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
      <div className="w-64 shrink-0 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent overflow-y-auto border-r border-foreground/10 bg-muted/30">
        <div className="p-3">
          <div className="mb-2 px-2 text-xs font-medium tracking-wider text-muted-foreground/60 uppercase">
            Config Files
          </div>
          {tree.map((node) => (
            <FileTreeNode
              key={node.path}
              node={node}
              selectedPath={displayPath}
              disabled={invalid}
              onSelect={(file) => {
                setSelectedPath(file.absPath);
                setDiffing(false);
              }}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center gap-2 border-b border-foreground/10 bg-card px-4 py-2 text-xs text-muted-foreground/60">
          <FileIcon className="size-3.5" />
          <span className="font-mono">{displayPath}</span>
          <span className="ml-auto flex items-center gap-1">
            <ToggleGroup
              value={[outputFormat]}
              onValueChange={(value) => {
                const format = value[0];
                if (!format) return;
                setDiffing(false);
                setOutputFormat(format as FileFormat);
              }}
              disabled={invalid}
              spacing={0}
              className="rounded-lg border border-border/40 p-0.5"
            >
              {(["conf", "toml"] as const).map((format) => (
                <ToggleGroupItem
                  key={format}
                  value={format}
                  title={invalid ? "Fix the error first to switch format." : undefined}
                  className="h-6 rounded-md px-2 py-0.5 font-mono text-[10px] text-muted-foreground uppercase transition-colors data-pressed:bg-accent data-pressed:text-foreground"
                >
                  {format}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDiffing((value) => !value)}
              disabled={!selectedFile || invalid}
              title={invalid ? "Fix the error first to view the diff." : undefined}
              className="h-7 px-2 text-[10px]"
            >
              {diffing ? "View" : "Diff"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              disabled={!selectedFile || copied}
              className="h-7 px-2 text-[10px]"
            >
              {copied ? (
                <span className="text-green-600 dark:text-green-400">Copied!</span>
              ) : (
                <Copy className="size-3.5" />
              )}
            </Button>
            <span className="ml-1">
              {selectedFile
                ? `${contents.split("\n").length} line${contents.split("\n").length !== 1 ? "s" : ""}`
                : ""}
            </span>
          </span>
        </div>
        {firstIssue && (
          <div
            className={cn(
              "flex items-start gap-2 border-b px-4 py-2.5 text-xs",
              invalid
                ? "border-destructive/20 bg-destructive/5 text-destructive"
                : "border-amber-500/20 bg-amber-500/5 text-amber-700 dark:text-amber-400",
            )}
          >
            <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">
                  {invalid ? "Syntax error" : "Warning"} on line {firstIssue.line}
                </p>
                {issues.length > 1 && (
                  <span className="text-[11px] opacity-70">{issues.length - 1} more</span>
                )}
              </div>
              {firstIssue.text.trim() && (
                <p className="truncate font-mono opacity-80">{firstIssue.text.trim()}</p>
              )}
              <p className="truncate opacity-80">{firstIssue.message}</p>
            </div>
            {suggestion && onOpenSection && (
              <button
                onClick={() => onOpenSection(suggestion.id, firstIssue.key)}
                className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 self-center rounded-md border border-border/50 px-2 py-1 text-xs font-medium whitespace-nowrap text-foreground transition-colors hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                Open {suggestion.label}
                <ArrowUpRight className="size-3.5" />
              </button>
            )}
          </div>
        )}
        <div className="min-h-0 flex-1 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent overflow-y-auto">
          {selectedFile ? (
            diffing && diff ? (
              <Suspense
                fallback={
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground/40">
                    Loading diff…
                  </div>
                }
              >
                <ConfigDiff diff={diff} />
              </Suspense>
            ) : (
              <ConfigFile
                key={`${selectedFile.absPath}:${outputFormat}`}
                name={displayPath ?? selectedFile.refPath}
                contents={contents}
                revision={revision}
                onCommit={(text) => setFileText(selectedFile.absPath, text, outputFormat)}
                onIssues={handleIssues}
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
