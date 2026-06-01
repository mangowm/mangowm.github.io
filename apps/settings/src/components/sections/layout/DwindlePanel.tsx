import { useConfigStore } from "@/lib/config-store";
import { cfgBool, cfgFloat, cfgStr } from "@/lib/config-helpers";
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

const SPLIT_OPTIONS = [
  { value: "0", label: "Off" },
  { value: "1", label: "Smart" },
  { value: "2", label: "Force" },
];



export function DwindlePanel({ focusKey }: PanelProps) {
  const fieldRef = useFocusField(focusKey);
  const data = useConfigStore((s) => s.data);
  const setValue = useConfigStore((s) => s.setValue);

  const tb = (key: string) => (v: boolean) => setValue(key, v ? "1" : "0");

  const vsplit = cfgStr(data, "dwindle_vsplit", "1");
  const hsplit = cfgStr(data, "dwindle_hsplit", "1");
  const preserveSplit = cfgBool(data, "dwindle_preserve_split");
  const smartSplit = cfgBool(data, "dwindle_smart_split");
  const smartResize = cfgBool(data, "dwindle_smart_resize");
  const dropSimple = cfgBool(data, "dwindle_drop_simple_split", true);
  const manualSplit = cfgBool(data, "dwindle_manual_split");
  const splitRatio = cfgFloat(data, "dwindle_split_ratio", 0.5, 0.05, 0.95);

  return (
    <PanelShell>
      <PanelHeader
        title="Dwindle"
        description="Configure the dwindle tiling layout: split direction policies, smart behavior, and split ratio."
        separator={false}
      />

      <div className="mb-5">
        <SectionCard title="Split Direction">
          <div ref={fieldRef("dwindle_vsplit")}>
            <SelectRow
              label="Vertical Split"
              description="Policy for vertical splits. Off = never, Smart = automatic, Force = always."
              value={vsplit}
              options={SPLIT_OPTIONS}
              onChange={(v) => setValue("dwindle_vsplit", v)}
            />
          </div>
          <div ref={fieldRef("dwindle_hsplit")}>
            <SelectRow
              label="Horizontal Split"
              description="Policy for horizontal splits. Off = never, Smart = automatic, Force = always."
              value={hsplit}
              options={SPLIT_OPTIONS}
              onChange={(v) => setValue("dwindle_hsplit", v)}
            />
          </div>
          <div ref={fieldRef("dwindle_preserve_split")}>
            <ToggleRow
              label="Preserve Split"
              description="Keep the current split direction when inserting a new window."
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
              label="Smart Split"
              description="Automatically choose split direction based on the window's dimensions."
              value={smartSplit}
              onChange={tb("dwindle_smart_split")}
            />
          </div>
          <div ref={fieldRef("dwindle_smart_resize")}>
            <ToggleRow
              label="Smart Resize"
              description="Intelligently resize adjacent windows during resize operations."
              value={smartResize}
              onChange={tb("dwindle_smart_resize")}
            />
          </div>
          <div ref={fieldRef("dwindle_drop_simple_split")}>
            <ToggleRow
              label="Drop Simple Split"
              description="Fall back to a simple split when smart split cannot determine a direction."
              value={dropSimple}
              onChange={tb("dwindle_drop_simple_split")}
            />
          </div>
          <div ref={fieldRef("dwindle_manual_split")}>
            <ToggleRow
              label="Manual Split"
              description="Require explicit split direction input instead of automatic detection."
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
              label="Split Ratio"
              description="Proportion of space allotted to the first child when a split occurs."
              value={splitRatio}
              min={0.05}
              max={0.95}
              step={0.01}
              onChange={(v) => setValue("dwindle_split_ratio", v.toFixed(2))}
            />
          </div>
        </SectionCard>
      </div>
    </PanelShell>
  );
}
