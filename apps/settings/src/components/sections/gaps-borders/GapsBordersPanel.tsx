import { useConfigStore, useConfigBool, useConfigInt } from "@/lib/config-store";
import type { PanelProps } from "@/lib/section-types";
import { useFocusField } from "@/lib/use-focus-field";
import {
  PanelShell,
  PanelHeader,
  SectionCard,
  ToggleRow,
  SliderRow,
} from "@/components/sections/section-ui";

export function GapsBordersPanel({ focusKey }: PanelProps) {
  const fieldRef = useFocusField(focusKey);
  const setValue = useConfigStore((s) => s.setValue);

  const smartgapsOn = useConfigBool("smartgaps");
  const gappih = useConfigInt("gappih", 5, 0, 1000);
  const gappiv = useConfigInt("gappiv", 5, 0, 1000);
  const gappoh = useConfigInt("gappoh", 10, 0, 1000);
  const gappov = useConfigInt("gappov", 10, 0, 1000);
  const borderpx = useConfigInt("borderpx", 4, 0, 200);
  const noBorderSingle = useConfigBool("no_border_when_single");
  const noRadiusSingle = useConfigBool("no_radius_when_single");

  const tb = (k: string) => (v: boolean) => setValue(k, v ? "1" : "0");

  return (
    <PanelShell>
      <PanelHeader
        title="Gaps &amp; Borders"
        description="Control spacing between windows, screen edges, and window border thickness."
        separator={false}
      />

      <div className="mb-5">
        <SectionCard title="Window Gaps">
          <div ref={fieldRef("smartgaps")}>
            <ToggleRow
              label="Smart Gaps"
              description="Only show gaps when there are multiple windows on the same tag."
              value={smartgapsOn}
              onChange={tb("smartgaps")}
            />
          </div>
          <div ref={fieldRef("gappih")}>
            <SliderRow
              label="Inner Gap Horizontal"
              description="Horizontal gap between tiled windows."
              value={gappih}
              min={0}
              max={1000}
              unit="px"
              onChange={(v) => setValue("gappih", String(v))}
            />
          </div>
          <div ref={fieldRef("gappiv")}>
            <SliderRow
              label="Inner Gap Vertical"
              description="Vertical gap between tiled windows."
              value={gappiv}
              min={0}
              max={1000}
              unit="px"
              onChange={(v) => setValue("gappiv", String(v))}
            />
          </div>
          <div ref={fieldRef("gappoh")}>
            <SliderRow
              label="Outer Gap Horizontal"
              description="Horizontal gap between windows and screen edges."
              value={gappoh}
              min={0}
              max={1000}
              unit="px"
              onChange={(v) => setValue("gappoh", String(v))}
            />
          </div>
          <div ref={fieldRef("gappov")}>
            <SliderRow
              label="Outer Gap Vertical"
              description="Vertical gap between windows and screen edges."
              value={gappov}
              min={0}
              max={1000}
              unit="px"
              onChange={(v) => setValue("gappov", String(v))}
            />
          </div>
        </SectionCard>
      </div>

      <div className="mb-5">
        <SectionCard title="Border">
          <div ref={fieldRef("borderpx")}>
            <SliderRow
              label="Border Width"
              description="Thickness of window borders in pixels."
              value={borderpx}
              min={0}
              max={200}
              unit="px"
              onChange={(v) => setValue("borderpx", String(v))}
            />
          </div>
          <div ref={fieldRef("no_border_when_single")}>
            <ToggleRow
              label="Hide Border When Solo"
              description="Remove window borders when only one window is visible on the tag."
              value={noBorderSingle}
              onChange={tb("no_border_when_single")}
            />
          </div>
          <div ref={fieldRef("no_radius_when_single")}>
            <ToggleRow
              label="Hide Radius When Solo"
              description="Remove corner radius when only one window is visible on the tag."
              value={noRadiusSingle}
              onChange={tb("no_radius_when_single")}
            />
          </div>
        </SectionCard>
      </div>
    </PanelShell>
  );
}
