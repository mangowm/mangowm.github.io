import { useState, useRef } from "react";
import { useConfigStore, useConfigValues } from "@/lib/config/store";
import { Button } from "@mangowm/ui/components/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@mangowm/ui/components/input-group";
import { Input } from "@mangowm/ui/components/input";
import { Trash2, Plus } from "lucide-react";
import type { PanelProps } from "@/lib/presentation/section-types";
import { useFocusField } from "@/lib/use-focus-field";
import { PanelShell, PanelHeader } from "@/components/primitives/section-ui";

function parseEntry(raw: string): [string, string] {
  const idx = raw.indexOf(",");
  return idx === -1 ? [raw, ""] : [raw.slice(0, idx), raw.slice(idx + 1)];
}

function sanitizeKey(key: string): string {
  return key.toUpperCase().replace(/[^A-Z0-9_]/g, "");
}

function EnvRow({
  raw,
  setPair,
}: {
  raw: string;
  setPair: (table: "env" | "var", name: string, value?: string) => void;
}) {
  const [initialKey, initialValue] = parseEntry(raw);
  const [localKey, setLocalKey] = useState(initialKey);
  const [localValue, setLocalValue] = useState(initialValue);

  const commitChanges = () => {
    const cleanKey = sanitizeKey(localKey);
    if (!cleanKey) {
      setLocalKey(initialKey);
      setLocalValue(initialValue);
      return;
    }
    if (initialKey && cleanKey !== initialKey) {
      setPair("env", initialKey, undefined);
    }
    setPair("env", cleanKey, localValue);
  };

  return (
    <div className="group relative flex items-center justify-between gap-3 rounded-lg border border-transparent px-3 py-1.5 transition-colors focus-within:border-border/50 focus-within:bg-muted/30 hover:bg-muted/30">
      <div className="flex w-full flex-1 items-center gap-3">
        <Input
          value={localKey}
          onChange={(e) => setLocalKey(sanitizeKey(e.target.value))}
          onBlur={commitChanges}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
          }}
          className="h-auto w-1/3 rounded-md border-0 bg-transparent px-2 py-1 font-mono text-[13px] font-medium text-foreground shadow-none transition-all placeholder:text-muted-foreground/30 focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-ring/40 dark:bg-transparent"
          placeholder="KEY"
          spellCheck={false}
        />
        <span className="font-mono text-muted-foreground/40 select-none">=</span>
        <Input
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={commitChanges}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
          }}
          className="h-auto flex-1 rounded-md border-0 bg-transparent px-2 py-1 font-mono text-[13px] text-muted-foreground shadow-none transition-all placeholder:text-muted-foreground/30 focus-visible:bg-background focus-visible:text-foreground focus-visible:ring-1 focus-visible:ring-ring/40 dark:bg-transparent"
          placeholder="value"
          spellCheck={false}
        />
      </div>

      <Button
        variant="ghost"
        size="icon"
        onMouseDown={(e) => {
          e.preventDefault();
          setPair("env", initialKey, undefined);
        }}
        className="size-8 shrink-0 text-muted-foreground opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
        tabIndex={-1}
      >
        <Trash2 className="size-3.5" />
      </Button>
    </div>
  );
}

export function EnvironmentPanel({ focusKey }: PanelProps) {
  const fieldRef = useFocusField(focusKey);
  const envVars = useConfigValues("env");
  const setPair = useConfigStore((state) => state.setPair);

  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  const keyInputRef = useRef<HTMLInputElement>(null);
  const valueInputRef = useRef<HTMLInputElement>(null);

  const handleAdd = (e?: React.FormEvent) => {
    e?.preventDefault();
    const cleanKey = sanitizeKey(newKey);
    if (cleanKey) {
      setPair("env", cleanKey, newValue.trim());
      setNewKey("");
      setNewValue("");
      keyInputRef.current?.focus();
    }
  };

  const handleSmartPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData("text");
    if (pastedText.includes("=")) {
      e.preventDefault();
      const [pastedKey, ...pastedValueArr] = pastedText.split("=");
      setNewKey(sanitizeKey(pastedKey));
      setNewValue(pastedValueArr.join("="));
      setTimeout(() => valueInputRef.current?.focus(), 0);
    }
  };

  return (
    <PanelShell maxWidth="max-w-3xl">
      <PanelHeader
        title="Environment Variables"
        description="Global variables injected into the mangowm session environment."
        separator={false}
      />

      <div className="mb-8 rounded-xl border border-border/50 bg-card p-1.5 shadow-sm">
        <form
          onSubmit={handleAdd}
          className="flex flex-col items-center gap-2 rounded-lg bg-muted/10 p-2 sm:flex-row"
        >
          <InputGroup className="w-full flex-1 border-border/40 bg-background/50">
            <InputGroupAddon className="text-[11px] font-semibold tracking-wider uppercase">
              Key
            </InputGroupAddon>
            <InputGroupInput
              ref={keyInputRef}
              value={newKey}
              onChange={(e) => setNewKey(sanitizeKey(e.target.value))}
              onPaste={handleSmartPaste}
              placeholder="QT_QPA_PLATFORMTHEME"
              className="font-mono text-sm"
              spellCheck={false}
            />
          </InputGroup>

          <InputGroup className="w-full flex-1 border-border/40 bg-background/50">
            <InputGroupAddon className="text-[11px] font-semibold tracking-wider uppercase">
              Value
            </InputGroupAddon>
            <InputGroupInput
              ref={valueInputRef}
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="qt6ct"
              className="font-mono text-sm"
              spellCheck={false}
            />
          </InputGroup>

          <Button
            type="submit"
            disabled={!newKey.trim()}
            className="w-full shrink-0 shadow-none transition-all sm:w-auto"
          >
            <Plus className="size-4 sm:mr-1.5" />
            <span className="hidden sm:inline">Add</span>
          </Button>
        </form>
      </div>

      <div ref={fieldRef("env")} className="flex flex-col gap-2">
        <div className="mb-2 flex items-center justify-between px-2">
          <h3 className="text-sm font-medium text-foreground">Session Variables</h3>
          <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
            {envVars.length}
          </span>
        </div>

        {envVars.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/5 py-12 text-center">
            <h4 className="text-sm font-medium text-foreground">No variables defined</h4>
            <p className="mt-1 mb-5 max-w-[280px] text-sm text-muted-foreground">
              Set environment variables here to configure applications running under mangowm.
            </p>
          </div>
        ) : (
          <div className="flex flex-col rounded-xl border border-border/50 bg-card p-1 shadow-sm">
            {envVars.map((raw, index) => (
              <EnvRow key={`${index}-${raw.split(",")[0]}`} raw={raw} setPair={setPair} />
            ))}
          </div>
        )}
      </div>
    </PanelShell>
  );
}
