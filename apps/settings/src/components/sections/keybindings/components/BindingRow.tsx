import { Trash2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { DISPATCHER_MAP } from "@/lib/dispatchers";
import type { Keybinding } from "@/lib/keybind-types";
import { ComboDisplay } from "./ComboDisplay";
import { ModeTag } from "./ModeTag";

interface BindingRowProps {
  entry: Keybinding;
  hasConflict?: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export function BindingRow({ entry, hasConflict, onEdit, onDelete }: BindingRowProps) {
  const desc = DISPATCHER_MAP.get(entry.func)?.description ?? (entry.args || entry.func);

  return (
    <div
      className={cn(
        "group grid gap-x-4 gap-y-1 px-4 py-2.5 transition-colors",
        "border-b border-border/30 last:border-0",
        "hover:bg-muted/20",
      )}
      style={{ gridTemplateColumns: "1fr auto" }}
    >
      <div className="flex min-w-0 flex-col justify-center gap-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground leading-none">{entry.func}</span>
          <ModeTag mode={entry.mode} />
        </div>
        {desc && (
          <span className="text-xs text-muted-foreground/60 leading-normal">{desc}</span>
        )}
        {hasConflict && (
          <span className="flex items-center gap-1 text-[11px] text-destructive font-medium leading-none mt-0.5">
            <AlertTriangle className="size-3" />
            Conflicting binding
          </span>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={onEdit}
          aria-label={`Edit keybinding for ${entry.func}`}
          className={cn(
            "flex items-center gap-2 rounded-md px-2 py-1 transition-colors",
            "hover:bg-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          )}
        >
          <ComboDisplay mods={entry.mods} xkbKey={entry.key} />
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
            className="text-muted-foreground/20 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
          >
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
          </svg>
        </button>

        <button
          onClick={onDelete}
          title="Remove binding"
          aria-label={`Remove ${entry.func}`}
          className={cn(
            "flex-shrink-0 rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity",
            "text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10",
            "focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          )}
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
