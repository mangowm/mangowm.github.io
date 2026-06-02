import { useConfigStore } from "@/lib/config-store";
import { cfgBool, cfgInt } from "@/lib/config-helpers";
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

const CORNER_OPTIONS = [
  { value: "0", label: "Top Left" },
  { value: "1", label: "Top Right" },
  { value: "2", label: "Bottom Left" },
  { value: "3", label: "Bottom Right" },
];

export function OverviewPanel({ focusKey }: PanelProps) {
  const fieldRef = useFocusField(focusKey);
  const data = useConfigStore((s) => s.data);
  const setValue = useConfigStore((s) => s.setValue);

  const tb = (key: string) => (v: boolean) => setValue(key, v ? "1" : "0");

  const enableHotarea = cfgBool(data, "enable_hotarea");
  const hotareaSize = cfgInt(data, "hotarea_size", 10, 1, 1000);
  const hotareaCorner = cfgInt(data, "hotarea_corner", 2, 0, 3);
  const ovTabMode = cfgBool(data, "ov_tab_mode", true);
  const ovNoResize = cfgBool(data, "ov_no_resize", true);
  const overviewgappi = cfgInt(data, "overviewgappi", 5, 0, 1000);
  const overviewgappo = cfgInt(data, "overviewgappo", 30, 0, 1000);

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
        <SectionCard title="Grid Behavior">
          <div ref={fieldRef("ov_tab_mode")}>
            <ToggleRow
              label="Tab Mode"
              description="Show window tabs/headers in the overview grid."
              value={ovTabMode}
              onChange={tb("ov_tab_mode")}
            />
          </div>
          <div ref={fieldRef("ov_no_resize")}>
            <ToggleRow
              label="Disable Resize in Overview"
              description="Prevent window resize operations while overview mode is active."
              value={ovNoResize}
              onChange={tb("ov_no_resize")}
            />
          </div>
        </SectionCard>
      </div>

      <div className="mb-5">
        <SectionCard title="Gaps">
          <div ref={fieldRef("overviewgappi")}>
            <SliderRow
              label="Inner Gap"
              description="Gap between windows inside the overview grid."
              value={overviewgappi}
              min={0}
              max={200}
              step={1}
              unit="px"
              onChange={(v) => setValue("overviewgappi", String(Math.round(v)))}
            />
          </div>
          <div ref={fieldRef("overviewgappo")}>
            <SliderRow
              label="Outer Gap"
              description="Gap between the overview grid and screen edges."
              value={overviewgappo}
              min={0}
              max={200}
              step={1}
              unit="px"
              onChange={(v) => setValue("overviewgappo", String(Math.round(v)))}
            />
          </div>
        </SectionCard>
      </div>
    </PanelShell>
  );
}
