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
              configKey="single_scratchpad"
              value={singleScratchpad}
              onChange={tb("single_scratchpad")}
            />
          </div>
          <div ref={fieldRef("scratchpad_cross_monitor")}>
            <ToggleRow
              configKey="scratchpad_cross_monitor"
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
              value={scratchpadWidth}
              step={0.05}
              onChange={(v) => setValue("scratchpad_width_ratio", v.toFixed(2))}
            />
          </div>
          <div ref={fieldRef("scratchpad_height_ratio")}>
            <SliderRow
              configKey="scratchpad_height_ratio"
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
