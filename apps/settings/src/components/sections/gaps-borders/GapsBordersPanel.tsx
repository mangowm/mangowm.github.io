import { useConfigStore, useConfigBool, useGlobalInt } from "@/lib/config/store";
import type { PanelProps } from "@/lib/presentation/section-types";
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
  const innerHorizontal = useGlobalInt("gap_inner_horizontal");
  const innerVertical = useGlobalInt("gap_inner_vertical");
  const outerHorizontal = useGlobalInt("gap_outer_horizontal");
  const outerVertical = useGlobalInt("gap_outer_vertical");
  const borderWidth = useGlobalInt("border_px");
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
            <ToggleRow configKey="smart_gaps" value={smartGaps} onChange={toggle("smart_gaps")} />
          </div>
          <div ref={fieldRef("gap_inner_horizontal")}>
            <SliderRow
              configKey="gap_inner_horizontal"
              value={innerHorizontal}
              unit="px"
              onChange={(value) => setValue("gap_inner_horizontal", String(value))}
            />
          </div>
          <div ref={fieldRef("gap_inner_vertical")}>
            <SliderRow
              configKey="gap_inner_vertical"
              value={innerVertical}
              unit="px"
              onChange={(value) => setValue("gap_inner_vertical", String(value))}
            />
          </div>
          <div ref={fieldRef("gap_outer_horizontal")}>
            <SliderRow
              configKey="gap_outer_horizontal"
              value={outerHorizontal}
              unit="px"
              onChange={(value) => setValue("gap_outer_horizontal", String(value))}
            />
          </div>
          <div ref={fieldRef("gap_outer_vertical")}>
            <SliderRow
              configKey="gap_outer_vertical"
              value={outerVertical}
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
              configKey="border_px"
              value={borderWidth}
              unit="px"
              onChange={(value) => setValue("border_px", String(value))}
            />
          </div>
          <div ref={fieldRef("no_border_when_single")}>
            <ToggleRow
              configKey="no_border_when_single"
              value={noBorderSingle}
              onChange={toggle("no_border_when_single")}
            />
          </div>
          <div ref={fieldRef("no_radius_when_single")}>
            <ToggleRow
              configKey="no_radius_when_single"
              value={noRadiusSingle}
              onChange={toggle("no_radius_when_single")}
            />
          </div>
        </SectionCard>
      </div>
    </PanelShell>
  );
}
