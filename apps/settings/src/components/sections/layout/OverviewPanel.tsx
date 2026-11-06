import { useConfigStore, useConfigBool, useGlobalInt } from "@/lib/config/store";
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

const CORNER_OPTIONS = globalOptions("hotarea_corner") ?? [];

export function OverviewPanel({ focusKey }: PanelProps) {
  const fieldRef = useFocusField(focusKey);
  const setValue = useConfigStore((s) => s.setValue);

  const tb = (key: string) => (v: boolean) => setValue(key, v ? "1" : "0");

  const enableHotarea = useConfigBool("enable_hotarea");
  const hotareaSize = useGlobalInt("hotarea_size");
  const hotareaCorner = useGlobalInt("hotarea_corner");
  const overview_gap_inner = useGlobalInt("overview_gap_inner");
  const overview_gap_outer = useGlobalInt("overview_gap_outer");

  return (
    <PanelShell>
      <PanelHeader
        title="Overview"
        description="Configure the overview mode: hot-corner activation, grid layout, tab display, and gap spacing."
        separator={false}
      />

      <div className="mb-5">
        <SectionCard title="Activation">
          <div ref={fieldRef("enable_hotarea")}>
            <ToggleRow
              label="Enable Hotarea"
              description="Activate overview by moving the cursor to a screen corner."
              value={enableHotarea}
              onChange={tb("enable_hotarea")}
            />
          </div>
          <div ref={fieldRef("hotarea_size")}>
            <SliderRow
              label="Hotarea Size"
              description="Size of the corner activation zone in pixels."
              value={hotareaSize}
              min={globalMin("hotarea_size") ?? 1}
              max={globalMax("hotarea_size") ?? 200}
              step={1}
              unit="px"
              enabled={enableHotarea}
              onChange={(v) => setValue("hotarea_size", String(Math.round(v)))}
            />
          </div>
          <div ref={fieldRef("hotarea_corner")}>
            <SelectRow
              label="Hotarea Corner"
              description="Which screen corner triggers the overview."
              value={String(hotareaCorner)}
              options={CORNER_OPTIONS}
              enabled={enableHotarea}
              onChange={(v) => setValue("hotarea_corner", v)}
            />
          </div>
        </SectionCard>
      </div>

      <div className="mb-5">
        <SectionCard title="Gaps">
          <div ref={fieldRef("overview_gap_inner")}>
            <SliderRow
              label="Inner Gap"
              description="Gap between windows inside the overview grid."
              value={overview_gap_inner}
              min={globalMin("overview_gap_inner") ?? 0}
              max={globalMax("overview_gap_inner") ?? 200}
              step={1}
              unit="px"
              onChange={(v) => setValue("overview_gap_inner", String(Math.round(v)))}
            />
          </div>
          <div ref={fieldRef("overview_gap_outer")}>
            <SliderRow
              label="Outer Gap"
              description="Gap between the overview grid and screen edges."
              value={overview_gap_outer}
              min={globalMin("overview_gap_outer") ?? 0}
              max={globalMax("overview_gap_outer") ?? 200}
              step={1}
              unit="px"
              onChange={(v) => setValue("overview_gap_outer", String(Math.round(v)))}
            />
          </div>
        </SectionCard>
      </div>
    </PanelShell>
  );
}
