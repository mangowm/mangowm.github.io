import { useConfigStore, useConfigBool, useConfigInt, useConfigFloat } from "@/lib/config-store";
import type { PanelProps } from "@/lib/section-types";
import { useFocusField } from "@/lib/use-focus-field";
import {
  PanelShell,
  PanelHeader,
  SectionCard,
  ToggleRow,
  SliderRow,
} from "@/components/sections/section-ui";

export function TilingPanel({ focusKey }: PanelProps) {
  const fieldRef = useFocusField(focusKey);
  const setValue = useConfigStore((s) => s.setValue);

  const tb = (key: string) => (v: boolean) => setValue(key, v ? "1" : "0");

  const newIsMaster = useConfigBool("new_is_master");
  const mfact = useConfigFloat("default_mfact", undefined, 0.1, 0.9);
  const nmaster = useConfigInt("default_nmaster", undefined, 1, 1000);
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
              label="New Windows as Master"
              description="When enabled, new windows open in the master area. Otherwise they join the stack."
              value={newIsMaster}
              onChange={tb("new_is_master")}
            />
          </div>
        </SectionCard>
      </div>

      <div className="mb-5">
        <SectionCard title="Master Area">
          <div ref={fieldRef("default_mfact")}>
            <SliderRow
              label="Master Area Factor"
              description="Fraction of the screen width given to the master area."
              value={mfact}
              min={0.1}
              max={0.9}
              step={0.01}
              onChange={(v) => setValue("default_mfact", v.toFixed(2))}
            />
          </div>
          <div ref={fieldRef("default_nmaster")}>
            <SliderRow
              label="Number of Masters"
              description="How many windows are kept in the master area."
              value={nmaster}
              min={1}
              max={20}
              step={1}
              onChange={(v) => setValue("default_nmaster", String(Math.round(v)))}
            />
          </div>
        </SectionCard>
      </div>

      <div className="mb-5">
        <SectionCard title="Centering">
          <div ref={fieldRef("center_master_overspread")}>
            <ToggleRow
              label="Center Master Overspread"
              description="Center the master window when it overspreads the available space."
              value={centerOverspread}
              onChange={tb("center_master_overspread")}
            />
          </div>
          <div ref={fieldRef("center_when_single_stack")}>
            <ToggleRow
              label="Center Single Stack"
              description="Center the single window in the stack area when there is only one."
              value={centerSingleStack}
              onChange={tb("center_when_single_stack")}
            />
          </div>
        </SectionCard>
      </div>
    </PanelShell>
  );
}
