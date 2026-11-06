import { useConfigStore, useConfigBool, useConfigStr, useGlobalFloat } from "@/lib/config/store";
import { globalMax, globalMin, globalOptions } from "@/lib/config/schema-meta";
import type { PanelProps } from "@/lib/presentation/section-types";
import { useFocusField } from "@/lib/use-focus-field";
import {
  PanelShell,
  PanelHeader,
  SectionCard,
  ToggleRow,
  SliderRow,
  SelectRow,
} from "@/components/primitives/section-ui";

const ANIM_TYPE_OPTIONS = globalOptions("animation_type_open") ?? [];
const DIRECTION_OPTIONS = globalOptions("tag_animation_direction") ?? [];

export function GeneralPanel({ focusKey }: PanelProps) {
  const fieldRef = useFocusField(focusKey);
  const setValue = useConfigStore((s) => s.setValue);

  const tb = (key: string) => (v: boolean) => setValue(key, v ? "1" : "0");

  const animationsOn = useConfigBool("animations");
  const layerAnimationsOn = useConfigBool("layer_animations");
  const animFadeIn = useConfigBool("animation_fade_in");
  const animFadeOut = useConfigBool("animation_fade_out");

  const animTypeOpen = useConfigStr("animation_type_open");
  const animTypeClose = useConfigStr("animation_type_close");
  const layerAnimTypeOpen = useConfigStr("layer_animation_type_open");
  const layerAnimTypeClose = useConfigStr("layer_animation_type_close");

  const tagDir = useConfigStr("tag_animation_direction");

  const zoomInitial = useGlobalFloat("zoom_initial_ratio");
  const zoomEnd = useGlobalFloat("zoom_end_ratio");
  const fadeInOpacity = useGlobalFloat("fade_in_begin_opacity");
  const fadeOutOpacity = useGlobalFloat("fade_out_begin_opacity");

  return (
    <PanelShell>
      <PanelHeader
        title="General Animation Settings"
        description="Master toggles, animation types, fade options, zoom ratios, and tag-switch direction."
        separator={false}
      />

      <div className="mb-5">
        <SectionCard title="Master Controls">
          <div ref={fieldRef("animations")}>
            <ToggleRow configKey="animations" value={animationsOn} onChange={tb("animations")} />
          </div>

          {animationsOn ? (
            <>
              <div ref={fieldRef("layer_animations")}>
                <ToggleRow
                  configKey="layer_animations"
                  value={layerAnimationsOn}
                  onChange={tb("layer_animations")}
                />
              </div>
              <div ref={fieldRef("animation_fade_in")}>
                <ToggleRow
                  configKey="animation_fade_in"
                  value={animFadeIn}
                  onChange={tb("animation_fade_in")}
                />
              </div>
              <div ref={fieldRef("animation_fade_out")}>
                <ToggleRow
                  configKey="animation_fade_out"
                  value={animFadeOut}
                  onChange={tb("animation_fade_out")}
                />
              </div>
            </>
          ) : (
            <div className="px-4 py-3">
              <p className="text-[11px] text-muted-foreground/40 italic">
                Enable animations above to reveal advanced parameters.
              </p>
            </div>
          )}
        </SectionCard>
      </div>

      {animationsOn && (
        <>
          <div className="mb-5">
            <SectionCard title="Window Animation Types">
              <div ref={fieldRef("animation_type_open")}>
                <SelectRow
                  configKey="animation_type_open"
                  value={animTypeOpen}
                  options={ANIM_TYPE_OPTIONS}
                  onChange={(v) => setValue("animation_type_open", v)}
                />
              </div>
              <div ref={fieldRef("animation_type_close")}>
                <SelectRow
                  configKey="animation_type_close"
                  value={animTypeClose}
                  options={ANIM_TYPE_OPTIONS}
                  onChange={(v) => setValue("animation_type_close", v)}
                />
              </div>
            </SectionCard>
          </div>

          <div className="mb-5">
            <SectionCard title="Layer Animation Types">
              <div ref={fieldRef("layer_animation_type_open")}>
                <SelectRow
                  configKey="layer_animation_type_open"
                  value={layerAnimTypeOpen}
                  options={ANIM_TYPE_OPTIONS}
                  onChange={(v) => setValue("layer_animation_type_open", v)}
                />
              </div>
              <div ref={fieldRef("layer_animation_type_close")}>
                <SelectRow
                  configKey="layer_animation_type_close"
                  value={layerAnimTypeClose}
                  options={ANIM_TYPE_OPTIONS}
                  onChange={(v) => setValue("layer_animation_type_close", v)}
                />
              </div>
            </SectionCard>
          </div>

          <div className="mb-5">
            <SectionCard title="Tag Switch Direction">
              <div ref={fieldRef("tag_animation_direction")}>
                <SelectRow
                  configKey="tag_animation_direction"
                  value={tagDir}
                  options={DIRECTION_OPTIONS}
                  onChange={(v) => setValue("tag_animation_direction", v)}
                />
              </div>
            </SectionCard>
          </div>

          <div className="mb-5">
            <SectionCard title="Zoom &amp; Opacity Parameters">
              <div ref={fieldRef("zoom_initial_ratio")}>
                <SliderRow
                  configKey="zoom_initial_ratio"
                  value={zoomInitial}
                  min={globalMin("zoom_initial_ratio") ?? 0.1}
                  max={globalMax("zoom_initial_ratio") ?? 1}
                  step={0.01}
                  onChange={(v) => setValue("zoom_initial_ratio", v.toFixed(2))}
                />
              </div>
              <div ref={fieldRef("zoom_end_ratio")}>
                <SliderRow
                  configKey="zoom_end_ratio"
                  value={zoomEnd}
                  min={globalMin("zoom_end_ratio") ?? 0.1}
                  max={globalMax("zoom_end_ratio") ?? 1}
                  step={0.01}
                  onChange={(v) => setValue("zoom_end_ratio", v.toFixed(2))}
                />
              </div>
              <div ref={fieldRef("fade_in_begin_opacity")}>
                <SliderRow
                  configKey="fade_in_begin_opacity"
                  value={fadeInOpacity}
                  min={globalMin("fade_in_begin_opacity") ?? 0}
                  max={globalMax("fade_in_begin_opacity") ?? 1}
                  step={0.01}
                  onChange={(v) => setValue("fade_in_begin_opacity", v.toFixed(2))}
                />
              </div>
              <div ref={fieldRef("fade_out_begin_opacity")}>
                <SliderRow
                  configKey="fade_out_begin_opacity"
                  value={fadeOutOpacity}
                  min={globalMin("fade_out_begin_opacity") ?? 0}
                  max={globalMax("fade_out_begin_opacity") ?? 1}
                  step={0.01}
                  onChange={(v) => setValue("fade_out_begin_opacity", v.toFixed(2))}
                />
              </div>
            </SectionCard>
          </div>
        </>
      )}
    </PanelShell>
  );
}
