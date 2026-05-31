import { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
import { HexAlphaColorPicker } from "react-colorful";
import { useConfigStore } from "@/lib/config-store";
import { toHex, toCss, formatColor } from "@/lib/color-utils";
import type { ColorMode } from "@/lib/color-utils";
import type { MangoConfigKey } from "@/lib/config-types";

export const defaultConfig = {
  rootcolor: "0x201b14ff",
  bordercolor: "0x444444ff",
  dropcolor: "0x8FBA7C55",
  splitcolor: "0xEB441EFF",
  focuscolor: "0xc9b890ff",
  maximizescreencolor: "0x89aa61ff",
  urgentcolor: "0xad401fff",
  scratchpadcolor: "0x516c93ff",
  globalcolor: "0xb153a7ff",
  overlaycolor: "0x14a57cff",
};

export type AppearanceConfig = typeof defaultConfig;

const APPEARANCE_FIELDS: Array<{
  key: keyof AppearanceConfig;
  label: string;
  description: string;
}> = [
  { key: "rootcolor", label: "Root Background", description: "Desktop background behind all windows" },
  { key: "bordercolor", label: "Inactive Border", description: "Unfocused window border (non-selected monitor)" },
  { key: "focuscolor", label: "Active Border", description: "Focused window border on the selected monitor" },
  { key: "maximizescreencolor", label: "Maximize Screen", description: "Border when window is focused + maximized" },
  { key: "urgentcolor", label: "Urgent", description: "Urgent window border — overrides all other colors" },
  { key: "scratchpadcolor", label: "Scratchpad", description: "Border when focused + scratchpad window" },
  { key: "globalcolor", label: "Global", description: "Border when focused + toggleglobal window" },
  { key: "overlaycolor", label: "Overlay", description: "Border when focused + toggleoverlay window" },
  { key: "dropcolor", label: "Drop Shadow", description: "Drop-shadow rectangle when dragging floating windows" },
  { key: "splitcolor", label: "Split Indicator", description: "Dwindle manual-split guide line" },
];

const COLOR_MODES: ColorMode[] = ["hex", "rgb", "hsl"];

function readTheme(data: Record<string, string[]>): AppearanceConfig {
  return APPEARANCE_FIELDS.reduce(
    (theme, field) => {
      const values = data[field.key as MangoConfigKey];
      if (values?.[0]) theme[field.key] = values[0];
      return theme;
    },
    { ...defaultConfig },
  );
}

interface ColorInputProps {
  label: string;
  description: string;
  value: string;
  mode: ColorMode;
  flipPopover: boolean;
  onChange: (value: string) => void;
}

const ColorInput = memo(function ColorInput({
  label,
  description,
  value,
  mode,
  flipPopover,
  onChange,
}: ColorInputProps) {
  const cssValue = toCss(value);
  const [isOpen, setIsOpen] = useState(false);
  const [displayValue, setDisplayValue] = useState(() => formatColor(value, mode));
  const [isFocused, setIsFocused] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDisplayValue(formatColor(value, mode));
  }, [value, mode]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const commitTextChange = () => {
    onChange(toHex(displayValue, value));
    setIsFocused(false);
  };

  const pick = (cssHex: string) => {
    const hex = toHex(cssHex, value);
    setDisplayValue(formatColor(hex, mode));
    onChange(hex);
  };

  const alphaHex = value.slice(-2);
  const alpha = Math.round((parseInt(alphaHex, 16) / 255) * 100);
  const isTranslucent = alpha < 100;

  const popoverPosition = flipPopover
    ? "bottom-[calc(100%+8px)] top-auto"
    : "top-[calc(100%+8px)]";

  return (
    <div className="group relative flex items-center gap-3 px-4 py-3 transition-colors duration-150 hover:bg-muted/20">
      <div className="absolute left-0 top-0 h-full w-[2px] scale-y-0 rounded-full bg-ring/60 transition-transform duration-200 group-hover:scale-y-100" />

      <div className="relative shrink-0" ref={popoverRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="relative size-8 cursor-pointer rounded-md p-0 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
          aria-label={`Edit ${label} color`}
        >
          {isTranslucent && (
            <div
              className="absolute inset-0 rounded-[5px]"
              style={{
                backgroundImage: "repeating-conic-gradient(#808080 0% 25%, transparent 0% 50%)",
                backgroundSize: "8px 8px",
              }}
            />
          )}
          <div
            className="absolute inset-0 rounded-[5px] shadow-inner transition-all duration-200"
            style={{ backgroundColor: cssValue }}
          />
          <div
            className="absolute inset-[-3px] rounded-[8px] opacity-0 transition-opacity duration-200 group-hover:opacity-40"
            style={{ boxShadow: `0 0 0 2px ${cssValue}` }}
          />
          {isOpen && (
            <div
              className="absolute inset-[-3px] rounded-[8px] opacity-60"
              style={{ boxShadow: `0 0 0 2px ${cssValue}` }}
            />
          )}
        </button>

        {isOpen && (
          <div
            className={`absolute left-0 z-50 min-w-[220px] rounded-xl border border-border/60 bg-popover shadow-xl animate-in fade-in zoom-in-95 duration-150 ${popoverPosition}`}
          >
            <div className="flex items-center justify-between border-b border-border/40 px-3 py-2">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                {label}
              </span>
              <div className="flex items-center gap-1.5">
                <div className="size-3.5 rounded-sm shadow-inner" style={{ backgroundColor: cssValue }} />
                <span className="font-mono text-[10px] text-muted-foreground">{alpha}%</span>
              </div>
            </div>
            <div className="p-3">
              <HexAlphaColorPicker color={cssValue} onChange={pick} />
            </div>
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-[13px] font-medium leading-none text-foreground">{label}</span>
        <span className="truncate text-[11px] leading-none text-muted-foreground/70">{description}</span>
      </div>

      {isTranslucent && (
        <span className="shrink-0 rounded bg-muted/50 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
          {alpha}%
        </span>
      )}

      <input
        type="text"
        value={displayValue}
        spellCheck={false}
        onChange={(e) => setDisplayValue(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={commitTextChange}
        onKeyDown={(e) => {
          if (e.key === "Enter") commitTextChange();
          if (e.key === "Escape") {
            setDisplayValue(formatColor(value, mode));
            setIsFocused(false);
            (e.target as HTMLInputElement).blur();
          }
        }}
          className="w-44 shrink-0 rounded-md border-0 bg-background/20 px-3 py-2 text-center font-mono text-[12px] outline-none transition-all duration-150 hover:bg-background/30"
        style={{
          boxShadow: isFocused ? `0 0 0 2px ${cssValue}55` : "none",
          color: "hsl(var(--foreground))",
        }}
      />
    </div>
  );
});

export function AppearancePanel() {
  const data = useConfigStore((state) => state.data);
  const [mode, setMode] = useState<ColorMode>("hex");

  const theme = readTheme(data);

  const handleColorChange = useCallback((key: keyof AppearanceConfig, value: string) => {
    const configKey = key as MangoConfigKey;
    const state = useConfigStore.getState();
    const existing = state.data[configKey];
    if (existing?.[0]) {
      state.updateEntry(configKey, 0, value);
    } else {
      state.addEntry(configKey, value);
    }
  }, []);

  const changeHandlers = useMemo(() => {
    const handlers: Partial<Record<keyof AppearanceConfig, (v: string) => void>> = {};
    for (const field of APPEARANCE_FIELDS) {
      handlers[field.key] = (v) => handleColorChange(field.key, v);
    }
    return handlers;
  }, [handleColorChange]);

  const total = APPEARANCE_FIELDS.length;

  return (
    <div className="mx-auto w-full max-w-6xl pb-12">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">Appearance</h2>
        </div>

        <div className="flex shrink-0 items-center rounded-lg border border-border/40 bg-muted/30 p-0.5">
          {COLOR_MODES.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className="rounded-md px-3 py-1 font-mono text-[11px] font-medium uppercase tracking-wider transition-all duration-150"
              style={
                mode === m
                  ? {
                      background: "hsl(var(--background))",
                      color: "hsl(var(--foreground))",
                      boxShadow: "0 1px 3px hsl(var(--foreground) / 0.08)",
                    }
                  : { color: "hsl(var(--muted-foreground))" }
              }
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border/40 bg-card shadow-sm">
        <div className="divide-y divide-border/20">
          {APPEARANCE_FIELDS.map((field, i) => (
            <ColorInput
              key={field.key}
              label={field.label}
              description={field.description}
              value={theme[field.key]}
              mode={mode}
              flipPopover={i >= total - 3}
              onChange={changeHandlers[field.key]!}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
