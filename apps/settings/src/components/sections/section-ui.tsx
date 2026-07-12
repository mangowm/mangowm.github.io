/**
 * section-ui.tsx
 *
 * Shared layout primitives and control rows for all config section panels.
 *
 * Hierarchy:
 *   SectionCard          — titled card with a divider and slotted rows
 *     Row                — a single settings row (hover accent, flex layout)
 *       FieldLabel       — left side: label + description
 *       <control>        — right side: one of the row variants below
 *
 * Row variants (drop-in replacements for the per-panel local functions):
 *   ToggleRow            — Switch + on/off indicator
 *   SliderRow            — Slider + numeric readout; optional `enabled` gate
 *   SelectRow            — Select dropdown
 *
 * Panel chrome:
 *   PanelHeader          — h2 title + subtitle + optional Separator
 *   PanelShell           — max-width wrapper with entry animation
 */

import React, { useState, useEffect, useRef } from "react";
import { X, Plus, Pipette } from "lucide-react";
import { HexAlphaColorPicker } from "react-colorful";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toHex, toCss } from "@/lib/color-utils";

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

/** The left-edge accent bar that slides in on row hover. */
function AccentHover() {
  return (
    <div className="absolute left-0 top-0 h-full w-[2px] scale-y-0 rounded-full bg-ring/50 transition-transform duration-200 group-hover:scale-y-100" />
  );
}

export interface RowProps {
  children: React.ReactNode;
  /** Extra Tailwind classes forwarded to the outer div. */
  className?: string;
}

/**
 * Base row container. Renders the hover background + left accent bar.
 * Use directly when no standard row variant fits.
 */
export function Row({ children, className = "" }: RowProps) {
  return (
    <div
      className={
        "group relative flex items-center gap-4 px-4 py-2.5 " +
        "transition-colors duration-150 hover:bg-muted/15 " +
        className
      }
    >
      <AccentHover />
      {children}
    </div>
  );
}

export interface FieldLabelProps {
  label: string;
  description: string;
}

/** Left-side label + muted description text. */
export function FieldLabel({ label, description }: FieldLabelProps) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
      <span className="text-[13px] font-medium leading-none text-foreground">{label}</span>
      <span className="truncate text-[11px] leading-none text-muted-foreground/60">
        {description}
      </span>
    </div>
  );
}

export interface SectionCardProps {
  title: string;
  children: React.ReactNode;
}

/** Titled card that wraps a group of related rows. */
export function SectionCard({ title, children }: SectionCardProps) {
  return (
    <div className="rounded-xl border border-border/40 bg-card shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div className="px-4 py-3">
        <h3 className="text-sm font-semibold tracking-tight text-foreground">{title}</h3>
      </div>
      <Separator className="w-full" />
      <div className="divide-y divide-border/10">{children}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Row variants
// ---------------------------------------------------------------------------

export interface ToggleRowProps {
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
  /** When false the row is visually dimmed and non-interactive. */
  enabled?: boolean;
}

/** A row with a Switch toggle and an on/off text indicator. */
export function ToggleRow({ label, description, value, onChange, enabled }: ToggleRowProps) {
  const isOff = enabled === false;
  return (
    <Row className={isOff ? "pointer-events-none opacity-40" : ""}>
      <FieldLabel label={label} description={description} />
      <div className="flex shrink-0 items-center gap-2">
        <span
          className={
            "text-[10px] font-mono font-medium uppercase tracking-wider " +
            "transition-colors duration-150 " +
            (value ? "text-primary" : "text-muted-foreground/30")
          }
        >
          {value ? "On" : "Off"}
        </span>
        <Switch checked={value} onCheckedChange={onChange} className="shrink-0" disabled={isOff} />
      </div>
    </Row>
  );
}

export interface SliderRowProps {
  label: string;
  description: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  /** Unit suffix shown after the numeric value, e.g. "px". */
  unit?: string;
  /**
   * When false the row is visually dimmed, the slider is disabled, and
   * pointer events are suppressed. Useful for gating sub-options on a
   * parent toggle (e.g. blur parameters while blur is off).
   */
  enabled?: boolean;
  onChange: (v: number) => void;
}

/**
 * A row with a Slider and a formatted numeric readout.
 * Integers display without decimals; floats show up to 2 decimal places.
 */
export function SliderRow({
  label,
  description,
  value,
  min,
  max,
  step,
  unit,
  enabled,
  onChange,
}: SliderRowProps) {
  const isOff = enabled === false;
  const display = value % 1 === 0 ? String(value) : value.toFixed(2);

  return (
    <Row className={isOff ? "pointer-events-none opacity-40" : ""}>
      <FieldLabel label={label} description={description} />
      <div className="flex w-44 shrink-0 items-center gap-3">
        <Slider
          value={[value]}
          min={min}
          max={max}
          step={step ?? 1}
          onValueChange={(v) => {
            const arr = Array.isArray(v) ? v : [v];
            onChange(arr[0]);
          }}
          className="flex-1"
          disabled={isOff}
          aria-label={label}
        />
        <span className="w-14 text-right font-mono text-[12px] tabular-nums text-foreground/80">
          {display}
          {unit ?? ""}
        </span>
      </div>
    </Row>
  );
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectRowProps {
  label: string;
  description: string;
  value: string;
  options: SelectOption[];
  onChange: (v: string) => void;
  /** When false the row is visually dimmed and non-interactive. */
  enabled?: boolean;
}

/** A row with a Select dropdown. */
export function SelectRow({
  label,
  description,
  value,
  options,
  onChange,
  enabled,
}: SelectRowProps) {
  const isOff = enabled === false;
  return (
    <Row className={isOff ? "pointer-events-none opacity-40" : ""}>
      <FieldLabel label={label} description={description} />
      <Select value={value} onValueChange={(v) => v && onChange(v)} disabled={isOff}>
        <SelectTrigger className="w-28" aria-label={label}>
          <SelectValue>{options.find((o) => o.value === value)?.label ?? value}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Row>
  );
}

export interface TextInputRowProps {
  label: string;
  description: string;
  value: string;
  placeholder?: string;
  onChange: (v: string) => void;
  enabled?: boolean;
}

export interface ColorRowProps {
  label: string;
  description: string;
  value: string;
  onChange: (v: string) => void;
  enabled?: boolean;
}

/**
 * A row with a color swatch, HexAlphaColorPicker popover, and hex text input.
 * Colors are stored in 0xRRGGBBAA format.
 */
export function ColorRow({
  label,
  description,
  value,
  onChange,
  enabled,
}: ColorRowProps) {
  const isOff = enabled === false;
  const cssValue = toCss(value);
  const [isOpen, setIsOpen] = useState(false);
  const [displayValue, setDisplayValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

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
    setDisplayValue(hex);
    onChange(hex);
  };

  const alphaHex = value.slice(-2);
  const alpha = Math.round((parseInt(alphaHex, 16) / 255) * 100);
  const isTranslucent = alpha < 100;

  return (
    <Row className={isOff ? "pointer-events-none opacity-40" : ""}>
      <FieldLabel label={label} description={description} />
      <div className="relative shrink-0" ref={popoverRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={isOff}
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
          <div className="absolute inset-0 flex items-center justify-center rounded-[5px] bg-black/0 opacity-0 transition-all duration-200 group-hover:bg-black/40 group-hover:opacity-100">
            <Pipette className="size-4 text-white drop-shadow-sm" />
          </div>
        </button>

        {isOpen && (
          <div className="absolute left-0 top-[calc(100%+8px)] z-50 min-w-[220px] rounded-xl border border-border/60 bg-popover shadow-xl animate-in fade-in zoom-in-95 duration-150">
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
            setDisplayValue(value);
            setIsFocused(false);
            (e.target as HTMLInputElement).blur();
          }
        }}
        disabled={isOff}
        className="w-44 shrink-0 rounded-md border-0 bg-background/20 px-3 py-2 text-center font-mono text-[12px] outline-none transition-all duration-150 hover:bg-background/30"
        style={{
          boxShadow: isFocused ? `0 0 0 2px ${cssValue}55` : "none",
          color: "hsl(var(--foreground))",
        }}
      />
    </Row>
  );
}

export interface MultiTagInputProps {
  label: string;
  description: string;
  /** Comma-separated values */
  value: string;
  /** Placeholder for the add-input */
  tagPlaceholder?: string;
  onChange: (v: string) => void;
  enabled?: boolean;
}

/**
 * A row with a tag/chip input for comma-separated values.
 * Each tag is one item; users add and remove them individually.
 * The combined value is stored as a comma-separated string.
 */
export function MultiTagInput({
  label,
  description,
  value,
  tagPlaceholder = "Add…",
  onChange,
  enabled,
}: MultiTagInputProps) {
  const [text, setText] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);
  const isOff = enabled === false;

  const tags = value ? value.split(",").filter((t) => t.trim()) : [];

  const addTag = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const next = [...tags, trimmed];
    onChange(next.join(","));
    setText("");
    inputRef.current?.focus();
  };

  const removeTag = (index: number) => {
    const next = tags.filter((_, i) => i !== index);
    onChange(next.join(","));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
    if (e.key === "," || e.key === "Tab") {
      e.preventDefault();
      addTag();
    }
    if (e.key === "Backspace" && !text && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  return (
    <Row className={isOff ? "pointer-events-none opacity-40" : ""}>
      <FieldLabel label={label} description={description} />
      <div className="flex w-52 shrink-0 flex-col items-stretch gap-1.5">
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-0.5 font-mono text-[11px] text-foreground/80"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(i)}
                  disabled={isOff}
                  className="inline-flex size-3.5 items-center justify-center rounded-sm text-muted-foreground/50 transition-colors hover:text-destructive hover:bg-destructive/10"
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <Input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={tagPlaceholder}
            spellCheck={false}
            disabled={isOff}
            className="h-7 flex-1 font-mono text-[11px]"
            aria-label={label}
          />
          <Button
            type="button"
            size="xs"
            variant="secondary"
            onClick={addTag}
            disabled={isOff || !text.trim()}
            className="h-7 shrink-0 px-2"
          >
            <Plus className="size-3" />
          </Button>
        </div>
      </div>
    </Row>
  );
}

/** A row with a text input field. */
export function TextInputRow({
  label,
  description,
  value,
  placeholder,
  onChange,
  enabled,
}: TextInputRowProps) {
  const isOff = enabled === false;
  return (
    <Row className={isOff ? "pointer-events-none opacity-40" : ""}>
      <FieldLabel label={label} description={description} />
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        spellCheck={false}
        className="w-44 shrink-0 font-mono text-[12px]"
        disabled={isOff}
        aria-label={label}
      />
    </Row>
  );
}

// ---------------------------------------------------------------------------
// Panel chrome
// ---------------------------------------------------------------------------

export interface PanelHeaderProps {
  title: string;
  description: string;
  /** Render a Separator below the description. Defaults to true. */
  separator?: boolean;
  /** Extra content rendered to the right of the title block (e.g. action buttons). */
  actions?: React.ReactNode;
}

/**
 * Standard panel heading with title, subtitle, and an optional separator.
 * Handles the inconsistent sizing that existed across the old panels —
 * everything is now `text-xl` to match the majority.
 */
export function PanelHeader({ title, description, separator = true, actions }: PanelHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>
      {separator && <Separator className="mt-4" />}
    </div>
  );
}

export interface PanelShellProps {
  children: React.ReactNode;
  /**
   * Max width class. Defaults to "max-w-4xl" — matches the layout/effects
   * panels. Pass "max-w-3xl" for narrower panels like Autostart / Environment.
   */
  maxWidth?: string;
}

/**
 * Outer wrapper for all panels. Applies consistent max-width, horizontal
 * centering, and bottom padding.
 */
export function PanelShell({ children, maxWidth = "max-w-4xl" }: PanelShellProps) {
  return <div className={"mx-auto w-full pb-12 " + maxWidth}>{children}</div>;
}
