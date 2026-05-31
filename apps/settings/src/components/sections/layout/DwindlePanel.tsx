import { useCallback } from "react";
import { useConfigStore } from "@/lib/config-store";
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
import type { MangoConfigKey } from "@/lib/config-types";

interface FieldDef {
  key: string;
  label: string;
  description: string;
  default: string;
  parse: (raw: string) => unknown;
}

const FIELDS: FieldDef[] = [
  {
    key: "dwindle_vsplit",
    label: "Vertical Split",
    description: "Policy for vertical splits in the dwindle layout.",
    default: "1",
    parse: (v) => {
      const n = parseInt(v, 10);
      return isNaN(n) ? 1 : Math.min(2, Math.max(0, n));
    },
  },
  {
    key: "dwindle_hsplit",
    label: "Horizontal Split",
    description: "Policy for horizontal splits in the dwindle layout.",
    default: "1",
    parse: (v) => {
      const n = parseInt(v, 10);
      return isNaN(n) ? 1 : Math.min(2, Math.max(0, n));
    },
  },
  {
    key: "dwindle_preserve_split",
    label: "Preserve Split",
    description: "Preserve the current split direction when splitting a new window.",
    default: "0",
    parse: (v) => v === "1",
  },
  {
    key: "dwindle_smart_split",
    label: "Smart Split",
    description: "Automatically choose the split direction based on window dimensions.",
    default: "0",
    parse: (v) => v === "1",
  },
  {
    key: "dwindle_smart_resize",
    label: "Smart Resize",
    description: "Intelligently resize adjacent windows when resizing.",
    default: "0",
    parse: (v) => v === "1",
  },
  {
    key: "dwindle_drop_simple_split",
    label: "Drop Simple Split",
    description: "Fall back to a simple split when smart split cannot determine direction.",
    default: "1",
    parse: (v) => v === "1",
  },
  {
    key: "dwindle_manual_split",
    label: "Manual Split",
    description: "Require explicit split direction input instead of automatic.",
    default: "0",
    parse: (v) => v === "1",
  },
  {
    key: "dwindle_split_ratio",
    label: "Split Ratio",
    description: "Proportion of space allocated to the first child when splitting (0.05 – 0.95).",
    default: "0.5",
    parse: (v) => {
      const n = parseFloat(v);
      return isNaN(n) ? 0.5 : Math.min(0.95, Math.max(0.05, n));
    },
  },
];

const SPLIT_OPTIONS = [
  { value: "0", label: "Off" },
  { value: "1", label: "Smart" },
  { value: "2", label: "Force" },
];

interface ConfigData {
  [key: string]: string[];
}

function raw(data: ConfigData, key: string): string {
  return (data[key as MangoConfigKey]?.[0]) ?? FIELDS.find((f) => f.key === key)!.default;
}

function bool(data: ConfigData, key: string): boolean {
  return raw(data, key) === "1";
}

function num(data: ConfigData, key: string): number {
  const def = FIELDS.find((f) => f.key === key)!;
  return (def.parse as (v: string) => number)(raw(data, key));
}

function useSetter() {
  const { data, addEntry, updateEntry } = useConfigStore();
  return useCallback(
    (key: string, value: string) => {
      const k = key as MangoConfigKey;
      if (data[k]?.[0] !== undefined) {
        updateEntry(k, 0, value);
      } else {
        addEntry(k, value);
      }
    },
    [data, addEntry, updateEntry],
  );
}

// Primitives

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
      <span className="truncate text-[11px] leading-none text-muted-foreground/60">{description}</span>
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

function SelectRow({
  label,
  description,
  value,
  options,
  onChange,
}: {
  label: string;
  description: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <Row>
      <FieldLabel label={label} description={description} />
      <Select value={value} onValueChange={(v) => onChange(v!)}>
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

export function DwindlePanel() {
  const data = useConfigStore((s) => s.data);
  const setValue = useSetter();

  const boolSetter = useCallback(
    (key: string) => (v: boolean) => setValue(key, v ? "1" : "0"),
    [setValue],
  );

  const vsplit = raw(data, "dwindle_vsplit");
  const hsplit = raw(data, "dwindle_hsplit");
  const preserveSplit = bool(data, "dwindle_preserve_split");
  const smartSplit = bool(data, "dwindle_smart_split");
  const smartResize = bool(data, "dwindle_smart_resize");
  const dropSimple = bool(data, "dwindle_drop_simple_split");
  const manualSplit = bool(data, "dwindle_manual_split");
  const splitRatio = num(data, "dwindle_split_ratio");

  return (
    <div className="mx-auto w-full max-w-4xl pb-12">
      <div className="mb-8">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Dwindle</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure the dwindle tiling layout: split direction policies, smart behavior, and
          split ratio.
        </p>
      </div>

      <div className="mb-5">
        <SectionCard title="Split Direction">
          <SelectRow
            label="Vertical Split"
            description="Policy for vertical splits. Off = never, Smart = automatic, Force = always."
            value={vsplit}
            options={SPLIT_OPTIONS}
            onChange={(v) => setValue("dwindle_vsplit", v)}
          />
          <SelectRow
            label="Horizontal Split"
            description="Policy for horizontal splits. Off = never, Smart = automatic, Force = always."
            value={hsplit}
            options={SPLIT_OPTIONS}
            onChange={(v) => setValue("dwindle_hsplit", v)}
          />
          <ToggleRow
            label="Preserve Split"
            description="Keep the current split direction when inserting a new window."
            value={preserveSplit}
            onChange={boolSetter("dwindle_preserve_split")}
          />
        </SectionCard>
      </div>

      <div className="mb-5">
        <SectionCard title="Smart Behavior">
          <ToggleRow
            label="Smart Split"
            description="Automatically choose split direction based on the window's dimensions."
            value={smartSplit}
            onChange={boolSetter("dwindle_smart_split")}
          />
          <ToggleRow
            label="Smart Resize"
            description="Intelligently resize adjacent windows during resize operations."
            value={smartResize}
            onChange={boolSetter("dwindle_smart_resize")}
          />
          <ToggleRow
            label="Drop Simple Split"
            description="Fall back to a simple split when smart split cannot determine a direction."
            value={dropSimple}
            onChange={boolSetter("dwindle_drop_simple_split")}
          />
          <ToggleRow
            label="Manual Split"
            description="Require explicit split direction input instead of automatic detection."
            value={manualSplit}
            onChange={boolSetter("dwindle_manual_split")}
          />
        </SectionCard>
      </div>

      <div className="mb-5">
        <SectionCard title="Ratio">
          <SliderRow
            label="Split Ratio"
            description="Proportion of space allotted to the first child when a split occurs."
            value={splitRatio}
            min={0.05}
            max={0.95}
            step={0.01}
            onChange={(v) => setValue("dwindle_split_ratio", v.toFixed(2))}
          />
        </SectionCard>
      </div>
    </div>
  );
}
