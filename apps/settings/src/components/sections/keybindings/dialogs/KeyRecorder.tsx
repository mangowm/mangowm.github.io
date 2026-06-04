import { useState, useEffect, useRef } from "react";
import { ChevronsUpDown, Plus, Settings2, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useKeyRecorder, KEY_GROUPS, xkbToDisplay } from "@/lib/keyboard";
import { MODIFIER_ORDER, isRawKeycode, parseRawKeycode } from "@/lib/keybind-parse";

interface KeyRecorderProps {
  mods: string[];
  capturedKey: string;
  onModsChange: (mods: string[]) => void;
  onKeyChange: (key: string) => void;
}

export function KeyRecorder({ mods, capturedKey, onModsChange, onKeyChange }: KeyRecorderProps) {
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
    if (isRawKeycode(capturedKey)) {
      const code = parseRawKeycode(capturedKey);
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
    if (!isRecording) {
      setIsRecording(true);
      captureInputRef.current?.focus();
    }
  };

  const renderKeyEquation = () => {
    const activeMods = MODIFIER_ORDER.filter((m) => mods.includes(m));

    return (
      <div className="flex flex-wrap items-center justify-center gap-2.5 w-full min-h-[4rem]">
        {activeMods.map((m) => (
          <div key={m} className="flex items-center gap-2.5 animate-in zoom-in duration-200">
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
              <span className="absolute inset-0 flex items-center justify-center text-destructive-foreground translate-y-8 transition-transform duration-200 group-hover:translate-y-0">
                <X className="size-4" strokeWidth={3} />
              </span>
            </button>
            <Plus className="size-3.5 text-muted-foreground/40" />
          </div>
        ))}

        <div className="relative group flex items-center shadow-sm">
          {capturedKey ? (
            <kbd
              onClick={() => setIsRecording(true)}
              className={cn(
                "flex h-10 items-center justify-center rounded-l-lg border-y-2 border-l-2 border-b-4 px-5 font-mono text-base font-black uppercase tracking-widest transition-all cursor-pointer",
                isRecording
                  ? "border-primary bg-primary/10 text-primary animate-pulse border-solid"
                  : isRawKeycode(capturedKey)
                    ? "border-amber-500/30 bg-amber-500/10 text-amber-600 hover:border-amber-500/50 hover:bg-amber-500/20"
                    : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-muted",
              )}
            >
              {isRawKeycode(capturedKey) ? capturedKey : xkbToDisplay(capturedKey)}
            </kbd>
          ) : (
            <kbd
              onClick={() => setIsRecording(true)}
              className={cn(
                "flex h-10 min-w-[7rem] items-center justify-center rounded-l-lg border-y-2 border-l-2 border-dashed px-4 font-sans text-[11px] font-bold uppercase tracking-widest transition-all cursor-pointer",
                isRecording
                  ? "border-primary/60 bg-primary/5 text-primary shadow-[0_0_15px_rgba(var(--primary),0.2)] animate-pulse"
                  : "border-muted-foreground/30 bg-muted/10 text-muted-foreground/50 hover:border-primary/40 hover:bg-muted/30",
              )}
            >
              {isRecording ? "Listening..." : "Press Key"}
            </kbd>
          )}

          <Popover open={isKeySearchOpen} onOpenChange={setIsKeySearchOpen}>
            <PopoverTrigger
              className={cn(
                "flex h-10 w-8 items-center justify-center rounded-r-lg border-y-2 border-r-2 border-b-4 transition-all z-10",
                capturedKey
                  ? isRawKeycode(capturedKey)
                    ? "border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/20 text-amber-600/70"
                    : "border-border bg-card hover:bg-muted text-muted-foreground/60"
                  : "border-dashed border-muted-foreground/30 bg-muted/10 hover:bg-muted/30 hover:border-primary/40",
                isRecording && "border-primary/60 bg-primary/5 border-solid",
              )}
              title="Search Keys"
            >
              <ChevronsUpDown className="size-3.5" />
            </PopoverTrigger>
            <PopoverContent
              className="w-64 p-0 rounded-xl shadow-2xl border-border"
              align="end"
              sideOffset={8}
            >
              <Command className="border-0">
                <CommandInput
                  placeholder="Search keys (e.g., Space)..."
                  className="h-10 text-sm border-none focus:ring-0"
                />
                <CommandList className="max-h-[200px] scrollbar-thin">
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
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    );
  };

  return (
    <section className="flex flex-col w-full rounded-xl border border-border/50 bg-background shadow-sm overflow-hidden transition-all duration-300 focus-within:border-primary/40 focus-within:shadow-md">
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

      <div
        className={cn(
          "relative flex flex-col p-4 transition-colors duration-500 ease-out cursor-pointer",
          isRecording ? "bg-primary/[0.02]" : "bg-transparent hover:bg-muted/5",
        )}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('[data-slot="popover-trigger"]')) return;
          setIsRecording(true);
          captureInputRef.current?.focus();
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowRawInput(!showRawInput);
            }}
            className={cn(
              "p-1 rounded-md transition-colors",
              showRawInput
                ? "bg-primary/10 text-primary"
                : "hover:bg-muted text-muted-foreground/50 hover:text-foreground",
            )}
            title="Toggle Raw Keycode Input"
          >
            <Settings2 className="size-3.5" />
          </button>
        </div>

        <div className="py-1">{renderKeyEquation()}</div>

        <div className="mt-5 flex flex-col items-center gap-2.5">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40">
            Available Modifiers
          </span>
          <div className="flex flex-wrap justify-center gap-1.5">
            {MODIFIER_ORDER.filter((m) => !mods.includes(m)).map((m) => (
              <button
                key={m}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMod(m);
                }}
                className="flex h-7 items-center justify-center rounded-md border border-dashed border-muted-foreground/30 bg-transparent px-2.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
              >
                + {m}
              </button>
            ))}
            {MODIFIER_ORDER.every((m) => mods.includes(m)) && (
              <span className="text-xs text-muted-foreground/30 italic">All modifiers active</span>
            )}
          </div>
        </div>
      </div>

      <div
        className={cn(
          "grid transition-all duration-300 ease-in-out bg-muted/20",
          showRawInput
            ? "grid-rows-[1fr] opacity-100 border-t border-border/50"
            : "grid-rows-[0fr] opacity-0 border-t-0",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold text-foreground tracking-wide">
                Raw XKB Code
              </span>
              <span className="text-[10px] text-muted-foreground/60">
                Override with a system code
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-background border border-border/50 rounded-md pl-2 focus-within:ring-2 focus-within:ring-primary/20 shadow-sm">
              <span className="text-[11px] font-mono font-medium text-muted-foreground/50">
                code:
              </span>
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={rawInput}
                onChange={handleRawInputChange}
                placeholder="91"
                className="w-16 h-7 border-none bg-transparent shadow-none focus-visible:ring-0 font-mono text-xs px-1 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
