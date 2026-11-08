import { useState, useEffect, useRef } from "react";
import { ChevronsUpDown, Plus, Settings2, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@mangowm/ui/components/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@mangowm/ui/components/command";
import { cn } from "cn";
import { Input } from "@mangowm/ui/components/input";
import { useKeyRecorder, KEY_GROUPS, xkbToDisplay } from "@/lib/keyboard";
import { MODIFIER_ORDER, isRawCode, parseRawCode } from "@/lib/keybind-parse";
import { ModPills } from "../components/ModPills";

export interface PickerOption {
  label: string;
  value: string;
}

interface KeyRecorderProps {
  mods: string[];
  capturedKey: string;
  onModsChange: (mods: string[]) => void;
  onKeyChange: (key: string) => void;
  /** When provided, switches to picker mode: no recording, shows these options in the popover. */
  pickerOptions?: PickerOption[];
  /** Placeholder shown in the trigger badge when no value is selected (picker mode). */
  pickerPlaceholder?: string;
  /** Show the raw XKB code gear toggle and input section in picker mode. */
  allowRawCode?: boolean;
  /** Show the ModPills section (modifier toggles). Only editable types should show it. */
  showMods?: boolean;
}

export function KeyRecorder({
  mods,
  capturedKey,
  onModsChange,
  onKeyChange,
  pickerOptions,
  pickerPlaceholder = "Select...",
  allowRawCode = false,
  showMods = true,
}: KeyRecorderProps) {
  const isPicker = !!pickerOptions;
  const [isRecording, setIsRecording] = useState(false);
  const [isKeySearchOpen, setIsKeySearchOpen] = useState(false);
  const [showRawInput, setShowRawInput] = useState(false);
  const captureInputRef = useRef<HTMLInputElement>(null);

  const keyRecorder = useKeyRecorder((combo) => {
    onKeyChange(combo.key);
    setIsRecording(false);
  });

  useEffect(() => {
    if (isRecording && !isKeySearchOpen) {
      keyRecorder.start();
    } else {
      keyRecorder.cancel();
    }
  }, [isRecording, isKeySearchOpen, keyRecorder]);

  const [rawInput, setRawInput] = useState("");

  useEffect(() => {
    if (isRawCode(capturedKey)) {
      const code = parseRawCode(capturedKey);
      setRawInput(code !== null ? String(code) : "");
      setShowRawInput(true);
    } else {
      setRawInput("");
    }
  }, [capturedKey]);

  const handleRawInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setRawInput(val);
    onKeyChange(val ? `code:${val}` : "");
  };

  const toggleMod = (m: string) => {
    onModsChange(mods.includes(m) ? mods.filter((x) => x !== m) : [...mods, m]);
  };

  const triggerLabel = pickerOptions
    ? (pickerOptions.find((o) => o.value === capturedKey)?.label ?? capturedKey)
    : isRawCode(capturedKey)
      ? capturedKey
      : xkbToDisplay(capturedKey);

  const handleTriggerClick = () => {
    if (isPicker) {
      setIsKeySearchOpen(true);
    } else {
      setIsRecording(true);
    }
  };

  const renderPickerContent = () => {
    if (!pickerOptions) {
      return (
        <>
          <CommandInput
            placeholder="Search keys (e.g., Space)..."
            className="h-10 border-none text-sm focus:ring-0"
          />
          <CommandList className="scrollbar-thin max-h-[200px]">
            <CommandEmpty className="py-4 text-center text-sm text-muted-foreground">
              No keys found.
            </CommandEmpty>
            {KEY_GROUPS.map((group) => (
              <CommandGroup
                key={group.label}
                heading={group.label}
                className="text-muted-foreground/70"
              >
                {group.keys.map((k) => (
                  <CommandItem
                    key={k.name}
                    value={`${k.name} ${k.aliases?.join(" ")}`}
                    onSelect={() => {
                      onKeyChange(k.name);
                      setIsKeySearchOpen(false);
                    }}
                    className="cursor-pointer"
                  >
                    <span className="font-mono text-sm font-medium">{k.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </>
      );
    }

    return (
      <>
        <CommandInput placeholder="Search..." className="h-10 border-none text-sm focus:ring-0" />
        <CommandList className="scrollbar-thin max-h-[200px]">
          <CommandEmpty className="py-4 text-center text-sm text-muted-foreground">
            No options found.
          </CommandEmpty>
          <CommandGroup>
            {pickerOptions.map((opt) => (
              <CommandItem
                key={opt.value}
                value={`${opt.label} ${opt.value}`}
                onSelect={() => {
                  onKeyChange(opt.value);
                  setIsKeySearchOpen(false);
                }}
                className="cursor-pointer"
              >
                <span className="text-sm">{opt.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </>
    );
  };

  const renderKeyEquation = () => {
    const activeMods = MODIFIER_ORDER.filter((m) => mods.includes(m));

    return (
      <div className="flex min-h-[4rem] w-full flex-wrap items-center justify-center gap-2.5">
        {activeMods.map((m) => (
          <div
            key={m}
            className="flex animate-in items-center gap-2.5 duration-200 zoom-in motion-reduce:animate-none"
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleMod(m);
              }}
              className="group relative flex h-10 min-w-[3.5rem] items-center justify-center overflow-hidden rounded-lg border-b-4 border-primary/20 bg-primary px-3 font-mono text-xs font-bold uppercase shadow-sm transition-all hover:-translate-y-0.5 hover:border-destructive/30 hover:bg-destructive hover:shadow-destructive/20"
              title={`Remove ${m}`}
            >
              <span className="text-primary-foreground transition-transform duration-200 group-hover:-translate-y-8">
                {m}
              </span>
              <span className="absolute inset-0 flex translate-y-8 items-center justify-center text-destructive-foreground transition-transform duration-200 group-hover:translate-y-0">
                <X className="size-4" strokeWidth={3} />
              </span>
            </button>
            <Plus className="size-3.5 text-muted-foreground/40" />
          </div>
        ))}

        <div className="group relative flex items-center shadow-sm">
          {capturedKey ? (
            <kbd
              onClick={handleTriggerClick}
              className={cn(
                "flex h-10 cursor-pointer items-center justify-center rounded-l-lg border-y-2 border-b-4 border-l-2 px-5 font-mono text-base font-black tracking-widest uppercase transition-all",
                isRecording
                  ? "animate-pulse border-solid border-primary bg-primary/10 text-primary motion-reduce:animate-none"
                  : isRawCode(capturedKey) && !isPicker
                    ? "border-amber-500/30 bg-amber-500/10 text-amber-600 hover:border-amber-500/50 hover:bg-amber-500/20"
                    : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-muted",
              )}
            >
              {triggerLabel}
            </kbd>
          ) : (
            <kbd
              onClick={handleTriggerClick}
              className={cn(
                "flex h-10 min-w-[7rem] cursor-pointer items-center justify-center rounded-l-lg border-y-2 border-l-2 border-dashed px-4 font-sans text-[11px] font-bold tracking-widest uppercase transition-all",
                isRecording
                  ? "animate-pulse border-primary/60 bg-primary/5 text-primary shadow-[0_0_15px_rgba(var(--primary),0.2)] motion-reduce:animate-none"
                  : "border-muted-foreground/30 bg-muted/10 text-muted-foreground/50 hover:border-primary/40 hover:bg-muted/30",
              )}
            >
              {isRecording ? "Listening..." : pickerOptions ? pickerPlaceholder : "Press Key"}
            </kbd>
          )}

          <Popover open={isKeySearchOpen} onOpenChange={setIsKeySearchOpen}>
            <PopoverTrigger
              className={cn(
                "z-10 flex h-10 w-8 items-center justify-center rounded-r-lg border-y-2 border-r-2 border-b-4 transition-all",
                capturedKey
                  ? isRawCode(capturedKey) && !isPicker
                    ? "border-amber-500/30 bg-amber-500/5 text-amber-600/70 hover:bg-amber-500/20"
                    : "border-border bg-card text-muted-foreground/60 hover:bg-muted"
                  : "border-dashed border-muted-foreground/30 bg-muted/10 hover:border-primary/40 hover:bg-muted/30",
                isRecording && "border-solid border-primary/60 bg-primary/5",
              )}
              title="Search"
            >
              <ChevronsUpDown className="size-3.5" />
            </PopoverTrigger>
            <PopoverContent
              className="w-64 rounded-xl border-border p-0 shadow-2xl"
              align="end"
              sideOffset={8}
            >
              <Command className="border-0">{renderPickerContent()}</Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    );
  };

  return (
    <section className="flex w-full flex-col overflow-hidden rounded-xl border border-border/50 bg-background shadow-sm transition-all duration-300 focus-within:border-primary/40 focus-within:shadow-md">
      {!isPicker && (
        <input
          ref={captureInputRef}
          className="sr-only"
          aria-label="Key capture input"
          onKeyDown={(e) => {
            if (e.key === "Escape") setIsRecording(false);
            else keyRecorder.handleKeyEvent(e.nativeEvent);
          }}
          readOnly
        />
      )}

      <div
        className={cn(
          "relative flex flex-col p-4 transition-colors duration-500 ease-out",
          !isPicker && "cursor-pointer",
          isPicker ? "" : isRecording ? "bg-primary/[0.02]" : "hover:bg-muted/5",
        )}
        onClick={
          isPicker
            ? undefined
            : (e) => {
                if ((e.target as HTMLElement).closest('[data-slot="popover-trigger"]')) return;
                setIsRecording(true);
                captureInputRef.current?.focus();
              }
        }
      >
        {(!isPicker || allowRawCode) && (
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowRawInput(!showRawInput);
              }}
              className={cn(
                "rounded-md p-1 transition-colors",
                showRawInput
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground/50 hover:bg-muted hover:text-foreground",
              )}
              title="Toggle Raw Keycode Input"
            >
              <Settings2 className="size-3.5" />
            </button>
          </div>
        )}

        <div className="py-1">{renderKeyEquation()}</div>

        {showMods && (
          <div className="mt-5 flex flex-col items-center gap-2.5">
            <span className="text-[10px] font-semibold tracking-widest text-muted-foreground/40 uppercase">
              Modifiers
            </span>
            <ModPills selected={mods} onChange={(m) => onModsChange(m)} />
          </div>
        )}
      </div>

      {(!isPicker || allowRawCode) && (
        <div
          className={cn(
            "grid bg-muted/20 transition-all duration-300 ease-in-out",
            showRawInput
              ? "grid-rows-[1fr] border-t border-border/50 opacity-100"
              : "grid-rows-[0fr] border-t-0 opacity-0",
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold tracking-wide text-foreground">
                  Raw XKB Code
                </span>
                <span className="text-[10px] text-muted-foreground/60">
                  Override with a system code
                </span>
              </div>
              <div className="flex items-center gap-1.5 rounded-md border border-border/50 bg-background pl-2 shadow-sm focus-within:ring-2 focus-within:ring-primary/20">
                <span className="font-mono text-[11px] font-medium text-muted-foreground/50">
                  code:
                </span>
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={rawInput}
                  onChange={handleRawInputChange}
                  placeholder="91"
                  className="h-7 w-16 [appearance:textfield] border-none bg-transparent px-1 font-mono text-xs shadow-none focus-visible:ring-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
