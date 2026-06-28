import { useConfigStore, useConfigBool, useConfigInt, useConfigFloat } from "@/lib/config-store";
import type { PanelProps } from "@/lib/section-types";
import { useFocusField } from "@/lib/use-focus-field";
import {
  PanelShell,
  PanelHeader,
  SectionCard,
  ToggleRow,
  SliderRow,
} from "@/components/sections/section-ui";

export function WindowEffectsPanel({ focusKey }: PanelProps) {
  const fieldRef = useFocusField(focusKey);
  const setValue = useConfigStore((s) => s.setValue);

  const blurOn = useConfigBool("blur");
  const blurLayerOn = useConfigBool("blur_layer");
  const blurOptimizedOn = useConfigBool("blur_optimized");
  const blurPasses = useConfigInt("blur_params_num_passes", undefined, 1, 10);
  const blurRadius = useConfigInt("blur_params_radius", undefined, 1, 32);
  const blurNoise = useConfigFloat("blur_params_noise", undefined, 0, 1);
  const blurBrightness = useConfigFloat("blur_params_brightness", undefined, 0, 1);
  const blurContrast = useConfigFloat("blur_params_contrast", undefined, 0, 1);
  const blurSaturation = useConfigFloat("blur_params_saturation", undefined, 0, 2);

  const radius = useConfigInt("border_radius");

  const shadowsOn = useConfigBool("shadows");
  const shadowsFloatingOn = useConfigBool("shadow_only_floating");
  const layerShadowsOn = useConfigBool("layer_shadows");
  const shadowsSize = useConfigInt("shadows_size");
  const shadowsBlur = useConfigFloat("shadows_blur");
  const shadowsPosX = useConfigInt("shadows_position_x");
  const shadowsPosY = useConfigInt("shadows_position_y");

  const focusedOpacity = useConfigFloat("focused_opacity");
  const unfocusedOpacity = useConfigFloat("unfocused_opacity");

  const tb = (k: string) => (v: boolean) => setValue(k, v ? "1" : "0");

  return (
    <PanelShell>
      <PanelHeader
        title="Window Effects"
        description="Configure blur, shadows, border radius, and opacity for windows and surfaces."
        separator={false}
      />

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
                  description="Saturation multiplier for the blurred layer."
                  value={blurSaturation}
                  min={0}
                  max={2}
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
            <SliderRow
              label="Focused Opacity"
              description="Opacity of the currently focused window. 1.0 = fully opaque."
              value={focusedOpacity}
              min={0}
              max={1}
              step={0.01}
              onChange={(v) => setValue("focused_opacity", v.toFixed(2))}
            />
          </div>
          <div ref={fieldRef("unfocused_opacity")}>
            <SliderRow
              label="Unfocused Opacity"
              description="Opacity of unfocused (background) windows. Lower values make them dimmer."
              value={unfocusedOpacity}
              min={0}
              max={1}
              step={0.01}
              onChange={(v) => setValue("unfocused_opacity", v.toFixed(2))}
            />
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
    </PanelShell>
  );
}
