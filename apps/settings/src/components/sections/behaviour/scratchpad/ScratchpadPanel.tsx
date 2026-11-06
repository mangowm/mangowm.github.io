import { useConfigStore, useConfigBool, useGlobalFloat } from "@/lib/config/store";
import type { PanelProps } from "@/lib/presentation/section-types";
import { useFocusField } from "@/lib/use-focus-field";
import {
  PanelShell,
  PanelHeader,
  SectionCard,
  ToggleRow,
  SliderRow,
} from "@/components/primitives/section-ui";

export function ScratchpadPanel({ focusKey }: PanelProps) {
  const fieldRef = useFocusField(focusKey);
  const setValue = useConfigStore((s) => s.setValue);

  const tb = (key: string) => (v: boolean) => setValue(key, v ? "1" : "0");

  const scratchpadCrossMon = useConfigBool("scratchpad_cross_monitor");
  const singleScratchpad = useConfigBool("single_scratchpad");
  const scratchpadWidth = useGlobalFloat("scratchpad_width_ratio");
  const scratchpadHeight = useGlobalFloat("scratchpad_height_ratio");

  return (
    <PanelShell>
      <PanelHeader
        title="Scratchpad"
        description="Configure scratchpad window behaviour."
        separator={false}
      />

      <div className="mb-5">
        <SectionCard title="Behaviour">
          <div ref={fieldRef("single_scratchpad")}>
            <ToggleRow
              label="Single Scratchpad"
              description="Only one scratchpad window exists at a time. Opening a new one hides the previous."
              value={singleScratchpad}
              onChange={tb("single_scratchpad")}
            />
          </div>
          <div ref={fieldRef("scratchpad_cross_monitor")}>
            <ToggleRow
              label="Cross-Monitor"
              description="Scratchpad windows can be shown on any monitor, not just the one they were moved from."
              value={scratchpadCrossMon}
              onChange={tb("scratchpad_cross_monitor")}
            />
          </div>
        </SectionCard>
      </div>

      <div className="mb-5">
        <SectionCard title="Size">
          <div ref={fieldRef("scratchpad_width_ratio")}>
            <SliderRow
              configKey="scratchpad_width_ratio"
              label="Width Ratio"
              description="Width of the scratchpad window relative to the monitor. Mango range: 0.1–1.0."
              value={scratchpadWidth}
              step={0.05}
              onChange={(v) => setValue("scratchpad_width_ratio", v.toFixed(2))}
            />
          </div>
          <div ref={fieldRef("scratchpad_height_ratio")}>
            <SliderRow
              configKey="scratchpad_height_ratio"
              label="Height Ratio"
              description="Height of the scratchpad window relative to the monitor. Mango range: 0.1–1.0."
              value={scratchpadHeight}
              step={0.05}
              onChange={(v) => setValue("scratchpad_height_ratio", v.toFixed(2))}
            />
          </div>
        </SectionCard>
      </div>
    </PanelShell>
  );
}
