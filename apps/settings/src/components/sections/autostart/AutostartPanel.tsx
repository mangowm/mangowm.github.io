import { useRef, useState } from "react";
import { Plus, TerminalSquare, Trash2 } from "lucide-react";

import { Button } from "@mangowm/ui/components/button";
import { useConfigStore, useConfigValues } from "@/lib/config-store";
import { useFocusField } from "@/lib/use-focus-field";
import type { PanelProps } from "@/lib/section-types";
import { PanelHeader, PanelShell, SectionCard } from "@/components/sections/section-ui";

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
  const setDirective = useConfigStore((state) => state.setDirective);

  const [newCommand, setNewCommand] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const add = () => {
    const command = newCommand.trim();
    if (command === "") return;
    setDirective(configKey, [...commands, command]);
    setNewCommand("");
    inputRef.current?.focus();
  };

  const update = (index: number, value: string) => {
    setDirective(
      configKey,
      commands.map((command, current) => (current === index ? value : command)),
    );
  };

  const remove = (index: number) => {
    setDirective(
      configKey,
      commands.filter((_, current) => current !== index),
    );
  };

  return (
    <SectionCard title={title}>
      <div className="flex flex-col">
        {commands.length === 0 && (
          <div className="flex flex-col items-center justify-center bg-muted/5 py-10 text-sm text-muted-foreground">
            <TerminalSquare className="mb-3 size-5 opacity-20" />
            <p>No commands defined.</p>
          </div>
        )}

        {commands.map((command, index) => (
          <div
            key={index}
            className="group flex items-center gap-3 px-4 py-2 transition-colors focus-within:bg-accent/50 hover:bg-accent/50"
          >
            <span className="mt-0.5 font-mono text-sm text-muted-foreground/30 select-none">$</span>
            <input
              value={command}
              onChange={(event) => update(index, event.target.value)}
              className="flex-1 bg-transparent py-1 font-mono text-[13px] text-foreground outline-none placeholder:text-muted-foreground/40"
              spellCheck={false}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => remove(index)}
              className="size-7 text-muted-foreground opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
              aria-label="Remove command"
              title="Remove command"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        ))}

        <div className="flex items-center gap-3 bg-muted/30 px-4 py-2.5">
          <span className="mt-0.5 font-mono text-sm text-muted-foreground/30 select-none">$</span>
          <input
            ref={inputRef}
            value={newCommand}
            onChange={(event) => setNewCommand(event.target.value)}
            placeholder={placeholder}
            className="flex-1 bg-transparent py-1 font-mono text-[13px] text-foreground outline-none placeholder:text-muted-foreground/40"
            spellCheck={false}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                add();
              }
            }}
          />
          <Button
            size="sm"
            variant={newCommand.trim() ? "default" : "secondary"}
            onClick={add}
            disabled={!newCommand.trim()}
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
        description="Applications and scripts that run when mangowm starts or reloads."
        separator={false}
      />

      <div className="flex flex-col gap-5">
        <div ref={fieldRef("exec_once")}>
          <CommandSection title="exec_once" configKey="exec_once" placeholder="e.g., waybar &" />
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
