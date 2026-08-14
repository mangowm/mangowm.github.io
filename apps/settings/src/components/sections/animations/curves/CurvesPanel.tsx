import { useEffect, useState } from "react";
import { useConfigStore, useConfigStr } from "@/lib/config-store";
import type { PanelProps } from "@/lib/section-types";
import { useFocusField } from "@/lib/use-focus-field";
import { PanelShell, PanelHeader, SectionCard } from "@/components/sections/section-ui";
import { parseCurve, serializeCurve } from "@/lib/curve";
import type { BezierValue } from "@/lib/curve";
import { EASING_PRESETS } from "@/lib/easings";
import { BezierEditor } from "./BezierEditor";
import { CurveThumb } from "./CurveThumb";
import { CurveMotionPreview } from "./CurveMotionPreview";
import { cn } from "@/lib/utils";

const CURVE_FIELDS: { key: string; label: string; description: string }[] = [
  {
    key: "animation_curve_move",
    label: "Move / Resize",
    description: "Bezier curve for move and resize animations.",
  },
  {
    key: "animation_curve_open",
    label: "Window Open",
    description: "Bezier curve when a new window opens.",
  },
  {
    key: "animation_curve_close",
    label: "Window Close",
    description: "Bezier curve when a window closes.",
  },
  {
    key: "animation_curve_tag",
    label: "Tag Switch",
    description: "Bezier curve for tag-switch (workspace) animations.",
  },
  {
    key: "animation_curve_focus",
    label: "Focus Change",
    description: "Bezier curve for focus-change animations.",
  },
  {
    key: "animation_curve_opafadein",
    label: "Fade In Opacity",
    description: "Bezier curve for fade-in opacity transitions.",
  },
  {
    key: "animation_curve_opafadeout",
    label: "Fade Out Opacity",
    description: "Bezier curve for fade-out opacity transitions.",
  },
];

const DEFAULT_CURVE: BezierValue = [0.25, 0.1, 0.25, 1];

const NUMERIC_FIELDS: { index: 0 | 1 | 2 | 3; label: string }[] = [
  { index: 0, label: "x1" },
  { index: 1, label: "y1" },
  { index: 2, label: "x2" },
  { index: 3, label: "y2" },
];

function sameCurve(a: BezierValue, b: BezierValue): boolean {
  return a.every((v, i) => Math.abs(v - b[i]) < 1e-4);
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  const commit = () => {
    const n = parseFloat(draft);
    if (!Number.isNaN(n)) onChange(clamp01(n));
    else setDraft(String(value));
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <input
        type="text"
        inputMode="decimal"
        value={draft}
        spellCheck={false}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
        }}
        aria-label={label}
        className="w-full rounded-md border border-border/50 bg-background/50 px-2 py-1 text-center font-mono text-[12px] text-foreground outline-none transition-colors focus-visible:border-primary/50 focus-visible:ring-1 focus-visible:ring-primary/30"
      />
    </div>
  );
}

export function CurvesPanel({ focusKey }: PanelProps) {
  const fieldRef = useFocusField(focusKey);
  const setValue = useConfigStore((s) => s.setValue);

  const [selected, setSelected] = useState(CURVE_FIELDS[0].key);

  useEffect(() => {
    if (focusKey && CURVE_FIELDS.some((f) => f.key === focusKey)) {
      setSelected(focusKey);
    }
  }, [focusKey]);

  const selectedField = CURVE_FIELDS.find((f) => f.key === selected) ?? CURVE_FIELDS[0];

  const curveMove = useConfigStr("animation_curve_move");
  const curveOpen = useConfigStr("animation_curve_open");
  const curveClose = useConfigStr("animation_curve_close");
  const curveTag = useConfigStr("animation_curve_tag");
  const curveFocus = useConfigStr("animation_curve_focus");
  const curveFadeIn = useConfigStr("animation_curve_opafadein");
  const curveFadeOut = useConfigStr("animation_curve_opafadeout");

  const values: Record<string, string> = {
    animation_curve_move: curveMove,
    animation_curve_open: curveOpen,
    animation_curve_close: curveClose,
    animation_curve_tag: curveTag,
    animation_curve_focus: curveFocus,
    animation_curve_opafadein: curveFadeIn,
    animation_curve_opafadeout: curveFadeOut,
  };

  const rawValue = values[selected];
  const parsed = parseCurve(rawValue);
  const curve: BezierValue =
    parsed && parsed.length === 4 ? [parsed[0], parsed[1], parsed[2], parsed[3]] : DEFAULT_CURVE;

  const commitCurve = (next: BezierValue) => setValue(selected, serializeCurve(next));

  const activePreset = EASING_PRESETS.find((p) => sameCurve(p.curve, curve))?.name ?? null;

  return (
    <PanelShell maxWidth="max-w-6xl">
      <PanelHeader
        title="Animation Curves"
        description="Pick a preset or drag the handles to shape a cubic-bezier curve for each animation. Values must be non-negative."
        separator={false}
      />

      <div className="mb-4">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Presets
          </span>
          <div className="h-px flex-1 bg-border/20" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {EASING_PRESETS.map((preset) => {
            const isActive = activePreset === preset.name;
            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => commitCurve(preset.curve)}
                aria-pressed={isActive}
                className="flex w-[104px] shrink-0 flex-col items-center gap-1 rounded-lg border bg-card p-2 text-left outline-none transition-all duration-150 hover:border-border/60 focus-visible:ring-2 focus-visible:ring-primary/40"
                style={{
                  borderColor: isActive
                    ? "var(--ring)"
                    : "color-mix(in oklab, var(--border) 50%, transparent)",
                }}
              >
                <CurveThumb
                  curve={preset.curve}
                  className={cn("h-8 w-full", isActive ? "text-primary" : "text-foreground/80")}
                />
                <span
                  className="w-full truncate text-center text-[10px] font-medium"
                  style={{
                    color: isActive ? "var(--ring)" : "var(--muted-foreground)",
                  }}
                >
                  {preset.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)]">
        <SectionCard title="Curves">
          {CURVE_FIELDS.map((field) => {
            const isSelected = selected === field.key;
            const fieldCurve = parseCurve(values[field.key]);
            const thumbCurve: BezierValue =
              fieldCurve && fieldCurve.length === 4
                ? [fieldCurve[0], fieldCurve[1], fieldCurve[2], fieldCurve[3]]
                : DEFAULT_CURVE;
            return (
              <div key={field.key} ref={fieldRef(field.key)}>
                <button
                  type="button"
                  onClick={() => setSelected(field.key)}
                  aria-pressed={isSelected}
                  className={cn(
                    "group relative flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors duration-150 hover:bg-muted/15",
                    isSelected && "bg-primary/10 hover:bg-primary/10",
                  )}
                >
                  <span
                    className={cn(
                      "absolute left-0 top-0 h-full w-[2px] rounded-full bg-ring/60 transition-transform duration-200",
                      isSelected ? "scale-y-100" : "scale-y-0 group-hover:scale-y-100",
                    )}
                  />
                  <CurveThumb
                    curve={thumbCurve}
                    className={cn(
                      "size-7 shrink-0",
                      isSelected ? "text-primary" : "text-muted-foreground",
                    )}
                  />
                  <span
                    className={cn(
                      "min-w-0 flex-1 truncate text-[13px] font-medium leading-none",
                      isSelected ? "text-primary" : "text-foreground",
                    )}
                  >
                    {field.label}
                  </span>
                </button>
              </div>
            );
          })}
        </SectionCard>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-border/40 bg-card p-5 shadow-sm">
            <h3 className="text-sm font-semibold tracking-tight text-foreground">
              {selectedField.label}
            </h3>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
              {selectedField.description}
            </p>

            <div className="mx-auto mt-4 w-full max-w-[240px]">
              <div className="rounded-xl border border-border/40 bg-muted/20 p-2">
                <BezierEditor value={curve} onChange={commitCurve} />
              </div>
              <div className="mt-3 grid grid-cols-4 gap-2">
                {NUMERIC_FIELDS.map((nf) => (
                  <NumberField
                    key={nf.index}
                    label={nf.label}
                    value={curve[nf.index]}
                    onChange={(n) => {
                      const next = [...curve] as BezierValue;
                      next[nf.index] = n;
                      commitCurve(next);
                    }}
                  />
                ))}
              </div>
              {parsed === null && (
                <p className="mt-2 text-[11px] leading-tight text-red-500/80">
                  The stored value is not a valid curve — it must be exactly 4 non-negative numbers.
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col rounded-xl border border-border/40 bg-card p-5 shadow-sm">
            <h3 className="text-sm font-semibold tracking-tight text-foreground">Motion Preview</h3>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
              Live preview of the {selectedField.label.toLowerCase()} motion with the current curve.
            </p>
            <div className="mt-4 flex flex-1 items-center justify-center">
              <CurveMotionPreview curveKey={selected} curve={curve} />
            </div>
          </div>
        </div>
      </div>
    </PanelShell>
  );
}
