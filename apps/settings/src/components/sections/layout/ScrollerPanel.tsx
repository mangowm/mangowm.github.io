import { useState, useRef } from "react";
import { useConfigStore } from "@/lib/config-store";
import { cfgBool, cfgInt, cfgFloat, cfgStr } from "@/lib/config-helpers";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

function AccentHover() {
  return (
    <div className="absolute left-0 top-0 h-full w-[2px] scale-y-0 rounded-full bg-ring/50 transition-transform duration-200 group-hover:scale-y-100" />
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div className="group relative flex items-center gap-4 px-4 py-2.5 transition-colors duration-150 hover:bg-muted/15">
      <AccentHover />
      {children}
    </div>
  );
}

function FieldLabel({ label, description }: { label: string; description: string }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
      <span className="text-[13px] font-medium leading-none text-foreground">{label}</span>
      <span className="truncate text-[11px] leading-none text-muted-foreground/60">
        {description}
      </span>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <Row>
      <FieldLabel label={label} description={description} />
      <div className="flex shrink-0 items-center gap-2">
        <span
          className={
            "text-[10px] font-mono font-medium uppercase tracking-wider transition-colors duration-150 " +
            (value ? "text-primary" : "text-muted-foreground/30")
          }
        >
          {value ? "On" : "Off"}
        </span>
        <Switch checked={value} onCheckedChange={onChange} className="shrink-0" />
      </div>
    </Row>
  );
}

function SliderRow({
  label,
  description,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  description: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <Row>
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
          aria-label={label}
        />
        <span className="w-14 text-right font-mono text-[12px] tabular-nums text-foreground/80">
          {value % 1 === 0 ? value : value.toFixed(2)}
        </span>
      </div>
    </Row>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
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

// Preset tag input

function PresetInput({
  values,
  onChange,
}: {
  values: number[];
  onChange: (values: number[]) => void;
}) {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addValue = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const n = parseFloat(trimmed);
    if (!isNaN(n) && n >= 0.1 && n <= 1.0) {
      onChange([...values, Math.round(n * 100) / 100]);
      setText("");
    }
    inputRef.current?.focus();
  };

  const removeValue = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  return (
    <div className="px-4 py-3">
      <div className="mb-2 flex flex-wrap gap-1.5">
        {values.length === 0 && (
          <span className="text-[11px] text-muted-foreground/40 italic">No presets defined</span>
        )}
        {values.map((v, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-0.5 font-mono text-[12px] text-foreground/80"
          >
            {v.toFixed(2)}
            <button
              type="button"
              onClick={() => removeValue(i)}
              className="inline-flex size-3.5 items-center justify-center rounded-sm text-muted-foreground/50 transition-colors hover:text-destructive hover:bg-destructive/10"
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addValue();
            }
          }}
          placeholder="0.50"
          className="h-7 w-24 font-mono text-[12px]"
        />
        <Button
          type="button"
          size="xs"
          variant="secondary"
          onClick={addValue}
          disabled={!text.trim() || isNaN(parseFloat(text.trim()))}
        >
          Add
        </Button>
      </div>
    </div>
  );
}

export function ScrollerPanel() {
  const data = useConfigStore((s) => s.data);
  const setValue = useConfigStore((s) => s.setValue);

  const tb = (key: string) => (v: boolean) => setValue(key, v ? "1" : "0");

  const defaultProportion = cfgFloat(data, "scroller_default_proportion", 0.9, 0.1, 1.0);
  const defaultSingle = cfgFloat(data, "scroller_default_proportion_single", 1.0, 0.1, 1.0);
  const ignoreSingle = cfgBool(data, "scroller_ignore_proportion_single", true);
  const focusCenter = cfgBool(data, "scroller_focus_center");
  const preferCenter = cfgBool(data, "scroller_prefer_center");
  const preferOverspread = cfgBool(data, "scroller_prefer_overspread", true);
  const pointerFocus = cfgBool(data, "edge_scroller_pointer_focus", true);
  const allowSpeed = cfgFloat(data, "edge_scroller_focus_allow_speed", 0.0, 0.0, 1000.0);
  const structs = cfgInt(data, "scroller_structs", 20, 0, 1000);

  // Parse proportion preset
  const presetRaw = cfgStr(data, "scroller_proportion_preset", "");
  const presetValues = presetRaw
    ? presetRaw.split(",").map((s) => {
        const n = parseFloat(s.trim());
        return isNaN(n) ? 0 : n;
      })
    : [];

  const handlePresetChange = (values: number[]) => {
    setValue("scroller_proportion_preset", values.join(","));
  };

  return (
    <div className="mx-auto w-full max-w-4xl pb-12">
      <div className="mb-8">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Scroller</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure the scroller tiling layout: window proportions, focus behavior, edge scrolling,
          and preset values.
        </p>
      </div>

      <div className="mb-5">
        <SectionCard title="Proportions">
          <SliderRow
            label="Default Proportion"
            description="Default proportion of the container occupied by each tiled window."
            value={defaultProportion}
            min={0.1}
            max={1.0}
            step={0.05}
            onChange={(v) => setValue("scroller_default_proportion", v.toFixed(2))}
          />
          <SliderRow
            label="Single Window Proportion"
            description="Proportion when there is only one window on the tag."
            value={defaultSingle}
            min={0.1}
            max={1.0}
            step={0.05}
            onChange={(v) => setValue("scroller_default_proportion_single", v.toFixed(2))}
          />
          <ToggleRow
            label="Ignore Proportion When Solo"
            description="Ignore the proportion setting when only one window is visible."
            value={ignoreSingle}
            onChange={tb("scroller_ignore_proportion_single")}
          />
        </SectionCard>
      </div>

      <div className="mb-5">
        <SectionCard title="Focus">
          <ToggleRow
            label="Focus Center"
            description="Focus the window at the center of the viewport when scrolling."
            value={focusCenter}
            onChange={tb("scroller_focus_center")}
          />
          <ToggleRow
            label="Prefer Center"
            description="Prefer to keep the focused window centered in the viewport."
            value={preferCenter}
            onChange={tb("scroller_prefer_center")}
          />
          <ToggleRow
            label="Prefer Overspread"
            description="Prefer to overspread windows across the available space."
            value={preferOverspread}
            onChange={tb("scroller_prefer_overspread")}
          />
        </SectionCard>
      </div>

      <div className="mb-5">
        <SectionCard title="Edge Scrolling">
          <ToggleRow
            label="Pointer Focus at Edge"
            description="Automatically focus the adjacent window when the pointer reaches the screen edge."
            value={pointerFocus}
            onChange={tb("edge_scroller_pointer_focus")}
          />
          <SliderRow
            label="Focus Allow Speed"
            description="Maximum pointer speed for edge-triggered focus changes (0 = always allowed)."
            value={allowSpeed}
            min={0}
            max={1000}
            step={1}
            onChange={(v) => setValue("edge_scroller_focus_allow_speed", String(v))}
          />
        </SectionCard>
      </div>

      <div className="mb-5">
        <SectionCard title="Structs">
          <SliderRow
            label="Scroller Structs"
            description="Number of structural positions available in the scroller."
            value={structs}
            min={0}
            max={100}
            step={1}
            onChange={(v) => setValue("scroller_structs", String(Math.round(v)))}
          />
        </SectionCard>
      </div>

      <div className="mb-5">
        <SectionCard title="Proportion Presets">
          <PresetInput values={presetValues} onChange={handlePresetChange} />
        </SectionCard>
      </div>
    </div>
  );
}
