import { useConfigStore } from "@/lib/config-store";
import { cfgBool, cfgInt } from "@/lib/config-helpers";
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

function Row({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={
        "group relative flex items-center gap-4 px-4 py-2.5 transition-colors duration-150 hover:bg-muted/15 " +
        className
      }
    >
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
          {value}
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

export function GapsBordersPanel({ focusKey }: PanelProps) {
  const fieldRef = useFocusField(focusKey);
  const data = useConfigStore((s) => s.data);
  const setValue = useConfigStore((s) => s.setValue);

  const smartgapsOn = cfgBool(data, "smartgaps");
  const gappih = cfgInt(data, "gappih", 5, 0, 1000);
  const gappiv = cfgInt(data, "gappiv", 5, 0, 1000);
  const gappoh = cfgInt(data, "gappoh", 10, 0, 1000);
  const gappov = cfgInt(data, "gappov", 10, 0, 1000);
  const borderpx = cfgInt(data, "borderpx", 4, 0, 200);
  const noBorderSingle = cfgBool(data, "no_border_when_single");
  const noRadiusSingle = cfgBool(data, "no_radius_when_single");

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
          <div ref={fieldRef("smartgaps")}>
          <ToggleRow
            label="Smart Gaps"
            description="Only show gaps when there are multiple windows on the same tag."
            value={smartgapsOn}
            onChange={tb("smartgaps")}
          />
          </div>
          <div ref={fieldRef("gappih")}>
          <SliderRow
            label="Inner Gap Horizontal"
            description="Horizontal gap between tiled windows."
            value={gappih}
            min={0}
            max={1000}
            unit="px"
            onChange={(v) => setValue("gappih", String(v))}
          />
          </div>
          <div ref={fieldRef("gappiv")}>
          <SliderRow
            label="Inner Gap Vertical"
            description="Vertical gap between tiled windows."
            value={gappiv}
            min={0}
            max={1000}
            unit="px"
            onChange={(v) => setValue("gappiv", String(v))}
          />
          </div>
          <div ref={fieldRef("gappoh")}>
          <SliderRow
            label="Outer Gap Horizontal"
            description="Horizontal gap between windows and screen edges."
            value={gappoh}
            min={0}
            max={1000}
            unit="px"
            onChange={(v) => setValue("gappoh", String(v))}
          />
          </div>
          <div ref={fieldRef("gappov")}>
          <SliderRow
            label="Outer Gap Vertical"
            description="Vertical gap between windows and screen edges."
            value={gappov}
            min={0}
            max={1000}
            unit="px"
            onChange={(v) => setValue("gappov", String(v))}
          />
          </div>
        </SectionCard>
      </div>

      <div className="mb-5">
        <SectionCard title="Border">
          <div ref={fieldRef("borderpx")}>
          <SliderRow
            label="Border Width"
            description="Thickness of window borders in pixels."
            value={borderpx}
            min={0}
            max={200}
            unit="px"
            onChange={(v) => setValue("borderpx", String(v))}
          />
          </div>
          <div ref={fieldRef("no_border_when_single")}>
          <ToggleRow
            label="Hide Border When Solo"
            description="Remove window borders when only one window is visible on the tag."
            value={noBorderSingle}
            onChange={tb("no_border_when_single")}
          />
          </div>
          <div ref={fieldRef("no_radius_when_single")}>
          <ToggleRow
            label="Hide Radius When Solo"
            description="Remove corner radius when only one window is visible on the tag."
            value={noRadiusSingle}
            onChange={tb("no_radius_when_single")}
          />
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
