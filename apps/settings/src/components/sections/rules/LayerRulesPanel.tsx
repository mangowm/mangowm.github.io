import type { PanelProps } from "@/lib/section-types";
import { PanelShell, PanelHeader } from "@/components/sections/section-ui";
import { RuleList } from "./RuleList";

export function LayerRulesPanel(_props: PanelProps) {
  return (
    <PanelShell maxWidth="max-w-5xl">
      <PanelHeader
        title="Layer Rules"
        description="Configure behaviour for layer-shell surfaces like panels, notifications, and wallpapers."
        separator={false}
      />

      <RuleList ruleType="layerrule" />
    </PanelShell>
  );
}
