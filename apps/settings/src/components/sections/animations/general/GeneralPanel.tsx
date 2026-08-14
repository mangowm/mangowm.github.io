import { useConfigStore, useConfigBool, useConfigFloat, useConfigStr } from "@/lib/config-store";
import type { PanelProps } from "@/lib/section-types";
import { useFocusField } from "@/lib/use-focus-field";
import {
  PanelShell,
  PanelHeader,
  SectionCard,
  ToggleRow,
  SliderRow,
  SelectRow,
} from "@/components/sections/section-ui";
import { MotionPreview } from "../MotionPreview"; // Animation type options — empty string is mango's actual default (none selected)
const ANIM_TYPE_OPTIONS = [
  { value: "", label: "Default (none)" },
  { value: "none", label: "None" },
  { value: "fade", label: "Fade" },
  { value: "zoom", label: "Zoom" },
  { value: "slide", label: "Slide" },
];

// enum { VERTICAL, HORIZONTAL } → VERTICAL=0, HORIZONTAL=1
// Default in mango is HORIZONTAL (=1)
const DIRECTION_OPTIONS = [
  { value: "0", label: "Vertical" },
  { value: "1", label: "Horizontal" },
];

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

  const zoomInitial = useConfigFloat("zoom_initial_ratio", undefined, 0.1, 1.0);
  const zoomEnd = useConfigFloat("zoom_end_ratio", undefined, 0.1, 1.0);
  const fadeInOpacity = useConfigFloat("fadein_begin_opacity", undefined, 0.0, 1.0);
  const fadeOutOpacity = useConfigFloat("fadeout_begin_opacity", undefined, 0.0, 1.0);

  return (
    <PanelShell>
      <PanelHeader
        title="General Animation Settings"
        description="Master toggles, animation types, fade options, zoom ratios, and tag-switch direction."
        separator={false}
      />

      <div className="mb-5">
        <MotionPreview />
      </div>

      <div className="mb-5">
        <SectionCard title="Master Controls">
          <div ref={fieldRef("animations")}>
            <ToggleRow
              label="Enable Animations"
              description="Master toggle for all window animations."
              value={animationsOn}
              onChange={tb("animations")}
            />
          </div>

          {animationsOn ? (
            <>
              <div ref={fieldRef("layer_animations")}>
                <ToggleRow
                  label="Layer Animations"
                  description="Enable animations for layer-shell surfaces (panels, notifications, etc.)."
                  value={layerAnimationsOn}
                  onChange={tb("layer_animations")}
                />
              </div>
              <div ref={fieldRef("animation_fade_in")}>
                <ToggleRow
                  label="Fade In"
                  description="Fade windows in when they appear."
                  value={animFadeIn}
                  onChange={tb("animation_fade_in")}
                />
              </div>
              <div ref={fieldRef("animation_fade_out")}>
                <ToggleRow
                  label="Fade Out"
                  description="Fade windows out when they close."
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
                  label="Open Animation Type"
                  description="Animation style when a window opens."
                  value={animTypeOpen}
                  options={ANIM_TYPE_OPTIONS}
                  onChange={(v) => setValue("animation_type_open", v)}
                />
              </div>
              <div ref={fieldRef("animation_type_close")}>
                <SelectRow
                  label="Close Animation Type"
                  description="Animation style when a window closes."
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
                  label="Layer Open Animation Type"
                  description="Animation style when a layer-surface (panel, notification) opens."
                  value={layerAnimTypeOpen}
                  options={ANIM_TYPE_OPTIONS}
                  onChange={(v) => setValue("layer_animation_type_open", v)}
                />
              </div>
              <div ref={fieldRef("layer_animation_type_close")}>
                <SelectRow
                  label="Layer Close Animation Type"
                  description="Animation style when a layer-surface (panel, notification) closes."
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
                  label="Tag Animation Direction"
                  description="Direction of the tag-switch (workspace) animation."
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
                  label="Zoom Initial Ratio"
                  description="Starting scale factor for zoom animations (0.1–1.0)."
                  value={zoomInitial}
                  min={0.1}
                  max={1.0}
                  step={0.01}
                  onChange={(v) => setValue("zoom_initial_ratio", v.toFixed(2))}
                />
              </div>
              <div ref={fieldRef("zoom_end_ratio")}>
                <SliderRow
                  label="Zoom End Ratio"
                  description="Ending scale factor for zoom animations (0.1–1.0)."
                  value={zoomEnd}
                  min={0.1}
                  max={1.0}
                  step={0.01}
                  onChange={(v) => setValue("zoom_end_ratio", v.toFixed(2))}
                />
              </div>
              <div ref={fieldRef("fadein_begin_opacity")}>
                <SliderRow
                  label="Fade In Start Opacity"
                  description="Starting opacity for fade-in animations (0.0–1.0)."
                  value={fadeInOpacity}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={(v) => setValue("fadein_begin_opacity", v.toFixed(2))}
                />
              </div>
              <div ref={fieldRef("fadeout_begin_opacity")}>
                <SliderRow
                  label="Fade Out Start Opacity"
                  description="Starting opacity for fade-out animations (0.0–1.0)."
                  value={fadeOutOpacity}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={(v) => setValue("fadeout_begin_opacity", v.toFixed(2))}
                />
              </div>
            </SectionCard>
          </div>
        </>
      )}
    </PanelShell>
  );
}
