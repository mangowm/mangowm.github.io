import { useCallback } from "react";
import {
  useConfigStore,
  useConfigBool,
  useConfigInt,
  useConfigStr,
  useGlobalFloat,
} from "@/lib/config/store";
import type { PanelProps } from "@/lib/presentation/section-types";
import { useFocusField } from "@/lib/use-focus-field";
import {
  PanelShell,
  PanelHeader,
  SectionCard,
  ToggleRow,
  SliderRow,
  MultiTagInput,
} from "@/components/primitives/section-ui";

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
  const setValue = useConfigStore((s) => s.setValue);

  const tb = (key: string) => (v: boolean) => setValue(key, v ? "1" : "0");

  const defaultProportion = useGlobalFloat("scroller_default_proportion");
  const defaultSingle = useGlobalFloat("scroller_default_proportion_single");
  const ignoreSingle = useConfigBool("scroller_ignore_proportion_single");
  const focusCenter = useConfigBool("scroller_focus_center");
  const preferCenter = useConfigBool("scroller_prefer_center");
  const preferOverspread = useConfigBool("scroller_prefer_overspread");
  const pointerFocus = useConfigBool("edge_scroller_pointer_focus");
  const allowSpeed = useGlobalFloat("edge_scroller_focus_allow_speed");
  const structs = useConfigInt("scroller_structs");

  const presetValue = useConfigStr("scroller_proportion_preset");

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
              configKey="scroller_default_proportion"
              value={defaultProportion}
              step={0.05}
              onChange={(v) => setValue("scroller_default_proportion", v.toFixed(2))}
            />
          </div>
          <div ref={fieldRef("scroller_default_proportion_single")}>
            <SliderRow
              configKey="scroller_default_proportion_single"
              value={defaultSingle}
              step={0.05}
              onChange={(v) => setValue("scroller_default_proportion_single", v.toFixed(2))}
            />
          </div>
          <div ref={fieldRef("scroller_ignore_proportion_single")}>
            <ToggleRow
              configKey="scroller_ignore_proportion_single"
              value={ignoreSingle}
              onChange={tb("scroller_ignore_proportion_single")}
            />
          </div>
          <div ref={fieldRef("scroller_proportion_preset")}>
            <MultiTagInput
              configKey="scroller_proportion_preset"
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
              configKey="scroller_focus_center"
              value={focusCenter}
              onChange={tb("scroller_focus_center")}
            />
          </div>
          <div ref={fieldRef("scroller_prefer_center")}>
            <ToggleRow
              configKey="scroller_prefer_center"
              value={preferCenter}
              onChange={tb("scroller_prefer_center")}
            />
          </div>
          <div ref={fieldRef("scroller_prefer_overspread")}>
            <ToggleRow
              configKey="scroller_prefer_overspread"
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
              configKey="edge_scroller_pointer_focus"
              value={pointerFocus}
              onChange={tb("edge_scroller_pointer_focus")}
            />
          </div>
          <div ref={fieldRef("edge_scroller_focus_allow_speed")}>
            <SliderRow
              configKey="edge_scroller_focus_allow_speed"
              value={allowSpeed}
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
              configKey="scroller_structs"
              value={structs}
              step={1}
              onChange={(v) => setValue("scroller_structs", String(Math.round(v)))}
            />
          </div>
        </SectionCard>
      </div>
    </PanelShell>
  );
}
