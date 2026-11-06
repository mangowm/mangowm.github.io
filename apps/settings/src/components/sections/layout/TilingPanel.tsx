import { useConfigStore, useConfigBool, useGlobalInt, useGlobalFloat } from "@/lib/config/store";
import type { PanelProps } from "@/lib/presentation/section-types";
import { useFocusField } from "@/lib/use-focus-field";
import {
  PanelShell,
  PanelHeader,
  SectionCard,
  ToggleRow,
  SliderRow,
} from "@/components/primitives/section-ui";

export function TilingPanel({ focusKey }: PanelProps) {
  const fieldRef = useFocusField(focusKey);
  const setValue = useConfigStore((s) => s.setValue);

  const tb = (key: string) => (v: boolean) => setValue(key, v ? "1" : "0");

  const newIsMaster = useConfigBool("new_is_master");
  const mfact = useGlobalFloat("default_master_factor");
  const nmaster = useGlobalInt("default_master_count");
  const centerOverspread = useConfigBool("center_master_overspread");
  const centerSingleStack = useConfigBool("center_when_single_stack");

  return (
    <PanelShell>
      <PanelHeader
        title="Tiling"
        description="Configure the main tiling layout: master area size, number of masters, and how new windows are placed."
        separator={false}
      />

      <div className="mb-5">
        <SectionCard title="Placement">
          <div ref={fieldRef("new_is_master")}>
            <ToggleRow
              configKey="new_is_master"
              value={newIsMaster}
              onChange={tb("new_is_master")}
            />
          </div>
        </SectionCard>
      </div>

      <div className="mb-5">
        <SectionCard title="Master Area">
          <div ref={fieldRef("default_master_factor")}>
            <SliderRow
              configKey="default_master_factor"
              value={mfact}
              step={0.01}
              onChange={(v) => setValue("default_master_factor", v.toFixed(2))}
            />
          </div>
          <div ref={fieldRef("default_master_count")}>
            <SliderRow
              configKey="default_master_count"
              value={nmaster}
              step={1}
              onChange={(v) => setValue("default_master_count", String(Math.round(v)))}
            />
          </div>
        </SectionCard>
      </div>

      <div className="mb-5">
        <SectionCard title="Centering">
          <div ref={fieldRef("center_master_overspread")}>
            <ToggleRow
              configKey="center_master_overspread"
              value={centerOverspread}
              onChange={tb("center_master_overspread")}
            />
          </div>
          <div ref={fieldRef("center_when_single_stack")}>
            <ToggleRow
              configKey="center_when_single_stack"
              value={centerSingleStack}
              onChange={tb("center_when_single_stack")}
            />
          </div>
        </SectionCard>
      </div>
    </PanelShell>
  );
}
