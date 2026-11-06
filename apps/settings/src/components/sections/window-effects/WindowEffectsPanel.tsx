import {
  useConfigStore,
  useConfigBool,
  useConfigInt,
  useConfigFloat,
  useGlobalInt,
  useGlobalFloat,
} from "@/lib/config/store";
import type { PanelProps } from "@/lib/presentation/section-types";
import { useFocusField } from "@/lib/use-focus-field";
import {
  PanelShell,
  PanelHeader,
  SectionCard,
  ToggleRow,
  SliderRow,
} from "@/components/primitives/section-ui";

export function WindowEffectsPanel({ focusKey }: PanelProps) {
  const fieldRef = useFocusField(focusKey);
  const setValue = useConfigStore((s) => s.setValue);

  const blurOn = useConfigBool("blur");
  const blurLayerOn = useConfigBool("blur_layer");
  const blurOptimizedOn = useConfigBool("blur_optimized");
  const blurPasses = useGlobalInt("blur_params_num_passes");
  const blurRadius = useGlobalInt("blur_params_radius");
  const blurNoise = useGlobalFloat("blur_params_noise");
  const blurBrightness = useGlobalFloat("blur_params_brightness");
  const blurContrast = useGlobalFloat("blur_params_contrast");
  const blurSaturation = useGlobalFloat("blur_params_saturation");

  const radius = useConfigInt("border_radius");

  const shadowsOn = useConfigBool("shadows");
  const shadowsFloatingOn = useConfigBool("shadow_only_floating");
  const layerShadowsOn = useConfigBool("layer_shadows");
  const shadowsSize = useConfigInt("shadows_size");
  const shadowsBlur = useGlobalInt("shadows_blur");
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
            <ToggleRow configKey="blur" value={blurOn} onChange={tb("blur")} />
          </div>

          {blurOn ? (
            <>
              <div ref={fieldRef("blur_layer")}>
                <ToggleRow configKey="blur_layer" value={blurLayerOn} onChange={tb("blur_layer")} />
              </div>
              <div ref={fieldRef("blur_optimized")}>
                <ToggleRow
                  configKey="blur_optimized"
                  value={blurOptimizedOn}
                  onChange={tb("blur_optimized")}
                />
              </div>
              <div ref={fieldRef("blur_params_num_passes")}>
                <SliderRow
                  configKey="blur_params_num_passes"
                  value={blurPasses}
                  onChange={(v) => setValue("blur_params_num_passes", String(v))}
                />
              </div>
              <div ref={fieldRef("blur_params_radius")}>
                <SliderRow
                  configKey="blur_params_radius"
                  value={blurRadius}
                  onChange={(v) => setValue("blur_params_radius", String(v))}
                />
              </div>
              <div ref={fieldRef("blur_params_noise")}>
                <SliderRow
                  configKey="blur_params_noise"
                  value={blurNoise}
                  step={0.01}
                  onChange={(v) => setValue("blur_params_noise", v.toFixed(2))}
                />
              </div>
              <div ref={fieldRef("blur_params_brightness")}>
                <SliderRow
                  configKey="blur_params_brightness"
                  value={blurBrightness}
                  step={0.01}
                  onChange={(v) => setValue("blur_params_brightness", v.toFixed(2))}
                />
              </div>
              <div ref={fieldRef("blur_params_contrast")}>
                <SliderRow
                  configKey="blur_params_contrast"
                  value={blurContrast}
                  step={0.01}
                  onChange={(v) => setValue("blur_params_contrast", v.toFixed(2))}
                />
              </div>
              <div ref={fieldRef("blur_params_saturation")}>
                <SliderRow
                  configKey="blur_params_saturation"
                  value={blurSaturation}
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
              configKey="border_radius"
              value={radius}
              onChange={(v) => setValue("border_radius", String(v))}
            />
          </div>
        </SectionCard>
      </div>

      <div className="mb-5">
        <SectionCard title="Window Opacity">
          <div ref={fieldRef("focused_opacity")}>
            <SliderRow
              configKey="focused_opacity"
              value={focusedOpacity}
              step={0.01}
              onChange={(v) => setValue("focused_opacity", v.toFixed(2))}
            />
          </div>
          <div ref={fieldRef("unfocused_opacity")}>
            <SliderRow
              configKey="unfocused_opacity"
              value={unfocusedOpacity}
              step={0.01}
              onChange={(v) => setValue("unfocused_opacity", v.toFixed(2))}
            />
          </div>
        </SectionCard>
      </div>

      <div className="mb-5">
        <SectionCard title="Drop Shadows">
          <div ref={fieldRef("shadows")}>
            <ToggleRow configKey="shadows" value={shadowsOn} onChange={tb("shadows")} />
          </div>

          {shadowsOn ? (
            <>
              <div ref={fieldRef("shadow_only_floating")}>
                <ToggleRow
                  configKey="shadow_only_floating"
                  value={shadowsFloatingOn}
                  onChange={tb("shadow_only_floating")}
                />
              </div>
              <div ref={fieldRef("layer_shadows")}>
                <ToggleRow
                  configKey="layer_shadows"
                  value={layerShadowsOn}
                  onChange={tb("layer_shadows")}
                />
              </div>
              <div ref={fieldRef("shadows_size")}>
                <SliderRow
                  configKey="shadows_size"
                  value={shadowsSize}
                  onChange={(v) => setValue("shadows_size", String(v))}
                />
              </div>
              <div ref={fieldRef("shadows_blur")}>
                <SliderRow
                  configKey="shadows_blur"
                  value={shadowsBlur}
                  onChange={(v) => setValue("shadows_blur", String(v))}
                />
              </div>
              <div ref={fieldRef("shadows_position_x")}>
                <SliderRow
                  configKey="shadows_position_x"
                  value={shadowsPosX}
                  onChange={(v) => setValue("shadows_position_x", String(v))}
                />
              </div>
              <div ref={fieldRef("shadows_position_y")}>
                <SliderRow
                  configKey="shadows_position_y"
                  value={shadowsPosY}
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
