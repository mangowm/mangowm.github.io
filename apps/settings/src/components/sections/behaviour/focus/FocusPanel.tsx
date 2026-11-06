import { useConfigStore, useConfigBool } from "@/lib/config/store";
import type { PanelProps } from "@/lib/presentation/section-types";
import { useFocusField } from "@/lib/use-focus-field";
import {
  PanelShell,
  PanelHeader,
  SectionCard,
  ToggleRow,
} from "@/components/primitives/section-ui";

export function FocusPanel({ focusKey }: PanelProps) {
  const fieldRef = useFocusField(focusKey);
  const setValue = useConfigStore((s) => s.setValue);

  const tb = (key: string) => (v: boolean) => setValue(key, v ? "1" : "0");

  const sloppy_focus = useConfigBool("sloppy_focus");
  const warp_cursor = useConfigBool("warp_cursor");
  const focusOnActivate = useConfigBool("focus_on_activate");
  const focusCrossMon = useConfigBool("focus_cross_monitor");
  const focusCrossTag = useConfigBool("focus_cross_tag");
  const exchangeCrossMon = useConfigBool("exchange_cross_monitor");

  return (
    <PanelShell>
      <PanelHeader
        title="Focus"
        description="Control how windows gain focus and where focus can travel."
        separator={false}
      />

      <div className="mb-5">
        <SectionCard title="Behaviour">
          <div ref={fieldRef("sloppy_focus")}>
            <ToggleRow
              configKey="sloppy_focus"
              value={sloppy_focus}
              onChange={tb("sloppy_focus")}
            />
          </div>
          <div ref={fieldRef("warp_cursor")}>
            <ToggleRow configKey="warp_cursor" value={warp_cursor} onChange={tb("warp_cursor")} />
          </div>
          <div ref={fieldRef("focus_on_activate")}>
            <ToggleRow
              configKey="focus_on_activate"
              value={focusOnActivate}
              onChange={tb("focus_on_activate")}
            />
          </div>
        </SectionCard>
      </div>

      <div className="mb-5">
        <SectionCard title="Cross-Monitor">
          <div ref={fieldRef("focus_cross_monitor")}>
            <ToggleRow
              configKey="focus_cross_monitor"
              value={focusCrossMon}
              onChange={tb("focus_cross_monitor")}
            />
          </div>
          <div ref={fieldRef("exchange_cross_monitor")}>
            <ToggleRow
              configKey="exchange_cross_monitor"
              value={exchangeCrossMon}
              onChange={tb("exchange_cross_monitor")}
            />
          </div>
          <div ref={fieldRef("focus_cross_tag")}>
            <ToggleRow
              configKey="focus_cross_tag"
              value={focusCrossTag}
              onChange={tb("focus_cross_tag")}
            />
          </div>
        </SectionCard>
      </div>
    </PanelShell>
  );
}
