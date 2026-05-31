import { useConfigStore } from "@/lib/config-store";
import { useConfigSetter } from "@/lib/use-config-setter";
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

const DEFAULTS = {
  blur: "0",
  blur_layer: "0",
  blur_optimized: "1",
  blur_params_num_passes: "1",
  blur_params_radius: "5",
  blur_params_noise: "0.02",
  blur_params_brightness: "0.9",
  blur_params_contrast: "0.9",
  blur_params_saturation: "1.2",
  shadows: "0",
  shadow_only_floating: "1",
  layer_shadows: "0",
  shadows_size: "10",
  shadows_blur: "15.0",
  shadows_position_x: "0",
  shadows_position_y: "0",
  border_radius: "0",
  border_radius_location_default: "15",
  focused_opacity: "1.0",
  unfocused_opacity: "1.0",
} as const;

const CORNER_LOCATIONS = [
  { value: "15", label: "All Corners" },
  { value: "3", label: "Top Only" },
  { value: "12", label: "Bottom Only" },
  { value: "5", label: "Left Only" },
  { value: "10", label: "Right Only" },
  { value: "1", label: "Top Left" },
  { value: "2", label: "Top Right" },
  { value: "4", label: "Bottom Right" },
  { value: "8", label: "Bottom Left" },
  { value: "0", label: "None" },
] as const;

function readVal(data: Record<string, string[]>, key: string, fallback: string): string {
  const v = data[key as MangoConfigKey];
  return v?.[0] ?? fallback;
}

function isEnabled(data: Record<string, string[]>, key: string): boolean {
  return readVal(data, key, "0") === "1";
}

function clampInt(s: string, min: number, max: number): number {
  const n = parseInt(s, 10);
  return isNaN(n) ? min : Math.min(max, Math.max(min, n));
}

function clampFloat(s: string, min: number, max: number): number {
  const n = parseFloat(s);
  return isNaN(n) ? min : Math.min(max, Math.max(min, n));
}

function AccentHover() {
  return (
    <div className="absolute left-0 top-0 h-full w-[2px] scale-y-0 rounded-full bg-ring/50 transition-transform duration-200 group-hover:scale-y-100" />
  );
}

function Row({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
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
  unit,
  onChange,
  enabled,
}: {
  label: string;
  description: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (v: number) => void;
  enabled?: boolean;
}) {
  const isOff = enabled === false;
  return (
    <Row className={isOff ? "opacity-40 pointer-events-none" : ""}>
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
          {value}
          {unit ?? ""}
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
  options: readonly { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  const active = options.find((o) => o.value === value);
  return (
    <Row>
      <FieldLabel label={label} description={description} />
      <div className="shrink-0">
        <Select value={value} onValueChange={(v) => v !== null && onChange(v)}>
          <SelectTrigger className="w-44" aria-label={label}>
            <SelectValue>{active?.label ?? value}</SelectValue>
          </SelectTrigger>
          <SelectContent side="bottom" align="start">
            {options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                <span>{opt.label}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </Row>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
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

export function WindowEffectsPanel() {
  const data = useConfigStore((s) => s.data);
  const setValue = useConfigSetter();

  const blurOn = isEnabled(data, "blur");
  const blurLayerOn = isEnabled(data, "blur_layer");
  const blurOptimizedOn = isEnabled(data, "blur_optimized");
  const blurPasses = readVal(data, "blur_params_num_passes", DEFAULTS.blur_params_num_passes);
  const blurRadius = readVal(data, "blur_params_radius", DEFAULTS.blur_params_radius);
  const blurNoise = readVal(data, "blur_params_noise", DEFAULTS.blur_params_noise);
  const blurBrightness = readVal(data, "blur_params_brightness", DEFAULTS.blur_params_brightness);
  const blurContrast = readVal(data, "blur_params_contrast", DEFAULTS.blur_params_contrast);
  const blurSaturation = readVal(data, "blur_params_saturation", DEFAULTS.blur_params_saturation);

  const radius = readVal(data, "border_radius", DEFAULTS.border_radius);
  const radiusLoc = readVal(data, "border_radius_location_default", DEFAULTS.border_radius_location_default);

  const shadowsOn = isEnabled(data, "shadows");
  const shadowsFloatingOn = isEnabled(data, "shadow_only_floating");
  const layerShadowsOn = isEnabled(data, "layer_shadows");
  const shadowsSize = readVal(data, "shadows_size", DEFAULTS.shadows_size);
  const shadowsBlur = readVal(data, "shadows_blur", DEFAULTS.shadows_blur);
  const shadowsPosX = readVal(data, "shadows_position_x", DEFAULTS.shadows_position_x);
  const shadowsPosY = readVal(data, "shadows_position_y", DEFAULTS.shadows_position_y);

  const focusedOpacity = clampFloat(
    readVal(data, "focused_opacity", DEFAULTS.focused_opacity), 0.0, 1.0,
  );
  const unfocusedOpacity = clampFloat(
    readVal(data, "unfocused_opacity", DEFAULTS.unfocused_opacity), 0.0, 1.0,
  );

  const tb = (k: string) => (v: boolean) => setValue(k, v ? "1" : "0");

  return (
    <div className="mx-auto w-full max-w-4xl pb-12">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">Window Effects</h2>
          <p className="text-sm text-muted-foreground">
            Configure blur, shadows, border radius, and opacity for windows and surfaces.
          </p>
        </div>

      </div>

      <div className="mb-5">
        <SectionCard title="Background Blur">
          <ToggleRow
            label="Enable Blur"
            description="Toggle background blur behind windows."
            value={blurOn}
            onChange={tb("blur")}
          />

          {blurOn ? (
            <>
              <ToggleRow
                label="Layer Surfaces"
                description="Apply blur to layer-shell surfaces (notifications, panels, etc.)."
                value={blurLayerOn}
                onChange={tb("blur_layer")}
              />
              <ToggleRow
                label="Optimized Blur"
                description="Use a faster blur algorithm — slightly different visual quality."
                value={blurOptimizedOn}
                onChange={tb("blur_optimized")}
              />
              <SliderRow
                label="Blur Passes"
                description="Number of blur iterations — higher is smoother but more GPU work."
                value={clampInt(blurPasses, 1, 10)}
                min={1}
                max={10}
                onChange={(v) => setValue("blur_params_num_passes", String(v))}
              />
              <SliderRow
                label="Blur Radius"
                description="Pixel radius of the blur kernel."
                value={clampInt(blurRadius, 1, 32)}
                min={1}
                max={32}
                onChange={(v) => setValue("blur_params_radius", String(v))}
              />
              <SliderRow
                label="Noise"
                description="Adds grain to reduce banding artifacts (0.0 – 1.0)."
                value={clampFloat(blurNoise, 0, 1)}
                min={0}
                max={1}
                step={0.01}
                onChange={(v) => setValue("blur_params_noise", v.toFixed(2))}
              />
              <SliderRow
                label="Brightness"
                description="Brightness multiplier for the blurred layer (0.0 – 1.0)."
                value={clampFloat(blurBrightness, 0, 1)}
                min={0}
                max={1}
                step={0.01}
                onChange={(v) => setValue("blur_params_brightness", v.toFixed(2))}
              />
              <SliderRow
                label="Contrast"
                description="Contrast multiplier for the blurred layer (0.0 – 1.0)."
                value={clampFloat(blurContrast, 0, 1)}
                min={0}
                max={1}
                step={0.01}
                onChange={(v) => setValue("blur_params_contrast", v.toFixed(2))}
              />
              <SliderRow
                label="Saturation"
                description="Saturation multiplier for the blurred layer (0.0 – 1.0)."
                value={clampFloat(blurSaturation, 0, 1)}
                min={0}
                max={1}
                step={0.01}
                onChange={(v) => setValue("blur_params_saturation", v.toFixed(2))}
              />
            </>
          ) : (
            <div className="px-4 py-3">
              <p className="text-[11px] text-muted-foreground/40 italic">
                Enable blur above to reveal advanced parameters.
              </p>
            </div>
          )}
        </SectionCard>
      </div>

      <div className="mb-5">
        <SectionCard title="Border Radius">
          <SliderRow
            label="Radius"
            description="Corner rounding in pixels — 0 for sharp corners."
            value={clampInt(radius, 0, 64)}
            min={0}
            max={64}
            onChange={(v) => setValue("border_radius", String(v))}
          />
          <SelectRow
            label="Affected Corners"
            description="Which corners receive the radius."
            value={radiusLoc}
            options={CORNER_LOCATIONS}
            onChange={(v) => setValue("border_radius_location_default", v)}
          />
        </SectionCard>
      </div>

      <div className="mb-5">
        <SectionCard title="Window Opacity">
          <Row>
            <FieldLabel
              label="Focused Opacity"
              description="Opacity of the currently focused window. 1.0 = fully opaque."
            />
            <div className="flex w-44 shrink-0 items-center gap-3">
              <Slider
                value={[focusedOpacity]}
                min={0.0}
                max={1.0}
                step={0.01}
                onValueChange={(v) => {
                  const arr = Array.isArray(v) ? v : [v];
                  setValue("focused_opacity", arr[0].toFixed(2));
                }}
                className="flex-1"
                aria-label="Focused Opacity"
              />
              <span className="w-14 text-right font-mono text-[12px] tabular-nums text-foreground/80">
                {focusedOpacity.toFixed(2)}
              </span>
            </div>
          </Row>
          <Row>
            <FieldLabel
              label="Unfocused Opacity"
              description="Opacity of unfocused (background) windows. Lower values make them dimmer."
            />
            <div className="flex w-44 shrink-0 items-center gap-3">
              <Slider
                value={[unfocusedOpacity]}
                min={0.0}
                max={1.0}
                step={0.01}
                onValueChange={(v) => {
                  const arr = Array.isArray(v) ? v : [v];
                  setValue("unfocused_opacity", arr[0].toFixed(2));
                }}
                className="flex-1"
                aria-label="Unfocused Opacity"
              />
              <span className="w-14 text-right font-mono text-[12px] tabular-nums text-foreground/80">
                {unfocusedOpacity.toFixed(2)}
              </span>
            </div>
          </Row>
        </SectionCard>
      </div>

      <div className="mb-5">
        <SectionCard title="Drop Shadows">
          <ToggleRow
            label="Enable Shadows"
            description="Render drop shadows behind windows."
            value={shadowsOn}
            onChange={tb("shadows")}
          />

          {shadowsOn ? (
            <>
              <ToggleRow
                label="Floating Only"
                description="Only draw shadows for floating (non-tiled) windows."
                value={shadowsFloatingOn}
                onChange={tb("shadow_only_floating")}
              />
              <ToggleRow
                label="Layer Surfaces"
                description="Draw shadows under layer-shell surfaces as well."
                value={layerShadowsOn}
                onChange={tb("layer_shadows")}
              />
              <SliderRow
                label="Size"
                description="How far the shadow extends beyond the window edges."
                value={clampInt(shadowsSize, 0, 100)}
                min={0}
                max={100}
                onChange={(v) => setValue("shadows_size", String(v))}
              />
              <SliderRow
                label="Softness"
                description="Gaussian blur sigma — higher values create softer shadows."
                value={clampFloat(shadowsBlur, 0, 20)}
                min={0}
                max={20}
                step={0.1}
                onChange={(v) => setValue("shadows_blur", v.toFixed(1))}
              />
              <SliderRow
                label="Offset X"
                description="Horizontal shadow offset (negative = left, positive = right)."
                value={clampInt(shadowsPosX, -100, 100)}
                min={-100}
                max={100}
                onChange={(v) => setValue("shadows_position_x", String(v))}
              />
              <SliderRow
                label="Offset Y"
                description="Vertical shadow offset (negative = up, positive = down)."
                value={clampInt(shadowsPosY, -100, 100)}
                min={-100}
                max={100}
                onChange={(v) => setValue("shadows_position_y", String(v))}
              />
            </>
          ) : (
            <div className="px-4 py-3">
              <p className="text-[11px] text-muted-foreground/40 italic">
                Enable shadows above to reveal advanced parameters.
              </p>
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
