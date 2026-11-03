import { useConfigStore, useConfigBool, useConfigInt } from "@/lib/config/store";
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

const CORNER_OPTIONS = [
  { value: "0", label: "Top Left" },
  { value: "1", label: "Top Right" },
  { value: "2", label: "Bottom Left" },
  { value: "3", label: "Bottom Right" },
];

export function OverviewPanel({ focusKey }: PanelProps) {
  const fieldRef = useFocusField(focusKey);
  const setValue = useConfigStore((s) => s.setValue);

  const tb = (key: string) => (v: boolean) => setValue(key, v ? "1" : "0");

  const enableHotarea = useConfigBool("enable_hotarea");
  const hotareaSize = useConfigInt("hotarea_size", undefined, 1, 1000);
  const hotareaCorner = useConfigInt("hotarea_corner", undefined, 0, 3);
  const overview_gap_inner = useConfigInt("overview_gap_inner", undefined, 0, 1000);
  const overview_gap_outer = useConfigInt("overview_gap_outer", undefined, 0, 1000);

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
              min={1}
              max={200}
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
              min={0}
              max={200}
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
              min={0}
              max={200}
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
