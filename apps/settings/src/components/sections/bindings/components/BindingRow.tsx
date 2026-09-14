import {
  Trash2,
  AlertTriangle,
  Pencil,
  MousePointer2,
  Move,
  FlipHorizontal,
  Hand,
  Keyboard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DISPATCHER_MAP, parseArgValues } from "@/lib/dispatchers";
import type { Keybinding } from "@/lib/keybind-types";
import { ComboDisplay } from "./ComboDisplay";

const TYPE_ICONS: Record<string, React.ReactNode> = {
  keyboard: <Keyboard className="size-3" />,
  mouse: <MousePointer2 className="size-3" />,
  axis: <Move className="size-3" />,
  switch: <FlipHorizontal className="size-3" />,
  gesture: <Hand className="size-3" />,
};

interface ParsedArg {
  name: string;
  value: string;
}

function parseBindingArgs(func: string, args: string) {
  const schema = DISPATCHER_MAP.get(func)?.args ?? [];
  const argValues = parseArgValues(args, schema);
  const hasAnyArg = schema.length > 0 && Object.values(argValues).some((v) => v !== "");

  return {
    parsedArgs: hasAnyArg
      ? schema
          .filter((arg) => Boolean(argValues[arg.name]))
          .map((arg) => ({ name: arg.name, value: argValues[arg.name] }) as ParsedArg)
      : null,
    rawArgs: !hasAnyArg && args ? args : null,
  };
}

interface BindingRowProps {
  entry: Keybinding;
  hasConflict?: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export function BindingRow({ entry, hasConflict, onEdit, onDelete }: BindingRowProps) {
  const { parsedArgs, rawArgs } = parseBindingArgs(entry.func, entry.args);

  return (
    <div
      className={cn(
        "group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 sm:px-4",
        "transition-colors duration-200 hover:bg-muted/50",
      )}
    >
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-2">
        <div className="flex items-center shrink-0 gap-1.5">
          <span className="text-muted-foreground/50 shrink-0" title={entry.type}>
            {TYPE_ICONS[entry.type] ?? TYPE_ICONS.keyboard}
          </span>
          <div className="flex h-7 items-center rounded-md bg-primary/10 px-2.5 font-mono text-xs font-semibold text-primary">
            {entry.func}
          </div>
        </div>

        {rawArgs ? (
          <code className="rounded-md border border-dashed border-border/60 bg-muted/30 px-2.5 py-1 font-mono text-[11px] text-muted-foreground break-all">
            {rawArgs}
          </code>
        ) : parsedArgs && parsedArgs.length > 0 ? (
          <div className="flex flex-wrap items-center gap-1.5">
            {parsedArgs.map((arg) => (
              <div
                key={arg.name}
                className="flex items-center overflow-hidden rounded-md border border-border/50 font-mono text-[11px] bg-background/50"
              >
                <span className="bg-muted/60 px-2 py-1 text-muted-foreground border-r border-border/50 font-medium">
                  {arg.name}
                </span>
                <span className="px-2 py-1 text-foreground font-medium break-all">{arg.value}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {hasConflict && (
          <span
            className="flex items-center gap-1 rounded-md bg-destructive/10 px-2 py-1.5 text-destructive"
            title="Conflicting binding"
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span className="text-[11px] font-medium leading-none hidden sm:inline">Conflict</span>
          </span>
        )}

        <div
          className={cn(
            "flex items-center justify-center rounded-md border px-2.5 py-1.5 transition-colors",
            "border-border/60 bg-background/50 group-hover:bg-background",
          )}
        >
          <ComboDisplay
            type={entry.type}
            mods={entry.mods}
            triggerLabel={entry.key}
            fingers={entry.fingers}
          />
        </div>

        <div
          className={cn(
            "flex items-center gap-0.5",
            "opacity-100 sm:opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-within:opacity-100",
          )}
        >
          <button
            onClick={onEdit}
            aria-label={`Edit binding for ${entry.func}`}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
          >
            <Pencil className="h-4 w-4" />
          </button>

          <button
            onClick={onDelete}
            aria-label={`Remove ${entry.func}`}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/15 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
