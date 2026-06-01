import { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
import { HexAlphaColorPicker } from "react-colorful";
import { useConfigStore } from "@/lib/config-store";
import { cfgStr } from "@/lib/config-helpers";
import type { ConfigData } from "@/lib/config-types";
import { toHex, toCss, formatColor } from "@/lib/color-utils";
import type { ColorMode } from "@/lib/color-utils";
import type { PanelProps } from "@/lib/section-types";
import { useFocusField } from "@/lib/use-focus-field";

interface ColorsConfig {
  rootcolor: string;
  bordercolor: string;
  dropcolor: string;
  splitcolor: string;
  focuscolor: string;
  maximizescreencolor: string;
  urgentcolor: string;
  scratchpadcolor: string;
  globalcolor: string;
  overlaycolor: string;
  shadowscolor: string;
}

const COLORS_FIELDS: Array<{
  key: keyof ColorsConfig;
  label: string;
  description: string;
}> = [
  {
    key: "rootcolor",
    label: "Root Background",
    description: "Desktop background behind all windows",
  },
  {
    key: "bordercolor",
    label: "Inactive Border",
    description: "Unfocused window border (non-selected monitor)",
  },
  {
    key: "focuscolor",
    label: "Active Border",
    description: "Focused window border on the selected monitor",
  },
  {
    key: "maximizescreencolor",
    label: "Maximize Screen",
    description: "Border when window is focused + maximized",
  },
  {
    key: "urgentcolor",
    label: "Urgent",
    description: "Urgent window border — overrides all other colors",
  },
  {
    key: "scratchpadcolor",
    label: "Scratchpad",
    description: "Border when focused + scratchpad window",
  },
  { key: "globalcolor", label: "Global", description: "Border when focused + toggleglobal window" },
  {
    key: "overlaycolor",
    label: "Overlay",
    description: "Border when focused + toggleoverlay window",
  },
  {
    key: "dropcolor",
    label: "Drop Shadow",
    description: "Drop-shadow rectangle when dragging floating windows",
  },
  { key: "splitcolor", label: "Split Indicator", description: "Dwindle manual-split guide line" },
  { key: "shadowscolor", label: "Shadow", description: "Drop shadow color for windows" },
];

interface ColorPalette {
  name: string;
  colors: ColorsConfig;
}

const paletteModules = import.meta.glob<{ default: ColorPalette }>("./palettes/*.json", {
  eager: true,
});
const PALETTES: ColorPalette[] = Object.values(paletteModules).map((m) => m.default);

const COLOR_MODES: ColorMode[] = ["hex", "rgb", "hsl"];

const defaultPalette = PALETTES.find((p) => p.name === "Default")!;

function readTheme(data: ConfigData): ColorsConfig {
  const defaults = defaultPalette.colors;
  return COLORS_FIELDS.reduce(
    (theme, field) => {
      theme[field.key] = cfgStr(data, field.key, defaults[field.key]);
      return theme;
    },
    { ...defaults },
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

  const popoverPosition = flipPopover ? "bottom-[calc(100%+8px)] top-auto" : "top-[calc(100%+8px)]";

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
                <div
                  className="size-3.5 rounded-sm shadow-inner"
                  style={{ backgroundColor: cssValue }}
                />
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
        <span className="truncate text-[11px] leading-none text-muted-foreground/70">
          {description}
        </span>
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

const COLORS_ORDER = COLORS_FIELDS.map((f) => f.key);

interface PaletteCardProps {
  palette: ColorPalette;
  isActive: boolean;
  onSelect: (palette: ColorPalette) => void;
}

const PaletteCard = memo(function PaletteCard({ palette, isActive, onSelect }: PaletteCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(palette)}
      aria-pressed={isActive}
      className="relative w-[130px] shrink-0 cursor-pointer rounded-lg border bg-card p-2 text-left outline-none transition-all duration-150"
      style={{
        borderColor: isActive ? "hsl(var(--ring))" : "transparent",
      }}
    >
      <div className="mb-1.5 flex h-[22px] overflow-hidden rounded-[4px]">
        {COLORS_ORDER.map((key) => (
          <div
            key={key}
            className="flex-1"
            style={{ backgroundColor: toCss(palette.colors[key]) }}
          />
        ))}
      </div>

      <span
        className="block truncate text-[11px] font-medium"
        style={{ color: isActive ? "hsl(var(--ring))" : "hsl(var(--muted-foreground))" }}
      >
        {palette.name}
      </span>
    </button>
  );
});

export function ColorsPanel({ focusKey }: PanelProps) {
  const fieldRef = useFocusField(focusKey);
  const data = useConfigStore((state) => state.data);
  const loading = useConfigStore((state) => state.loading);
  const [mode, setMode] = useState<ColorMode>("hex");

  const theme = readTheme(data);
  const currentTheme = useRef<ColorsConfig | null>(null);
  const didLoad = useRef(false);

  if (!loading && Object.keys(data).length > 0 && !didLoad.current) {
    didLoad.current = true;
    currentTheme.current = theme;
  }

  const currentColors = currentTheme.current ?? defaultPalette.colors;

  const activePalette = useMemo(() => {
    const themeStr = COLORS_ORDER.map((key) => theme[key]).join(",");
    return (
      PALETTES.find((p) => {
        const paletteStr = COLORS_ORDER.map((key) => p.colors[key]).join(",");
        return themeStr === paletteStr;
      })?.name ?? null
    );
  }, [theme]);

  const handlePaletteSelect = useCallback((palette: ColorPalette) => {
    useConfigStore.getState().setValues(palette.colors as unknown as Record<string, string>);
  }, []);

  const handleColorChange = useCallback((key: keyof ColorsConfig, value: string) => {
    useConfigStore.getState().setValue(key, value);
  }, []);

  const changeHandlers = useMemo(() => {
    const handlers: Partial<Record<keyof ColorsConfig, (v: string) => void>> = {};
    for (const field of COLORS_FIELDS) {
      handlers[field.key] = (v) => handleColorChange(field.key, v);
    }
    return handlers;
  }, [handleColorChange]);

  const total = COLORS_FIELDS.length;

  return (
    <div className="mx-auto w-full max-w-6xl pb-12">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">Colors</h2>
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

      {PALETTES.length > 0 && (
        <div className="mb-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Palettes
            </span>
            <div className="h-px flex-1 bg-border/20" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <PaletteCard
              palette={{ name: "Current", colors: currentColors }}
              isActive={activePalette === null}
              onSelect={handlePaletteSelect}
            />
            {PALETTES.map((palette) => (
              <PaletteCard
                key={palette.name}
                palette={palette}
                isActive={activePalette === palette.name}
                onSelect={handlePaletteSelect}
              />
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border/40 bg-card shadow-sm">
        <div className="divide-y divide-border/20">
          {COLORS_FIELDS.map((field, i) => (
            <div ref={fieldRef(field.key)} key={field.key}>
            <ColorInput
              label={field.label}
              description={field.description}
              value={theme[field.key]}
              mode={mode}
              flipPopover={i >= total - 3}
              onChange={changeHandlers[field.key]!}
            />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
