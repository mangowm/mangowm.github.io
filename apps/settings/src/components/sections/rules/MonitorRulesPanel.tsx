import type { PanelProps } from "@/lib/section-types";
import { PanelShell, PanelHeader } from "@/components/sections/section-ui";
import { RuleList } from "./RuleList";

export function MonitorRulesPanel(_props: PanelProps) {
  return (
    <PanelShell maxWidth="max-w-5xl">
      <PanelHeader
        title="Monitor Rules"
        description="Match monitors by name, make, model, or serial to configure resolution, scaling, position, and VRR."
        separator={false}
      />

      <RuleList ruleType="monitorrule" />
    </PanelShell>
  );
}
