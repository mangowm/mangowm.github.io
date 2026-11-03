import { useConfigBool, useConfigInt, useConfigStore } from "@/lib/config/store";
import type { PanelProps } from "@/lib/section-types";
import { useFocusField } from "@/lib/use-focus-field";
import {
  PanelHeader,
  PanelShell,
  SectionCard,
  SliderRow,
  ToggleRow,
} from "@/components/primitives/section-ui";

export function GapsBordersPanel({ focusKey }: PanelProps) {
  const fieldRef = useFocusField(focusKey);
  const setValue = useConfigStore((state) => state.setValue);

  const smartGaps = useConfigBool("smart_gaps");
  const innerHorizontal = useConfigInt("gap_inner_horizontal", undefined, 0, 1000);
  const innerVertical = useConfigInt("gap_inner_vertical", undefined, 0, 1000);
  const outerHorizontal = useConfigInt("gap_outer_horizontal", undefined, 0, 1000);
  const outerVertical = useConfigInt("gap_outer_vertical", undefined, 0, 1000);
  const borderWidth = useConfigInt("border_px", undefined, 0, 200);
  const noBorderSingle = useConfigBool("no_border_when_single");
  const noRadiusSingle = useConfigBool("no_radius_when_single");

  const toggle = (key: string) => (value: boolean) => setValue(key, value ? "1" : "0");

  return (
    <PanelShell>
      <PanelHeader
        title="Gaps & Borders"
        description="Control spacing between windows, screen edges, and window border thickness."
        separator={false}
      />

      <div className="mb-5">
        <SectionCard title="Window Gaps">
          <div ref={fieldRef("smart_gaps")}>
            <ToggleRow
              label="Smart Gaps"
              description="Only show gaps when there are multiple windows on the same tag."
              value={smartGaps}
              onChange={toggle("smart_gaps")}
            />
          </div>
          <div ref={fieldRef("gap_inner_horizontal")}>
            <SliderRow
              label="Inner Gap Horizontal"
              description="Horizontal gap between tiled windows."
              value={innerHorizontal}
              min={0}
              max={1000}
              unit="px"
              onChange={(value) => setValue("gap_inner_horizontal", String(value))}
            />
          </div>
          <div ref={fieldRef("gap_inner_vertical")}>
            <SliderRow
              label="Inner Gap Vertical"
              description="Vertical gap between tiled windows."
              value={innerVertical}
              min={0}
              max={1000}
              unit="px"
              onChange={(value) => setValue("gap_inner_vertical", String(value))}
            />
          </div>
          <div ref={fieldRef("gap_outer_horizontal")}>
            <SliderRow
              label="Outer Gap Horizontal"
              description="Horizontal gap between windows and screen edges."
              value={outerHorizontal}
              min={0}
              max={1000}
              unit="px"
              onChange={(value) => setValue("gap_outer_horizontal", String(value))}
            />
          </div>
          <div ref={fieldRef("gap_outer_vertical")}>
            <SliderRow
              label="Outer Gap Vertical"
              description="Vertical gap between windows and screen edges."
              value={outerVertical}
              min={0}
              max={1000}
              unit="px"
              onChange={(value) => setValue("gap_outer_vertical", String(value))}
            />
          </div>
        </SectionCard>
      </div>

      <div className="mb-5">
        <SectionCard title="Border">
          <div ref={fieldRef("border_px")}>
            <SliderRow
              label="Border Width"
              description="Thickness of window borders in pixels."
              value={borderWidth}
              min={0}
              max={200}
              unit="px"
              onChange={(value) => setValue("border_px", String(value))}
            />
          </div>
          <div ref={fieldRef("no_border_when_single")}>
            <ToggleRow
              label="Hide Border When Solo"
              description="Remove window borders when only one window is visible on the tag."
              value={noBorderSingle}
              onChange={toggle("no_border_when_single")}
            />
          </div>
          <div ref={fieldRef("no_radius_when_single")}>
            <ToggleRow
              label="Hide Radius When Solo"
              description="Remove corner radius when only one window is visible on the tag."
              value={noRadiusSingle}
              onChange={toggle("no_radius_when_single")}
            />
          </div>
        </SectionCard>
      </div>
    </PanelShell>
  );
}
