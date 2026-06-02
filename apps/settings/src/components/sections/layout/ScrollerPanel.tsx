import { useCallback } from "react";
import { useConfigStore } from "@/lib/config-store";
import { cfgBool, cfgInt, cfgFloat, cfgStr } from "@/lib/config-helpers";
import type { PanelProps } from "@/lib/section-types";
import { useFocusField } from "@/lib/use-focus-field";
import {
  PanelShell,
  PanelHeader,
  SectionCard,
  ToggleRow,
  SliderRow,
  MultiTagInput,
} from "@/components/sections/section-ui";

/**
 * Keep only valid proportion values (0.1–1.0, 2-decimal precision).
 * Silently drops anything that doesn't parse as a number in range.
 */
function sanitizePresetValue(raw: string): string {
  const cleaned = raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => {
      const n = parseFloat(s);
      return !isNaN(n) && n >= 0.1 && n <= 1.0;
    })
    .map((s) => Math.round(parseFloat(s) * 100) / 100)
    .join(",");
  return cleaned;
}

export function ScrollerPanel({ focusKey }: PanelProps) {
  const fieldRef = useFocusField(focusKey);
  const data = useConfigStore((s) => s.data);
  const setValue = useConfigStore((s) => s.setValue);

  const tb = (key: string) => (v: boolean) => setValue(key, v ? "1" : "0");

  const defaultProportion = cfgFloat(data, "scroller_default_proportion", 0.9, 0.1, 1.0);
  const defaultSingle = cfgFloat(data, "scroller_default_proportion_single", 1.0, 0.1, 1.0);
  const ignoreSingle = cfgBool(data, "scroller_ignore_proportion_single", true);
  const focusCenter = cfgBool(data, "scroller_focus_center");
  const preferCenter = cfgBool(data, "scroller_prefer_center");
  const preferOverspread = cfgBool(data, "scroller_prefer_overspread", true);
  const pointerFocus = cfgBool(data, "edge_scroller_pointer_focus", true);
  const allowSpeed = cfgFloat(data, "edge_scroller_focus_allow_speed", 0.0, 0.0, 1000.0);
  const structs = cfgInt(data, "scroller_structs", 20, 0, 1000);

  const presetValue = cfgStr(data, "scroller_proportion_preset", "");

  const handlePresetChange = useCallback(
    (raw: string) => {
      setValue("scroller_proportion_preset", sanitizePresetValue(raw));
    },
    [setValue],
  );

  return (
    <PanelShell>
      <PanelHeader
        title="Scroller"
        description="Configure the scroller tiling layout: window proportions, focus behavior, edge scrolling, and preset values."
        separator={false}
      />

      <div className="mb-5">
        <SectionCard title="Proportions">
          <div ref={fieldRef("scroller_default_proportion")}>
            <SliderRow
              label="Default Proportion"
              description="Default proportion of the container occupied by each tiled window."
              value={defaultProportion}
              min={0.1}
              max={1.0}
              step={0.05}
              onChange={(v) => setValue("scroller_default_proportion", v.toFixed(2))}
            />
          </div>
          <div ref={fieldRef("scroller_default_proportion_single")}>
            <SliderRow
              label="Single Window Proportion"
              description="Proportion when there is only one window on the tag."
              value={defaultSingle}
              min={0.1}
              max={1.0}
              step={0.05}
              onChange={(v) => setValue("scroller_default_proportion_single", v.toFixed(2))}
            />
          </div>
          <div ref={fieldRef("scroller_ignore_proportion_single")}>
            <ToggleRow
              label="Ignore Proportion When Solo"
              description="Ignore the proportion setting when only one window is visible."
              value={ignoreSingle}
              onChange={tb("scroller_ignore_proportion_single")}
            />
          </div>
          <div ref={fieldRef("scroller_proportion_preset")}>
            <MultiTagInput
              label="Proportion Presets"
              description="Comma-separated preset proportion values (0.1–1.0) for quick switching"
              value={presetValue}
              tagPlaceholder="0.50"
              onChange={handlePresetChange}
            />
          </div>
        </SectionCard>
      </div>

      <div className="mb-5">
        <SectionCard title="Focus">
          <div ref={fieldRef("scroller_focus_center")}>
            <ToggleRow
              label="Focus Center"
              description="Focus the window at the center of the viewport when scrolling."
              value={focusCenter}
              onChange={tb("scroller_focus_center")}
            />
          </div>
          <div ref={fieldRef("scroller_prefer_center")}>
            <ToggleRow
              label="Prefer Center"
              description="Prefer to keep the focused window centered in the viewport."
              value={preferCenter}
              onChange={tb("scroller_prefer_center")}
            />
          </div>
          <div ref={fieldRef("scroller_prefer_overspread")}>
            <ToggleRow
              label="Prefer Overspread"
              description="Prefer to overspread windows across the available space."
              value={preferOverspread}
              onChange={tb("scroller_prefer_overspread")}
            />
          </div>
        </SectionCard>
      </div>

      <div className="mb-5">
        <SectionCard title="Edge Scrolling">
          <div ref={fieldRef("edge_scroller_pointer_focus")}>
            <ToggleRow
              label="Pointer Focus at Edge"
              description="Automatically focus the adjacent window when the pointer reaches the screen edge."
              value={pointerFocus}
              onChange={tb("edge_scroller_pointer_focus")}
            />
          </div>
          <div ref={fieldRef("edge_scroller_focus_allow_speed")}>
            <SliderRow
              label="Focus Allow Speed"
              description="Maximum pointer speed for edge-triggered focus changes (0 = always allowed)."
              value={allowSpeed}
              min={0}
              max={1000}
              step={1}
              onChange={(v) => setValue("edge_scroller_focus_allow_speed", String(v))}
            />
          </div>
        </SectionCard>
      </div>

      <div className="mb-5">
        <SectionCard title="Structs">
          <div ref={fieldRef("scroller_structs")}>
            <SliderRow
              label="Scroller Structs"
              description="Number of structural positions available in the scroller."
              value={structs}
              min={0}
              max={100}
              step={1}
              onChange={(v) => setValue("scroller_structs", String(Math.round(v)))}
            />
          </div>
        </SectionCard>
      </div>

    </PanelShell>
  );
}
