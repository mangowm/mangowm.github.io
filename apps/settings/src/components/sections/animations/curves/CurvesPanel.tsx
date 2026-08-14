import { useConfigStore, useConfigStr } from "@/lib/config-store";
import type { PanelProps } from "@/lib/section-types";
import { useFocusField } from "@/lib/use-focus-field";
import { PanelShell, PanelHeader, SectionCard } from "@/components/sections/section-ui";
import { CurveInputRow } from "./CurveInputRow";

const CURVE_PLACEHOLDER = "x1,y1,x2,y2 — e.g. 0.46,1.0,0.29,0.99";

export function CurvesPanel({ focusKey }: PanelProps) {
  const fieldRef = useFocusField(focusKey);
  const setValue = useConfigStore((s) => s.setValue);

  const curveMove = useConfigStr("animation_curve_move");
  const curveOpen = useConfigStr("animation_curve_open");
  const curveClose = useConfigStr("animation_curve_close");
  const curveTag = useConfigStr("animation_curve_tag");
  const curveFocus = useConfigStr("animation_curve_focus");
  const curveFadeIn = useConfigStr("animation_curve_opafadein");
  const curveFadeOut = useConfigStr("animation_curve_opafadeout");

  return (
    <PanelShell>
      <PanelHeader
        title="Animation Curves"
        description="Define custom cubic-bezier curves for each animation type. Format: four comma-separated values — x1,y1,x2,y2 (each 0.0–1.0, but x values should stay in the 0–1 range)."
        separator={false}
      />

      <div className="mb-5">
        <SectionCard title="Window Animations">
          <div ref={fieldRef("animation_curve_move")}>
            <CurveInputRow
              label="Move / Resize"
              description="Bezier curve for move and resize animations."
              value={curveMove}
              placeholder={CURVE_PLACEHOLDER}
              onChange={(v) => setValue("animation_curve_move", v)}
            />
          </div>
          <div ref={fieldRef("animation_curve_open")}>
            <CurveInputRow
              label="Window Open"
              description="Bezier curve when a new window opens."
              value={curveOpen}
              placeholder={CURVE_PLACEHOLDER}
              onChange={(v) => setValue("animation_curve_open", v)}
            />
          </div>
          <div ref={fieldRef("animation_curve_close")}>
            <CurveInputRow
              label="Window Close"
              description="Bezier curve when a window closes."
              value={curveClose}
              placeholder={CURVE_PLACEHOLDER}
              onChange={(v) => setValue("animation_curve_close", v)}
            />
          </div>
          <div ref={fieldRef("animation_curve_tag")}>
            <CurveInputRow
              label="Tag Switch"
              description="Bezier curve for tag-switch (workspace) animations."
              value={curveTag}
              placeholder={CURVE_PLACEHOLDER}
              onChange={(v) => setValue("animation_curve_tag", v)}
            />
          </div>
          <div ref={fieldRef("animation_curve_focus")}>
            <CurveInputRow
              label="Focus Change"
              description="Bezier curve for focus-change animations."
              value={curveFocus}
              placeholder={CURVE_PLACEHOLDER}
              onChange={(v) => setValue("animation_curve_focus", v)}
            />
          </div>
        </SectionCard>
      </div>

      <div className="mb-5">
        <SectionCard title="Opacity Animations">
          <div ref={fieldRef("animation_curve_opafadein")}>
            <CurveInputRow
              label="Fade In Opacity"
              description="Bezier curve for fade-in opacity transitions."
              value={curveFadeIn}
              placeholder={CURVE_PLACEHOLDER}
              onChange={(v) => setValue("animation_curve_opafadein", v)}
            />
          </div>
          <div ref={fieldRef("animation_curve_opafadeout")}>
            <CurveInputRow
              label="Fade Out Opacity"
              description="Bezier curve for fade-out opacity transitions."
              value={curveFadeOut}
              placeholder={CURVE_PLACEHOLDER}
              onChange={(v) => setValue("animation_curve_opafadeout", v)}
            />
          </div>
        </SectionCard>
      </div>
    </PanelShell>
  );
}
