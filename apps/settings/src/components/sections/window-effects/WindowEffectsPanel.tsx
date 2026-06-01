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

export function WindowEffectsPanel({ focusKey }: PanelProps) {
  const fieldRef = useFocusField(focusKey);
  const data = useConfigStore((s) => s.data);
  const setValue = useConfigStore((s) => s.setValue);

  const blurOn = cfgBool(data, "blur");
  const blurLayerOn = cfgBool(data, "blur_layer");
  const blurOptimizedOn = cfgBool(data, "blur_optimized", true);
  const blurPasses = cfgInt(data, "blur_params_num_passes", 1, 1, 10);
  const blurRadius = cfgInt(data, "blur_params_radius", 5, 1, 32);
  const blurNoise = cfgFloat(data, "blur_params_noise", 0.02, 0, 1);
  const blurBrightness = cfgFloat(data, "blur_params_brightness", 0.9, 0, 1);
  const blurContrast = cfgFloat(data, "blur_params_contrast", 0.9, 0, 1);
  const blurSaturation = cfgFloat(data, "blur_params_saturation", 1.2, 0, 1);

  const radius = cfgInt(data, "border_radius", 0, 0, 64);

  const shadowsOn = cfgBool(data, "shadows");
  const shadowsFloatingOn = cfgBool(data, "shadow_only_floating", true);
  const layerShadowsOn = cfgBool(data, "layer_shadows");
  const shadowsSize = cfgInt(data, "shadows_size", 10, 0, 100);
  const shadowsBlur = cfgFloat(data, "shadows_blur", 15.0, 0, 20);
  const shadowsPosX = cfgInt(data, "shadows_position_x", 0, -100, 100);
  const shadowsPosY = cfgInt(data, "shadows_position_y", 0, -100, 100);

  const focusedOpacity = cfgFloat(data, "focused_opacity", 1.0, 0, 1);
  const unfocusedOpacity = cfgFloat(data, "unfocused_opacity", 1.0, 0, 1);

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
          <div ref={fieldRef("blur")}>
            <ToggleRow
              label="Enable Blur"
              description="Toggle background blur behind windows."
              value={blurOn}
              onChange={tb("blur")}
            />
          </div>

          {blurOn ? (
            <>
              <div ref={fieldRef("blur_layer")}>
                <ToggleRow
                  label="Layer Surfaces"
                  description="Apply blur to layer-shell surfaces (notifications, panels, etc.)."
                  value={blurLayerOn}
                  onChange={tb("blur_layer")}
                />
              </div>
              <div ref={fieldRef("blur_optimized")}>
                <ToggleRow
                  label="Optimized Blur"
                  description="Use a faster blur algorithm — slightly different visual quality."
                  value={blurOptimizedOn}
                  onChange={tb("blur_optimized")}
                />
              </div>
              <div ref={fieldRef("blur_params_num_passes")}>
                <SliderRow
                  label="Blur Passes"
                  description="Number of blur iterations — higher is smoother but more GPU work."
                  value={blurPasses}
                  min={1}
                  max={10}
                  onChange={(v) => setValue("blur_params_num_passes", String(v))}
                />
              </div>
              <div ref={fieldRef("blur_params_radius")}>
                <SliderRow
                  label="Blur Radius"
                  description="Pixel radius of the blur kernel."
                  value={blurRadius}
                  min={1}
                  max={32}
                  onChange={(v) => setValue("blur_params_radius", String(v))}
                />
              </div>
              <div ref={fieldRef("blur_params_noise")}>
                <SliderRow
                  label="Noise"
                  description="Adds grain to reduce banding artifacts (0.0 – 1.0)."
                  value={blurNoise}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={(v) => setValue("blur_params_noise", v.toFixed(2))}
                />
              </div>
              <div ref={fieldRef("blur_params_brightness")}>
                <SliderRow
                  label="Brightness"
                  description="Brightness multiplier for the blurred layer (0.0 – 1.0)."
                  value={blurBrightness}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={(v) => setValue("blur_params_brightness", v.toFixed(2))}
                />
              </div>
              <div ref={fieldRef("blur_params_contrast")}>
                <SliderRow
                  label="Contrast"
                  description="Contrast multiplier for the blurred layer (0.0 – 1.0)."
                  value={blurContrast}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={(v) => setValue("blur_params_contrast", v.toFixed(2))}
                />
              </div>
              <div ref={fieldRef("blur_params_saturation")}>
                <SliderRow
                  label="Saturation"
                  description="Saturation multiplier for the blurred layer (0.0 – 1.0)."
                  value={blurSaturation}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={(v) => setValue("blur_params_saturation", v.toFixed(2))}
                />
              </div>
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
          <div ref={fieldRef("border_radius")}>
            <SliderRow
              label="Radius"
              description="Corner rounding in pixels — 0 for sharp corners."
              value={radius}
              min={0}
              max={64}
              onChange={(v) => setValue("border_radius", String(v))}
            />
          </div>
        </SectionCard>
      </div>

      <div className="mb-5">
        <SectionCard title="Window Opacity">
          <div ref={fieldRef("focused_opacity")}>
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
          </div>
          <div ref={fieldRef("unfocused_opacity")}>
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
          </div>
        </SectionCard>
      </div>

      <div className="mb-5">
        <SectionCard title="Drop Shadows">
          <div ref={fieldRef("shadows")}>
            <ToggleRow
              label="Enable Shadows"
              description="Render drop shadows behind windows."
              value={shadowsOn}
              onChange={tb("shadows")}
            />
          </div>

          {shadowsOn ? (
            <>
              <div ref={fieldRef("shadow_only_floating")}>
                <ToggleRow
                  label="Floating Only"
                  description="Only draw shadows for floating (non-tiled) windows."
                  value={shadowsFloatingOn}
                  onChange={tb("shadow_only_floating")}
                />
              </div>
              <div ref={fieldRef("layer_shadows")}>
                <ToggleRow
                  label="Layer Surfaces"
                  description="Draw shadows under layer-shell surfaces as well."
                  value={layerShadowsOn}
                  onChange={tb("layer_shadows")}
                />
              </div>
              <div ref={fieldRef("shadows_size")}>
                <SliderRow
                  label="Size"
                  description="How far the shadow extends beyond the window edges."
                  value={shadowsSize}
                  min={0}
                  max={100}
                  onChange={(v) => setValue("shadows_size", String(v))}
                />
              </div>
              <div ref={fieldRef("shadows_blur")}>
                <SliderRow
                  label="Softness"
                  description="Gaussian blur sigma — higher values create softer shadows."
                  value={shadowsBlur}
                  min={0}
                  max={20}
                  step={0.1}
                  onChange={(v) => setValue("shadows_blur", v.toFixed(1))}
                />
              </div>
              <div ref={fieldRef("shadows_position_x")}>
                <SliderRow
                  label="Offset X"
                  description="Horizontal shadow offset (negative = left, positive = right)."
                  value={shadowsPosX}
                  min={-100}
                  max={100}
                  onChange={(v) => setValue("shadows_position_x", String(v))}
                />
              </div>
              <div ref={fieldRef("shadows_position_y")}>
                <SliderRow
                  label="Offset Y"
                  description="Vertical shadow offset (negative = up, positive = down)."
                  value={shadowsPosY}
                  min={-100}
                  max={100}
                  onChange={(v) => setValue("shadows_position_y", String(v))}
                />
              </div>
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
