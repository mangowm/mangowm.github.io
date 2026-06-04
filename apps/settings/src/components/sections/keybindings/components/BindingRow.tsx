import { Trash2, AlertTriangle, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { DISPATCHER_MAP } from "@/lib/dispatchers";
import type { Keybinding } from "@/lib/keybind-types";
import { ComboDisplay } from "./ComboDisplay";

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
        "flex items-center gap-4 px-4 py-3 text-sm transition-colors",
        "border-b border-border/50 last:border-0",
        "hover:bg-muted/30",
      )}
    >
      <div className="flex flex-1 flex-col gap-1 overflow-hidden">
        <div className="flex items-center gap-2">
          <span className="truncate font-medium text-foreground">{entry.func}</span>

          {hasConflict && (
            <span className="flex items-center gap-1 rounded-sm bg-destructive/10 px-1.5 py-0.5 text-[10px] font-medium text-destructive">
              <AlertTriangle className="h-3 w-3" />
              Conflict
            </span>
          )}
        </div>

        {desc && <span className="truncate text-xs text-muted-foreground">{desc}</span>}
      </div>

      <div className="flex shrink-0 items-center justify-end">
        <div className="flex items-center justify-center rounded-md border border-border/60 bg-muted/50 px-2.5 py-1.5 shadow-sm">
          <ComboDisplay mods={entry.mods} xkbKey={entry.key} />
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1 pl-2 border-l border-border/40">
        <button
          onClick={onEdit}
          aria-label={`Edit keybinding for ${entry.func}`}
          className={cn(
            "rounded-md p-1.5 transition-colors",
            "text-muted-foreground hover:bg-muted hover:text-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          )}
        >
          <Pencil className="h-4 w-4" />
        </button>

        <button
          onClick={onDelete}
          title="Remove binding"
          aria-label={`Remove ${entry.func}`}
          className={cn(
            "rounded-md p-1.5 transition-colors",
            "text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          )}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
