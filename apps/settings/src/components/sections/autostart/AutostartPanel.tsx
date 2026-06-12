import { useState, useRef } from "react";
import { useConfigStore, useConfigValues } from "@/lib/config-store";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, TerminalSquare } from "lucide-react";
import type { PanelProps } from "@/lib/section-types";
import { useFocusField } from "@/lib/use-focus-field";
import { PanelShell, PanelHeader, SectionCard } from "@/components/sections/section-ui";

function CommandSection({
  title,
  configKey,
  placeholder,
}: {
  title: string;
  configKey: string;
  placeholder: string;
}) {
  const commands = useConfigValues(configKey);
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
    <SectionCard title={title}>
      <div className="flex flex-col">
        {commands.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-sm text-muted-foreground bg-muted/5">
            <TerminalSquare className="mb-3 size-5 opacity-20" />
            <p>No commands defined.</p>
          </div>
        )}

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
    </SectionCard>
  );
}

export function AutostartPanel({ focusKey }: PanelProps) {
  const fieldRef = useFocusField(focusKey);

  return (
    <PanelShell maxWidth="max-w-3xl">
      <PanelHeader
        title="Autostart"
        description="Define applications and scripts to execute on compositor startup or reload."
        separator={false}
      />

      <div className="flex flex-col gap-5">
        <div ref={fieldRef("exec-once")}>
          <CommandSection title="exec-once" configKey="exec-once" placeholder="e.g., waybar &" />
        </div>

        <div ref={fieldRef("exec")}>
          <CommandSection
            title="exec"
            configKey="exec"
            placeholder="e.g., swaybg -i ~/wallpaper.png"
          />
        </div>
      </div>
    </PanelShell>
  );
}
