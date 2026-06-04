import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AlertCircle, LayoutGridIcon } from "lucide-react";
import { bindKeyFromFlags, parseModifiers, serializeModifiers, insertModeAwareBinding } from "@/lib/keybind-parse";
import { resolveGlobalIndex } from "@/lib/config-store";
import { DISPATCHER_MAP, parseArgValues, serializeArgValues, validateAllArgs } from "@/lib/dispatchers";
import type { Keybinding, KeybindFlags } from "@/lib/keybind-types";
import type { SourceFile } from "@/lib/config-types";
import { useConflictCheck } from "../hooks/useConflictCheck";
import { KeyRecorder } from "./KeyRecorder";
import { ActionSelector } from "./ActionSelector";
import { DynamicArgField } from "./DynamicArgField";
import { ModeCombobox } from "./ModeCombobox";
import { LayoutToggleGroup } from "./LayoutToggleGroup";

interface FormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  insertEntry: (
    key: string,
    value: string,
    options: { fileIdx: number; afterLineIdx: number },
  ) => void;
  updateEntry: (key: string, index: number, value: string) => void;
  removeEntry: (key: string, index: number) => void;
  files: SourceFile[];
  existingModes: string[];
  allEntries: Keybinding[];
  editingEntry?: Keybinding | null;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/45">
      {children}
    </span>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden divide-y divide-border/20">
      {children}
    </div>
  );
}

export function EditDialog({
  open,
  onOpenChange,
  insertEntry,
  updateEntry,
  removeEntry,
  files,
  existingModes,
  allEntries,
  editingEntry,
}: FormProps) {
  const [selectedMods, setSelectedMods] = useState<string[]>([]);
  const [key, setKey] = useState("");
  const [func, setFunc] = useState("");
  const [args, setArgs] = useState("");
  const [argErrors, setArgErrors] = useState<Record<string, string | null>>({});
  const [mode, setMode] = useState("default");
  const [flags, setFlags] = useState<KeybindFlags>({
    symOnly: false,
    onLock: false,
    onRelease: false,
    pass: false,
  });

  useEffect(() => {
    if (!open) return;
    if (editingEntry) {
      setMode(editingEntry.mode);
      setSelectedMods(parseModifiers(editingEntry.mods));
      setKey(editingEntry.key);
      setFunc(editingEntry.func);
      setArgs(editingEntry.args ?? "");
      setFlags({ ...editingEntry.flags });
    } else {
      setMode("default");
      setSelectedMods([]);
      setKey("");
      setFunc("");
      setArgs("");
      setFlags({ symOnly: false, onLock: false, onRelease: false, pass: false });
      setArgErrors({});
    }
  }, [open, editingEntry]);

  const currentSchema = useMemo(() => DISPATCHER_MAP.get(func)?.args ?? [], [func]);
  const [argValues, setArgValues] = useState<Record<string, string>>({});

  useEffect(() => {
    setArgValues(parseArgValues(args, currentSchema));
  }, [args, currentSchema]);

  const handleArgChange = useCallback(
    (argName: string, value: string) => {
      setArgValues((prev) => {
        const next = { ...prev, [argName]: value };
        setArgs(serializeArgValues(next, currentSchema));
        const err = validateAllArgs(next, currentSchema);
        setArgErrors((prevErr) =>
          err[argName] !== prevErr[argName]
            ? { ...prevErr, [argName]: err[argName] ?? null }
            : prevErr,
        );
        return next;
      });
    },
    [currentSchema],
  );

  const configKey = useMemo(() => bindKeyFromFlags(flags), [flags]);
  const modString = useMemo(
    () => serializeModifiers(selectedMods),
    [selectedMods],
  );

  const conflicts = useConflictCheck(allEntries, mode, modString, key, editingEntry?.id);

  const handleSubmit = () => {
    if (!key.trim() || !func.trim()) return;
    const errors = validateAllArgs(argValues, currentSchema);
    setArgErrors(errors);
    if (Object.values(errors).some(Boolean)) return;

    const value = [modString, key.trim(), func.trim(), args.trim()].filter((s) => s !== "").join(",");
    const resolvedEditing = editingEntry ? allEntries.find((e) => e.id === editingEntry.id) : null;

    if (resolvedEditing) {
      if (configKey !== resolvedEditing.keyword || mode !== resolvedEditing.mode) {
        // Capture the original file context before removal so the
        // re-insertion stays in the same source file (Bug 2 fix).
        const loc = resolveGlobalIndex(files, resolvedEditing.keyword, resolvedEditing.ordinal);
        removeEntry(resolvedEditing.keyword, resolvedEditing.ordinal);
        insertModeAwareBinding(
          files,
          insertEntry,
          configKey,
          value,
          mode,
          loc?.fileIdx,
        );
      } else {
        updateEntry(resolvedEditing.keyword, resolvedEditing.ordinal, value);
      }
    } else {
      // Remove conflicting entries before inserting to avoid duplicates.
      // Sort by (keyword, ordinal) descending so same-keyword removals don't
      // shift the indices of remaining conflicts.
      const byKeyword = new Map<string, typeof conflicts>();
      for (const c of conflicts) {
        const group = byKeyword.get(c.keyword) ?? [];
        group.push(c);
        byKeyword.set(c.keyword, group);
      }
      for (const [, group] of byKeyword) {
        group.sort((a, b) => b.ordinal - a.ordinal);
        for (const c of group) {
          removeEntry(c.keyword, c.ordinal);
        }
      }
      insertModeAwareBinding(files, insertEntry, configKey, value, mode);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl overflow-hidden p-0 shadow-2xl">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle>{editingEntry ? "Edit Shortcut" : "New Shortcut"}</DialogTitle>
          <DialogDescription>
            Define a keyboard combination and configure the action it triggers.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5 px-6 py-5 overflow-y-auto max-h-[70vh]">
          <KeyRecorder
            mods={selectedMods}
            capturedKey={key}
            onModsChange={setSelectedMods}
            onKeyChange={setKey}
          />

          <section className="flex flex-col gap-2">
            <SectionLabel>Trigger Action</SectionLabel>
            <Card>
              <div className="p-1">
                <ActionSelector
                  value={func}
                  onChange={(v) => {
                    setFunc(v);
                  }}
                />
              </div>
              {func && currentSchema.length > 0 && (
                <div className="animate-in fade-in slide-in-from-top-1">
                  {currentSchema.map((arg) => (
                    <DynamicArgField
                      key={arg.name}
                      arg={arg}
                      value={argValues[arg.name] ?? ""}
                      error={argErrors[arg.name] ?? null}
                      onChange={(v) => handleArgChange(arg.name, v)}
                    />
                  ))}
                </div>
              )}
            </Card>
          </section>

          {func === "switch_layout" && (
            <section className="flex flex-col gap-2">
              <SectionLabel>Layout Cycle</SectionLabel>
              <Card>
                <div className="flex items-center gap-3 px-4 py-3 bg-muted/5 border-b border-border/20">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <LayoutGridIcon className="size-4 shrink-0 text-muted-foreground/50" />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium leading-none text-foreground">
                        Cycle Order
                      </span>
                      <span className="text-xs text-muted-foreground/60 leading-snug">
                        Restrict which layouts switch_layout cycles through. Leave empty to cycle all layouts.
                      </span>
                    </div>
                  </div>
                </div>
                <LayoutToggleGroup />
              </Card>
            </section>
          )}

          <section className="flex flex-col gap-2">
            <SectionLabel>Context &amp; Flags</SectionLabel>
            <Card>
              <div className="flex items-center justify-between p-3.5 bg-muted/5">
                <div className="flex flex-col gap-0.5 pr-4">
                  <Label className="text-sm font-medium leading-none text-foreground">Mode</Label>
                  <span className="text-xs text-muted-foreground/60">
                    Restrict this binding to a specific submap context.
                  </span>
                </div>
                <div className="w-44">
                  <ModeCombobox value={mode} existingModes={existingModes} onChange={setMode} />
                </div>
              </div>

              <div className="flex items-center justify-between p-3.5">
                <div className="flex flex-col gap-0.5 pr-4">
                  <Label className="text-sm font-medium leading-none text-foreground">
                    Lockscreen Passthrough
                  </Label>
                  <span className="text-xs text-muted-foreground/60">
                    Execute while the system is locked.
                  </span>
                </div>
                <Switch
                  checked={flags.onLock}
                  onCheckedChange={(c) => setFlags({ ...flags, onLock: c })}
                />
              </div>

              <div className="flex items-center justify-between p-3.5">
                <div className="flex flex-col gap-0.5 pr-4">
                  <Label className="text-sm font-medium leading-none text-foreground">
                    Trigger on Release
                  </Label>
                  <span className="text-xs text-muted-foreground/60">
                    Wait until the key is lifted to execute.
                  </span>
                </div>
                <Switch
                  checked={flags.onRelease}
                  onCheckedChange={(c) => setFlags({ ...flags, onRelease: c })}
                />
              </div>

              <div className="flex items-center justify-between p-3.5">
                <div className="flex flex-col gap-0.5 pr-4">
                  <Label className="text-sm font-medium leading-none text-foreground">
                    Keysym-Only Match
                  </Label>
                  <span className="text-xs text-muted-foreground/60">
                    Match by keysym name only (binds). Useful when the key isn't in your keymap.
                  </span>
                </div>
                <Switch
                  checked={flags.symOnly}
                  onCheckedChange={(c) => setFlags({ ...flags, symOnly: c })}
                />
              </div>

              <div className="flex items-center justify-between p-3.5">
                <div className="flex flex-col gap-0.5 pr-4">
                  <Label className="text-sm font-medium leading-none text-foreground">
                    Pass Through
                  </Label>
                  <span className="text-xs text-muted-foreground/60">
                    Execute the action but also forward the key event to the focused client.
                  </span>
                </div>
                <Switch
                  checked={flags.pass}
                  onCheckedChange={(c) => setFlags({ ...flags, pass: c })}
                />
              </div>
            </Card>
          </section>
        </div>

        <div className="border-t border-border/30 bg-muted/20">
          {conflicts.length > 0 && (
            <div className="px-6 py-2.5 bg-destructive/10 border-b border-destructive/20 flex items-start gap-2.5 text-sm text-destructive">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <p className="leading-snug text-[13px]">
                <span className="font-semibold">Conflict{conflicts.length > 1 ? "s" : ""}:</span>{" "}
                {conflicts.slice(0, 3).map((c, i) => (
                  <span key={c.id}>
                    {i > 0 && ", "}
                    {c.mods}+{c.key} is bound to{" "}
                    <code className="font-mono bg-destructive/20 px-1 py-0.5 rounded text-xs font-bold">
                      {c.func}
                    </code>
                  </span>
                ))}
                {conflicts.length > 3 && (
                  <span> and {conflicts.length - 3} more</span>
                )}
                . Saving will replace the existing binding{conflicts.length > 1 ? "s" : ""}.
              </p>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 px-6 py-4">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              disabled={!key || !func || Object.values(argErrors).some(Boolean)}
              onClick={handleSubmit}
            >
              {editingEntry ? "Update Shortcut" : "Save Shortcut"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
