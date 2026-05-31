import { useConfigStore } from "@/lib/config-store";
import { useConfigSetter } from "@/lib/use-config-setter";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import type { MangoConfigKey } from "@/lib/config-types";

const DEFAULTS = {
  smartgaps: "0",
  gappih: "5",
  gappiv: "5",
  gappoh: "10",
  gappov: "10",
  borderpx: "4",
  no_border_when_single: "0",
  no_radius_when_single: "0",
} as const;

const LIMITS = {
  gappih: { min: 0, max: 1000 },
  gappiv: { min: 0, max: 1000 },
  gappoh: { min: 0, max: 1000 },
  gappov: { min: 0, max: 1000 },
  borderpx: { min: 0, max: 200 },
} as const;

interface ConfigData {
  [key: string]: string[];
}

function val(data: ConfigData, key: string, fallback: string): string {
  return (data[key as MangoConfigKey]?.[0]) ?? fallback;
}

function enabled(data: ConfigData, key: string): boolean {
  return val(data, key, "0") === "1";
}

function readInt(data: ConfigData, key: string, fallback: string, min: number, max: number): number {
  const n = parseInt(val(data, key, fallback), 10);
  return isNaN(n) ? min : Math.min(max, Math.max(min, n));
}

function AccentHover() {
  return (
    <div className="absolute left-0 top-0 h-full w-[2px] scale-y-0 rounded-full bg-ring/50 transition-transform duration-200 group-hover:scale-y-100" />
  );
}

function Row({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={"group relative flex items-center gap-4 px-4 py-2.5 transition-colors duration-150 hover:bg-muted/15 " + className}>
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

function ToggleRow({ label, description, value, onChange }: {
  label: string; description: string; value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <Row>
      <FieldLabel label={label} description={description} />
      <div className="flex shrink-0 items-center gap-2">
        <span className={"text-[10px] font-mono font-medium uppercase tracking-wider transition-colors duration-150 " + (value ? "text-primary" : "text-muted-foreground/30")}>
          {value ? "On" : "Off"}
        </span>
        <Switch checked={value} onCheckedChange={onChange} className="shrink-0" />
      </div>
    </Row>
  );
}

function SliderRow({ label, description, value, min, max, step, unit, onChange }: {
  label: string; description: string; value: number; min: number; max: number;
  step?: number; unit?: string; onChange: (v: number) => void;
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
          {value}{unit ?? ""}
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

export function GapsBordersPanel() {
  const data = useConfigStore((s) => s.data);
  const setValue = useConfigSetter();

  const smartgapsOn = enabled(data, "smartgaps");
  const gappih = readInt(data, "gappih", DEFAULTS.gappih, LIMITS.gappih.min, LIMITS.gappih.max);
  const gappiv = readInt(data, "gappiv", DEFAULTS.gappiv, LIMITS.gappiv.min, LIMITS.gappiv.max);
  const gappoh = readInt(data, "gappoh", DEFAULTS.gappoh, LIMITS.gappoh.min, LIMITS.gappoh.max);
  const gappov = readInt(data, "gappov", DEFAULTS.gappov, LIMITS.gappov.min, LIMITS.gappov.max);
  const borderpx = readInt(data, "borderpx", DEFAULTS.borderpx, LIMITS.borderpx.min, LIMITS.borderpx.max);
  const noBorderSingle = enabled(data, "no_border_when_single");
  const noRadiusSingle = enabled(data, "no_radius_when_single");

  const tb = (k: string) => (v: boolean) => setValue(k, v ? "1" : "0");

  return (
    <div className="mx-auto w-full max-w-4xl pb-12">
      <div className="mb-8">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Gaps &amp; Borders</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Control spacing between windows, screen edges, and window border thickness.
        </p>
      </div>

      <div className="mb-5">
        <SectionCard title="Window Gaps">
          <ToggleRow
            label="Smart Gaps"
            description="Only show gaps when there are multiple windows on the same tag."
            value={smartgapsOn}
            onChange={tb("smartgaps")}
          />
          <SliderRow
            label="Inner Gap Horizontal"
            description="Horizontal gap between tiled windows."
            value={gappih}
            min={LIMITS.gappih.min}
            max={LIMITS.gappih.max}
            unit="px"
            onChange={(v) => setValue("gappih", String(v))}
          />
          <SliderRow
            label="Inner Gap Vertical"
            description="Vertical gap between tiled windows."
            value={gappiv}
            min={LIMITS.gappiv.min}
            max={LIMITS.gappiv.max}
            unit="px"
            onChange={(v) => setValue("gappiv", String(v))}
          />
          <SliderRow
            label="Outer Gap Horizontal"
            description="Horizontal gap between windows and screen edges."
            value={gappoh}
            min={LIMITS.gappoh.min}
            max={LIMITS.gappoh.max}
            unit="px"
            onChange={(v) => setValue("gappoh", String(v))}
          />
          <SliderRow
            label="Outer Gap Vertical"
            description="Vertical gap between windows and screen edges."
            value={gappov}
            min={LIMITS.gappov.min}
            max={LIMITS.gappov.max}
            unit="px"
            onChange={(v) => setValue("gappov", String(v))}
          />
        </SectionCard>
      </div>

      <div className="mb-5">
        <SectionCard title="Border">
          <SliderRow
            label="Border Width"
            description="Thickness of window borders in pixels."
            value={borderpx}
            min={LIMITS.borderpx.min}
            max={LIMITS.borderpx.max}
            unit="px"
            onChange={(v) => setValue("borderpx", String(v))}
          />
          <ToggleRow
            label="Hide Border When Solo"
            description="Remove window borders when only one window is visible on the tag."
            value={noBorderSingle}
            onChange={tb("no_border_when_single")}
          />
          <ToggleRow
            label="Hide Radius When Solo"
            description="Remove corner radius when only one window is visible on the tag."
            value={noRadiusSingle}
            onChange={tb("no_radius_when_single")}
          />
        </SectionCard>
      </div>
    </div>
  );
}
