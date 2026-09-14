import { useState, useEffect } from "react";
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
import {
  LayoutGridIcon,
  Zap,
  Settings2,
  ShieldAlert,
  ChevronDown,
  Keyboard,
  MousePointer2,
  Move,
  FlipHorizontal,
  Hand,
} from "lucide-react";
import {
  bindKeyFromFlags,
  parseModifiers,
  serializeModifiers,
  insertModeAwareBinding,
  serializeBinding,
  TYPE_TO_KEYWORD,
} from "@/lib/keybind-parse";
import { resolveGlobalIndex } from "@/lib/config-store";
import {
  DISPATCHER_MAP,
  parseArgValues,
  serializeArgValues,
  validateAllArgs,
} from "@/lib/dispatchers";
import type { Keybinding, KeybindFlags, BindingType } from "@/lib/keybind-types";
import type { SourceFile } from "@/lib/config-types";
import { useConflictCheck } from "../hooks/useConflictCheck";
import { ActionSelector } from "./ActionSelector";
import { DynamicArgField } from "./DynamicArgField";
import { ModeCombobox } from "./ModeCombobox";
import { LayoutToggleGroup } from "./LayoutToggleGroup";
import { ComboInput } from "../components/ComboInput";
import { cn } from "@/lib/utils";

const TYPE_OPTIONS: { type: BindingType; label: string; icon: React.ReactNode }[] = [
  { type: "keyboard", label: "Keyboard", icon: <Keyboard className="size-3.5" /> },
  { type: "mouse", label: "Mouse", icon: <MousePointer2 className="size-3.5" /> },
  { type: "axis", label: "Scroll", icon: <Move className="size-3.5" /> },
  { type: "switch", label: "Lid Switch", icon: <FlipHorizontal className="size-3.5" /> },
  { type: "gesture", label: "Gesture", icon: <Hand className="size-3.5" /> },
];

function SectionLabel({
  children,
  icon: Icon,
}: {
  children: React.ReactNode;
  icon?: React.ElementType;
}) {
  return (
    <div className="flex items-center gap-1.5 px-1 mb-1">
      {Icon && <Icon className="size-3.5 text-primary/70" />}
      <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60">
        {children}
      </span>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/40 bg-card/50 shadow-sm overflow-hidden divide-y divide-border/20 backdrop-blur-sm">
      {children}
    </div>
  );
}

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
  const [bindingType, setBindingType] = useState<BindingType>("keyboard");
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
    allowConflict: false,
  });
  const [fingers, setFingers] = useState("3");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const isKeyboard = bindingType === "keyboard";

  useEffect(() => {
    if (!open) return;

    if (editingEntry) {
      setBindingType(editingEntry.type);
      setSelectedMods(parseModifiers(editingEntry.mods));
      setKey(editingEntry.key);
      setFunc(editingEntry.func);
      setArgs(editingEntry.args ?? "");
      setFingers(editingEntry.fingers || "3");
      setMode(editingEntry.mode);
      setFlags({ ...editingEntry.flags });

      setShowAdvanced(
        editingEntry.type === "keyboard" &&
          (editingEntry.flags.symOnly ||
            editingEntry.flags.onLock ||
            editingEntry.flags.onRelease ||
            editingEntry.flags.pass ||
            editingEntry.flags.allowConflict),
      );
    } else {
      setBindingType("keyboard");
      setSelectedMods([]);
      setKey("");
      setFunc("");
      setArgs("");
      setFingers("3");
      setMode("default");
      setFlags({
        symOnly: false,
        onLock: false,
        onRelease: false,
        pass: false,
        allowConflict: false,
      });
      setArgErrors({});
      setShowAdvanced(false);
    }
  }, [open, editingEntry]);

  const configKey = isKeyboard ? bindKeyFromFlags(flags) : TYPE_TO_KEYWORD[bindingType];

  const modString = serializeModifiers(selectedMods);

  const conflicts = useConflictCheck(
    isKeyboard ? allEntries : [],
    mode,
    modString,
    key,
    editingEntry?.id,
    flags.allowConflict,
  );

  const currentSchema = DISPATCHER_MAP.get(func)?.args ?? [];
  const argValues = parseArgValues(args, currentSchema);

  const handleArgChange = (argName: string, value: string) => {
    const nextArgValues = { ...argValues, [argName]: value };
    setArgs(serializeArgValues(nextArgValues, currentSchema));
    const err = validateAllArgs(nextArgValues, currentSchema);
    setArgErrors((prev) =>
      err[argName] !== prev[argName] ? { ...prev, [argName]: err[argName] ?? null } : prev,
    );
  };

  const handleSubmit = () => {
    if (!key.trim() || !func.trim()) return;

    if (bindingType === "gesture") {
      if (!/^\d+$/.test(fingers) || parseInt(fingers, 10) < 1) {
        return;
      }
    }

    const errors = validateAllArgs(argValues, currentSchema);
    setArgErrors(errors);
    if (Object.values(errors).some(Boolean)) return;

    const binding: Keybinding = {
      id: "",
      keyword: configKey,
      ordinal: 0,
      type: bindingType,
      mods: modString,
      key: key.trim(),
      func: func.trim(),
      args: args.trim(),
      mode,
      flags: isKeyboard
        ? flags
        : { symOnly: false, onLock: false, onRelease: false, pass: false, allowConflict: false },
      fingers: bindingType === "gesture" ? fingers || "3" : "",
    };

    const value = serializeBinding(binding);
    const resolvedEditing = editingEntry ? allEntries.find((e) => e.id === editingEntry.id) : null;

    if (resolvedEditing) {
      if (configKey === resolvedEditing.keyword && mode === resolvedEditing.mode) {
        updateEntry(resolvedEditing.keyword, resolvedEditing.ordinal, value);
      } else {
        const loc = resolveGlobalIndex(files, resolvedEditing.keyword, resolvedEditing.ordinal);
        removeEntry(resolvedEditing.keyword, resolvedEditing.ordinal);
        insertModeAwareBinding(files, insertEntry, configKey, value, mode, loc?.fileIdx);
      }
    } else {
      // With allow-conflict enabled the new binding coexists with same-key
      // bindings (mango keeps both); otherwise save replaces the conflicts.
      if (isKeyboard && !flags.allowConflict) {
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
      }
      insertModeAwareBinding(files, insertEntry, configKey, value, mode);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl overflow-hidden p-0 shadow-2xl border-border/60 bg-background/95 backdrop-blur-md flex flex-col max-h-[90vh]">
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-border/30 bg-muted/20 shrink-0">
          <DialogTitle className="text-lg tracking-tight">
            {editingEntry ? "Edit Binding" : "New Binding"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {editingEntry
              ? "Change the trigger or action."
              : "Choose what kind of binding, the trigger, and the action it runs."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5 px-5 py-5 overflow-y-auto scrollbar-thin">
          <section className="flex flex-col gap-2 shrink-0">
            <SectionLabel>Binding Type</SectionLabel>
            <div className="flex items-center gap-1.5 flex-wrap">
              {TYPE_OPTIONS.map(({ type, label, icon }) => {
                const active = bindingType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    disabled={!!editingEntry}
                    onClick={() => {
                      setBindingType(type);
                      setKey("");
                      setSelectedMods(type === "switch" ? [] : selectedMods);
                    }}
                    className={cn(
                      "flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-all",
                      active
                        ? "border-primary/40 bg-primary/10 text-primary shadow-sm"
                        : "border-border/50 text-muted-foreground/70 hover:border-primary/30 hover:text-primary hover:bg-primary/5",
                      editingEntry && "opacity-60 cursor-not-allowed",
                    )}
                  >
                    {icon}
                    {label}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="flex flex-col gap-2 shrink-0">
            <SectionLabel icon={bindingType === "keyboard" ? undefined : Zap}>
              {bindingType === "keyboard"
                ? "Key Combination"
                : bindingType === "mouse"
                  ? "Mouse Button"
                  : bindingType === "axis"
                    ? "Scroll Direction"
                    : bindingType === "switch"
                      ? "Lid Event"
                      : "Gesture"}
            </SectionLabel>

            <ComboInput
              type={bindingType}
              mods={selectedMods}
              onModsChange={setSelectedMods}
              trigger={key}
              onTriggerChange={setKey}
              fingers={fingers}
              onFingersChange={setFingers}
            />
          </section>

          <section className="flex flex-col gap-2 shrink-0 relative z-10">
            <SectionLabel icon={Zap}>Trigger Action</SectionLabel>
            <div className="flex flex-col gap-2">
              <ActionSelector
                value={func}
                onChange={(v) => {
                  setFunc(v);
                }}
              />

              {func && currentSchema.length > 0 && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="rounded-xl border border-border/40 bg-card shadow-sm overflow-hidden flex flex-col">
                    <div className="bg-muted/30 px-3 py-1.5 border-b border-border/30">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                        Action Parameters
                      </span>
                    </div>
                    <div className="flex flex-col divide-y divide-border/20">
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
                  </div>
                </div>
              )}
            </div>
          </section>

          {isKeyboard && func === "switch_layout" && (
            <section className="flex flex-col gap-2 shrink-0">
              <SectionLabel icon={LayoutGridIcon}>Layout Cycle</SectionLabel>
              <Card>
                <div className="flex items-center gap-3 px-4 py-3 bg-muted/5 border-b border-border/20">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1.5 bg-primary/10 rounded-md text-primary">
                      <LayoutGridIcon className="size-3.5 shrink-0" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[13px] font-medium leading-none text-foreground">
                        Cycle Order
                      </span>
                      <span className="text-[11px] text-muted-foreground/70 leading-snug">
                        Restrict which layouts switch_layout cycles through.
                      </span>
                    </div>
                  </div>
                </div>
                <LayoutToggleGroup />
              </Card>
            </section>
          )}

          <section className="flex flex-col gap-2 shrink-0">
            <SectionLabel icon={Settings2}>Mode</SectionLabel>
            <Card>
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex flex-col gap-1 pr-4">
                  <Label className="text-[13px] font-medium leading-none text-foreground">
                    Mode
                  </Label>
                  <span className="text-[11px] text-muted-foreground/70">
                    Restrict this binding to a specific context (keymode). Bindings in{" "}
                    <span className="font-mono text-muted-foreground">common</span> apply in every
                    mode.
                  </span>
                </div>
                <div className="w-40">
                  <ModeCombobox value={mode} existingModes={existingModes} onChange={setMode} />
                </div>
              </div>
            </Card>
          </section>

          {isKeyboard && (
            <section className="flex flex-col shrink-0 mt-2">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center justify-between w-full p-2 -mx-2 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <div className="flex items-center gap-1.5">
                  <Settings2 className="size-3.5 text-primary/70" />
                  <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80 group-hover:text-foreground transition-colors">
                    Advanced Flags
                  </span>
                </div>
                <ChevronDown
                  className={cn(
                    "size-4 text-muted-foreground/50 transition-transform duration-300",
                    showAdvanced && "rotate-180",
                  )}
                />
              </button>

              <div
                className={cn(
                  "grid transition-all duration-300 ease-in-out",
                  showAdvanced ? "grid-rows-[1fr] opacity-100 pt-2" : "grid-rows-[0fr] opacity-0",
                )}
              >
                <div className="overflow-hidden">
                  <Card>
                    <div className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-muted/10 border-b border-border/20">
                      <div className="flex flex-col gap-1 pr-4">
                        <Label className="text-[13px] font-medium leading-none text-foreground">
                          Lockscreen Passthrough
                        </Label>
                        <span className="text-[11px] text-muted-foreground/70">
                          Execute while the system is locked.
                        </span>
                      </div>
                      <Switch
                        checked={flags.onLock}
                        onCheckedChange={(c) => setFlags({ ...flags, onLock: c })}
                      />
                    </div>

                    <div className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-muted/10 border-b border-border/20">
                      <div className="flex flex-col gap-1 pr-4">
                        <Label className="text-[13px] font-medium leading-none text-foreground">
                          Symbol Only Match
                        </Label>
                        <span className="text-[11px] text-muted-foreground/70">
                          Ignore keyboard layouts and strictly match the keysym.
                        </span>
                      </div>
                      <Switch
                        checked={flags.symOnly}
                        onCheckedChange={(c) => setFlags({ ...flags, symOnly: c })}
                      />
                    </div>

                    <div className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-muted/10 border-b border-border/20">
                      <div className="flex flex-col gap-1 pr-4">
                        <Label className="text-[13px] font-medium leading-none text-foreground">
                          Trigger on Release
                        </Label>
                        <span className="text-[11px] text-muted-foreground/70">
                          Execute the action when the key is released instead of pressed.
                        </span>
                      </div>
                      <Switch
                        checked={flags.onRelease}
                        onCheckedChange={(c) => setFlags({ ...flags, onRelease: c })}
                      />
                    </div>

                    <div className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-muted/10">
                      <div className="flex flex-col gap-1 pr-4">
                        <Label className="text-[13px] font-medium leading-none text-foreground">
                          Pass to Application
                        </Label>
                        <span className="text-[11px] text-muted-foreground/70">
                          Allow the currently focused window to also receive this keypress.
                        </span>
                      </div>
                      <Switch
                        checked={flags.pass}
                        onCheckedChange={(c) => setFlags({ ...flags, pass: c })}
                      />
                    </div>

                    <div className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-muted/10">
                      <div className="flex flex-col gap-1 pr-4">
                        <Label className="text-[13px] font-medium leading-none text-foreground">
                          Allow Conflicts
                        </Label>
                        <span className="text-[11px] text-muted-foreground/70">
                          Let this binding coexist with other bindings on the same key — all
                          matching bindings fire together. Startup conflict warnings are suppressed
                          only when the other conflicting binding also has this enabled.
                        </span>
                      </div>
                      <Switch
                        checked={flags.allowConflict}
                        onCheckedChange={(c) => setFlags({ ...flags, allowConflict: c })}
                      />
                    </div>
                  </Card>
                </div>
              </div>
            </section>
          )}
        </div>

        <div className="border-t border-border/40 bg-muted/20 shrink-0">
          {conflicts.length > 0 && (
            <div className="px-5 py-3 bg-destructive/10 border-b border-destructive/20 flex items-start gap-2.5 text-xs text-destructive">
              <ShieldAlert className="size-4 shrink-0 mt-0.5 text-destructive/80" />
              <p className="leading-relaxed">
                <span className="font-bold">Conflict{conflicts.length > 1 ? "s" : ""}:</span>{" "}
                {conflicts.slice(0, 3).map((c, i) => (
                  <span key={c.id}>
                    {i > 0 && ", "}
                    {c.mods}+{c.key} is bound to{" "}
                    <code className="font-mono bg-destructive/20 px-1 py-0.5 rounded-sm font-bold tracking-tight">
                      {c.func}
                    </code>
                  </span>
                ))}
                {conflicts.length > 3 && <span> and {conflicts.length - 3} more</span>}. Saving will
                replace existing.
              </p>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 px-5 py-3.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="hover:bg-muted/50"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!key || !func || Object.values(argErrors).some(Boolean)}
              onClick={handleSubmit}
              className="shadow-md transition-transform active:scale-95"
            >
              {editingEntry ? "Update Binding" : "Save Binding"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
