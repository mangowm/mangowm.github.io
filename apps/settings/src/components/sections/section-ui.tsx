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

import React from "react";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
      <span className="text-[13px] font-medium leading-none text-foreground">
        {label}
      </span>
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
        <h3 className="text-sm font-semibold tracking-tight text-foreground">
          {title}
        </h3>
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
export function ToggleRow({
  label,
  description,
  value,
  onChange,
  enabled,
}: ToggleRowProps) {
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
        <Switch
          checked={value}
          onCheckedChange={onChange}
          className="shrink-0"
          disabled={isOff}
        />
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
  const display =
    value % 1 === 0 ? String(value) : value.toFixed(2);

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
      <Select
        value={value}
        onValueChange={(v) => v && onChange(v)}
        disabled={isOff}
      >
        <SelectTrigger className="w-28" aria-label={label}>
          <SelectValue />
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
export function PanelHeader({
  title,
  description,
  separator = true,
  actions,
}: PanelHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            {title}
          </h2>
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
 * centering, bottom padding, and the entry animation.
 */
export function PanelShell({
  children,
  maxWidth = "max-w-4xl",
}: PanelShellProps) {
  return (
    <div
      className={
        "mx-auto w-full pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 " +
        maxWidth
      }
    >
      {children}
    </div>
  );
}
