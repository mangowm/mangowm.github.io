import { PlusIcon, TerminalIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useConfigStore } from "@/lib/config-store";

export function AutostartPanel() {
  const commands = useConfigStore((state) => state.data["exec-once"]) ?? [];
  const addEntry = useConfigStore((state) => state.addEntry);
  const removeEntry = useConfigStore((state) => state.removeEntry);
  const updateEntry = useConfigStore((state) => state.updateEntry);

  if (commands.length === 0) {
    return (
      <div className="flex flex-col items-center gap-5 py-16">
        <TerminalIcon className="size-12 text-muted-foreground/60" />
        <div className="flex flex-col items-center gap-1">
          <p className="text-base font-medium text-foreground">No startup commands</p>
          <p className="text-sm text-muted-foreground text-center max-w-80">
            Commands run in order on each mango session. Add your first command to get started.
          </p>
        </div>
        <Button onClick={() => addEntry("exec-once", "")} size="lg">
          <PlusIcon className="size-4" />
          Add Command
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-medium text-foreground">Autostart Commands</h2>
        <p className="text-sm text-muted-foreground">
          Commands run in order on each mango session.
        </p>
      </div>
      <div className="flex flex-col gap-1.5">
        {commands.map((cmd, i) => (
          <div
            key={i}
            className="group flex items-center gap-2 rounded-lg px-2.5 py-1.5 -mx-2.5 transition-colors hover:bg-muted/40 has-focus-within:bg-muted/40"
          >
            <Input
              value={cmd}
              onChange={(e) => updateEntry("exec-once", i, e.target.value)}
              placeholder="/usr/bin/program"
              className="flex-1"
            />
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => removeEntry("exec-once", i)}
              aria-label="Remove command"
              className="opacity-0 group-hover:opacity-100 group-has-focus-within:opacity-100 transition-opacity"
            >
              <XIcon className="size-4" />
            </Button>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <Button variant="outline" onClick={() => addEntry("exec-once", "")}>
          <PlusIcon className="size-4" />
          Add Command
        </Button>
        <div className="h-px flex-1 bg-border" />
      </div>
    </div>
  );
}
