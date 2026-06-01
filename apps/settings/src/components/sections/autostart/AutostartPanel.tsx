import { useState, useRef } from "react";
import { useConfigStore } from "@/lib/config-store";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Trash2, Plus, TerminalSquare } from "lucide-react";
import { MangoConfigKey } from "@/lib/config-types";

function CommandSection({
  title,
  description,
  configKey,
  placeholder,
}: {
  title: string;
  description: string;
  configKey: MangoConfigKey;
  placeholder: string;
}) {
  const commands = useConfigStore((state) => state.data[configKey]) ?? [];
  const addEntry = useConfigStore((state) => state.addEntry);
  const updateEntry = useConfigStore((state) => state.updateEntry);
  const removeEntry = useConfigStore((state) => state.removeEntry);

  const [newCmd, setNewCmd] = useState("");
  const newCmdInputRef = useRef<HTMLInputElement>(null);

  const handleAdd = () => {
    if (newCmd.trim()) {
      addEntry(configKey, newCmd.trim());
      setNewCmd("");
      newCmdInputRef.current?.focus();
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Clean, icon-less header */}
      <div className="flex flex-col px-1">
        <h3 className="text-base font-medium font-mono text-foreground">{title}</h3>
        <p className="mt-1 text-[13px] text-muted-foreground">{description}</p>
      </div>

      {/* The List Group */}
      <div className="flex flex-col overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm divide-y divide-border/50">
        {/* Empty State */}
        {commands.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-sm text-muted-foreground bg-muted/5">
            <TerminalSquare className="mb-3 size-5 opacity-20" />
            <p>No commands defined.</p>
          </div>
        )}

        {/* Existing Commands */}
        {commands.map((cmd, index) => (
          <div
            key={index}
            className="group flex items-center gap-3 px-4 py-2 transition-colors hover:bg-accent/50 focus-within:bg-accent/50"
          >
            <span className="mt-0.5 text-muted-foreground/30 font-mono text-sm select-none">$</span>
            <input
              value={cmd}
              onChange={(e) => updateEntry(configKey, index, e.target.value)}
              className="flex-1 bg-transparent py-1 font-mono text-[13px] text-foreground outline-none placeholder:text-muted-foreground/40"
              spellCheck={false}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeEntry(configKey, index)}
              className="size-7 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              aria-label="Remove command"
              title="Remove command"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        ))}

        {/* Add New Command Row */}
        <div className="flex items-center gap-3 bg-muted/30 px-4 py-2.5">
          <span className="mt-0.5 text-muted-foreground/30 font-mono text-sm select-none">$</span>
          <input
            ref={newCmdInputRef}
            value={newCmd}
            onChange={(e) => setNewCmd(e.target.value)}
            placeholder={placeholder}
            className="flex-1 bg-transparent py-1 font-mono text-[13px] text-foreground outline-none placeholder:text-muted-foreground/40"
            spellCheck={false}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAdd();
              }
            }}
          />
          <Button
            size="sm"
            variant={newCmd.trim() ? "default" : "secondary"}
            onClick={handleAdd}
            disabled={!newCmd.trim()}
            className="h-7 px-3 text-xs shadow-none transition-all"
          >
            <Plus className="mr-1.5 size-3" />
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}

export function AutostartPanel() {
  return (
    <div className="mx-auto w-full max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Sharper, more direct page header */}
      <div className="mb-8 flex flex-col gap-2">
        <h2 className="text-3xl font-semibold tracking-tight">Autostart</h2>
        <p className="text-sm text-muted-foreground">
          Define applications and scripts to execute on compositor startup or reload.
        </p>
        <Separator className="mt-4" />
      </div>

      <div className="flex flex-col gap-10">
        <CommandSection
          title="exec-once"
          description="Commands that run only once when MangoWM launches. (e.g., status bars, authentication agents)"
          configKey="exec-once"
          placeholder="e.g., waybar &"
        />

        <CommandSection
          title="exec"
          description="Commands that execute every time the configuration is reloaded. (e.g., background setters)"
          configKey="exec"
          placeholder="e.g., swaybg -i ~/wallpaper.png"
        />
      </div>
    </div>
  );
}
