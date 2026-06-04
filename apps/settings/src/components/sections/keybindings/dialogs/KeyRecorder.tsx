import { useState, useEffect, useRef } from "react";
import { ChevronsUpDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  const captureBoxRef = useRef<HTMLDivElement>(null);
  const captureInputRef = useRef<HTMLInputElement>(null);
  const keyRecorder = useKeyRecorder(
    (combo) => {
      onKeyChange(combo.key);
      setIsRecording(false);
    },
  );

  useEffect(() => {
    if (isRecording && !isKeySearchOpen) {
      keyRecorder.start();
    } else {
      keyRecorder.cancel();
    }
  }, [isRecording, isKeySearchOpen, keyRecorder]);

  const [rawInput, setRawInput] = useState("");

  // Sync raw input when editing an existing code:NNN binding
  useEffect(() => {
    if (isRawKeycode(capturedKey)) {
      const code = parseRawKeycode(capturedKey);
      setRawInput(code !== null ? String(code) : "");
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

  return (
    <section className="flex flex-col gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/45">
        Combination
      </span>
      <input
        ref={captureInputRef}
        className="sr-only"
        aria-label="Key capture input"
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setIsRecording(false);
          } else {
            keyRecorder.handleKeyEvent(e.nativeEvent);
          }
        }}
        readOnly
      />

      <div
        ref={captureBoxRef}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-xl border py-6 transition-all cursor-pointer gap-4",
          isRecording
            ? "border-primary/50 bg-primary/5 ring-4 ring-primary/10"
            : "border-border/50 bg-muted/20 hover:border-border hover:bg-muted/40",
        )}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('[data-slot="popover-trigger"]')) return;
          setIsRecording(true);
          captureInputRef.current?.focus();
        }}
      >
        <div className="flex flex-col items-center gap-2.5">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40">
            Modifiers
          </span>
          <div className="flex flex-wrap justify-center items-center gap-2">
            {MODIFIER_ORDER.map((m) => (
              <button
                key={m}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMod(m);
                }}
                className={cn(
                  "flex items-center justify-center h-9 min-w-[3.5rem] rounded-lg border font-semibold tracking-widest select-none transition-all duration-100 text-[11px] uppercase px-3",
                  mods.includes(m)
                    ? "bg-primary text-primary-foreground border-primary/30 shadow-sm"
                    : "border-dashed border-muted-foreground/25 text-muted-foreground/45 bg-transparent hover:bg-muted/30 hover:border-muted-foreground/50 hover:text-muted-foreground/70",
                )}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center gap-2.5">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40">
            Key
          </span>
          <div className="flex items-center gap-0">
            {capturedKey ? (
              <div
                className={cn(
                  "relative flex h-11 items-center justify-center rounded-l-lg border border-r-0 px-3.5 transition-all cursor-pointer select-none font-sans font-bold tracking-widest text-sm group",
                  "border-border/50 bg-card",
                  isRecording
                    ? "border-primary/40 bg-primary/5"
                    : "hover:border-primary/30 hover:bg-primary/[0.03]",
                )}
                onClick={() => setIsRecording(true)}
                role="button"
                tabIndex={0}
              >
                <span>{xkbToDisplay(capturedKey)}</span>
                {!isRecording && (
                  <span className="ml-2 text-[9px] font-normal uppercase tracking-wider text-muted-foreground/25 transition-all group-hover:text-primary/60">
                    change
                  </span>
                )}
              </div>
            ) : (
              <div
                className={cn(
                  "flex h-11 min-w-[5.5rem] items-center justify-center rounded-l-lg border-2 border-r-0 px-3.5 transition-colors cursor-pointer select-none",
                  isRecording
                    ? "border-primary/40 bg-background/50"
                    : "border-border/50 bg-background/30 hover:bg-muted/30",
                )}
                onClick={() => setIsRecording(true)}
                role="button"
                tabIndex={0}
              >
                <span
                  className={cn(
                    "text-xs font-semibold tracking-widest uppercase",
                    isRecording
                      ? "animate-pulse text-primary/80"
                      : "text-muted-foreground/50",
                  )}
                >
                  {isRecording ? "Listening" : "No Key"}
                </span>
              </div>
            )}

            <Popover
              open={isKeySearchOpen}
              onOpenChange={(open) => {
                setIsKeySearchOpen(open);
              }}
            >
              <PopoverTrigger
                render={
                  <button
                    className={cn(
                      "flex items-center justify-center h-11 w-7 rounded-r-lg border transition-colors shrink-0",
                      capturedKey
                        ? "border-l-0 border-border/50 bg-card hover:bg-muted"
                        : "border-l-0 border-2",
                      isRecording && (capturedKey
                        ? "border-primary/40 bg-primary/5"
                        : "border-primary/40 bg-background/50"),
                    )}
                    onClick={(e) => e.stopPropagation()}
                    title="Choose from key list"
                  >
                    <ChevronsUpDown className="size-3.5 text-muted-foreground/40" />
                  </button>
                }
              />
              <PopoverContent
                className="w-64 p-0 rounded-xl shadow-lg border-border/50"
                align="center"
                sideOffset={6}
              >
                <Command className="border-0">
                  <CommandInput
                    placeholder="Search keys..."
                    className="h-10 text-sm border-none focus:ring-0"
                  />
                  <CommandList className="max-h-[220px]">
                    <CommandEmpty className="py-4 text-center text-xs text-muted-foreground">
                      No keys found.
                    </CommandEmpty>
                    {KEY_GROUPS.map((group) => (
                      <CommandGroup key={group.label} heading={group.label}>
                        {group.keys.map((k) => (
                          <CommandItem
                            key={k.name}
                            value={`${k.name} ${k.aliases?.join(" ")}`}
                            onSelect={() => {
                              onKeyChange(k.name);
                              setIsKeySearchOpen(false);
                            }}
                          >
                            <span className="font-mono text-sm">{k.name}</span>
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

        {!isRecording && !capturedKey && (
          <span className="text-[10px] text-muted-foreground/40">
            Click any area above or press a key to start
          </span>
        )}
      </div>

      {/* Raw keycode row — outside the capture box so clicks don't trigger recording */}
      <div className="flex items-center justify-between rounded-xl border border-border/50 bg-card px-4 py-3 shadow-sm">
        <div className="flex flex-col gap-0.5 pr-4">
          <span className="text-sm font-medium leading-none text-foreground">
            Raw keycode
          </span>
          <span className="text-xs text-muted-foreground/60">
            Alternative to pressing a key — enter a raw XKB keycode (8–255)
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-xs font-mono text-muted-foreground/50">code:</span>
          <Input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            min={8}
            max={255}
            value={rawInput}
            onChange={handleRawInputChange}
            placeholder="8–255"
            className="w-24 font-mono text-xs [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
        </div>
      </div>
    </section>
  );
}
