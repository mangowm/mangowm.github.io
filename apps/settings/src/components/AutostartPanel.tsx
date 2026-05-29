import { PlusIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useConfigStore } from "@/lib/config-store";

export function AutostartPanel() {
  const exec_once = useConfigStore((s) => s.typed.exec_once);
  const addExecOnce = useConfigStore((s) => s.addExecOnce);
  const removeExecOnce = useConfigStore((s) => s.removeExecOnce);
  const updateExecOnce = useConfigStore((s) => s.updateExecOnce);

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-medium text-foreground">Autostart Commands</h2>
        <p className="text-xs text-muted-foreground">
          Commands run on mango startup. One command per line.
        </p>
      </div>

      {exec_once.length === 0 && (
        <p className="text-xs text-muted-foreground py-2">No autostart commands configured.</p>
      )}

      {exec_once.map((cmd, i) => (
        <div key={i} className="flex items-center gap-2">
          <Input
            value={cmd}
            onChange={(e) => updateExecOnce(i, e.target.value)}
            placeholder="/usr/bin/program"
            className="flex-1"
          />
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => removeExecOnce(i)}
            aria-label="Remove command"
          >
            <Trash2Icon className="size-4" />
          </Button>
        </div>
      ))}

      <Button variant="outline" size="sm" onClick={() => addExecOnce("")} className="self-start">
        <PlusIcon className="size-4" />
        Add Command
      </Button>
    </div>
  );
}
