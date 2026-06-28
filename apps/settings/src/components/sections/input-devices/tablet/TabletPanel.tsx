import { useConfigStore, useConfigStr } from "@/lib/config-store";
import type { PanelProps } from "@/lib/section-types";
import { useFocusField } from "@/lib/use-focus-field";
import {
  PanelShell,
  PanelHeader,
  SectionCard,
  TextInputRow,
} from "@/components/sections/section-ui";

export function TabletPanel({ focusKey }: PanelProps) {
  const fieldRef = useFocusField(focusKey);
  const setValue = useConfigStore((s) => s.setValue);

  const tabletMapToMon = useConfigStr("tablet_map_to_mon");

  return (
    <PanelShell>
      <PanelHeader
        title="Tablet"
        description="Configure graphics tablet mapping."
        separator={false}
      />

      <div className="mb-5">
        <SectionCard title="Tablet Mapping">
          <div ref={fieldRef("tablet_map_to_mon")}>
            <TextInputRow
              label="Map to Monitor"
              description="Monitor name to map the graphics tablet to. Leave empty for no mapping."
              value={tabletMapToMon}
              placeholder="eDP-1"
              onChange={(v) => setValue("tablet_map_to_mon", v)}
            />
          </div>
        </SectionCard>
      </div>
    </PanelShell>
  );
}
