import { useConfigStore } from "@/lib/config-store";
import { cfgBool, cfgInt, cfgFloat } from "@/lib/config-helpers";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import type { PanelProps } from "@/lib/section-types";
import { useFocusField } from "@/lib/use-focus-field";

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
  unit,
  onChange,
}: {
  label: string;
  description: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
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
          {unit ?? ""}
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

export function TilingPanel({ focusKey }: PanelProps) {
  const fieldRef = useFocusField(focusKey);
  const data = useConfigStore((s) => s.data);
  const setValue = useConfigStore((s) => s.setValue);

  const tb = (key: string) => (v: boolean) => setValue(key, v ? "1" : "0");

  const newIsMaster = cfgBool(data, "new_is_master", true);
  const mfact = cfgFloat(data, "default_mfact", 0.55, 0.1, 0.9);
  const nmaster = cfgInt(data, "default_nmaster", 1, 1, 1000);
  const centerOverspread = cfgBool(data, "center_master_overspread");
  const centerSingleStack = cfgBool(data, "center_when_single_stack", true);

  return (
    <div className="mx-auto w-full max-w-4xl pb-12">
      <div className="mb-8">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Tiling</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure the main tiling layout: master area size, number of masters, and how new windows
          are placed.
        </p>
      </div>

      <div className="mb-5">
        <SectionCard title="Placement">
          <div ref={fieldRef("new_is_master")}>
            <ToggleRow
              label="New Windows as Master"
              description="When enabled, new windows open in the master area. Otherwise they join the stack."
              value={newIsMaster}
              onChange={tb("new_is_master")}
            />
          </div>
        </SectionCard>
      </div>

      <div className="mb-5">
        <SectionCard title="Master Area">
          <div ref={fieldRef("default_mfact")}>
            <SliderRow
              label="Master Area Factor"
              description="Fraction of the screen width given to the master area."
              value={mfact}
              min={0.1}
              max={0.9}
              step={0.01}
              onChange={(v) => setValue("default_mfact", v.toFixed(2))}
            />
          </div>
          <div ref={fieldRef("default_nmaster")}>
            <SliderRow
              label="Number of Masters"
              description="How many windows are kept in the master area."
              value={nmaster}
              min={1}
              max={20}
              step={1}
              onChange={(v) => setValue("default_nmaster", String(Math.round(v)))}
            />
          </div>
        </SectionCard>
      </div>

      <div className="mb-5">
        <SectionCard title="Centering">
          <div ref={fieldRef("center_master_overspread")}>
            <ToggleRow
              label="Center Master Overspread"
              description="Center the master window when it overspreads the available space."
              value={centerOverspread}
              onChange={tb("center_master_overspread")}
            />
          </div>
          <div ref={fieldRef("center_when_single_stack")}>
            <ToggleRow
              label="Center Single Stack"
              description="Center the single window in the stack area when there is only one."
              value={centerSingleStack}
              onChange={tb("center_when_single_stack")}
            />
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
