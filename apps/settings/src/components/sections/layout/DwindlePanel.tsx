import { useConfigStore, useConfigBool, useConfigStr, useGlobalFloat } from "@/lib/config/store";
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

const SPLIT_OPTIONS = globalOptions("dwindle_vertical_split") ?? [];

export function DwindlePanel({ focusKey }: PanelProps) {
  const fieldRef = useFocusField(focusKey);
  const setValue = useConfigStore((s) => s.setValue);

  const tb = (key: string) => (v: boolean) => setValue(key, v ? "1" : "0");

  const vsplit = useConfigStr("dwindle_vertical_split");
  const hsplit = useConfigStr("dwindle_horizontal_split");
  const preserveSplit = useConfigBool("dwindle_preserve_split");
  const smartSplit = useConfigBool("dwindle_smart_split");
  const smartResize = useConfigBool("dwindle_smart_resize");
  const dropSimple = useConfigBool("dwindle_drop_simple_split");
  const manualSplit = useConfigBool("dwindle_manual_split");
  const splitRatio = useGlobalFloat("dwindle_split_ratio");

  return (
    <PanelShell>
      <PanelHeader
        title="Dwindle"
        description="Configure the dwindle tiling layout: split direction policies, smart behavior, and split ratio."
        separator={false}
      />

      <div className="mb-5">
        <SectionCard title="Split Direction">
          <div ref={fieldRef("dwindle_vertical_split")}>
            <SelectRow
              configKey="dwindle_vertical_split"
              value={vsplit}
              options={SPLIT_OPTIONS}
              onChange={(v) => setValue("dwindle_vertical_split", v)}
            />
          </div>
          <div ref={fieldRef("dwindle_horizontal_split")}>
            <SelectRow
              configKey="dwindle_horizontal_split"
              value={hsplit}
              options={SPLIT_OPTIONS}
              onChange={(v) => setValue("dwindle_horizontal_split", v)}
            />
          </div>
          <div ref={fieldRef("dwindle_preserve_split")}>
            <ToggleRow
              configKey="dwindle_preserve_split"
              value={preserveSplit}
              onChange={tb("dwindle_preserve_split")}
            />
          </div>
        </SectionCard>
      </div>

      <div className="mb-5">
        <SectionCard title="Smart Behavior">
          <div ref={fieldRef("dwindle_smart_split")}>
            <ToggleRow
              configKey="dwindle_smart_split"
              value={smartSplit}
              onChange={tb("dwindle_smart_split")}
            />
          </div>
          <div ref={fieldRef("dwindle_smart_resize")}>
            <ToggleRow
              configKey="dwindle_smart_resize"
              value={smartResize}
              onChange={tb("dwindle_smart_resize")}
            />
          </div>
          <div ref={fieldRef("dwindle_drop_simple_split")}>
            <ToggleRow
              configKey="dwindle_drop_simple_split"
              value={dropSimple}
              onChange={tb("dwindle_drop_simple_split")}
            />
          </div>
          <div ref={fieldRef("dwindle_manual_split")}>
            <ToggleRow
              configKey="dwindle_manual_split"
              value={manualSplit}
              onChange={tb("dwindle_manual_split")}
            />
          </div>
        </SectionCard>
      </div>

      <div className="mb-5">
        <SectionCard title="Ratio">
          <div ref={fieldRef("dwindle_split_ratio")}>
            <SliderRow
              configKey="dwindle_split_ratio"
              value={splitRatio}
              min={globalMin("dwindle_split_ratio") ?? 0.05}
              max={globalMax("dwindle_split_ratio") ?? 0.95}
              step={0.01}
              onChange={(v) => setValue("dwindle_split_ratio", v.toFixed(2))}
            />
          </div>
        </SectionCard>
      </div>
    </PanelShell>
  );
}
