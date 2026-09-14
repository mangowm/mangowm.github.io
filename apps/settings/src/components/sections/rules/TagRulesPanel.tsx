import type { PanelProps } from "@/lib/section-types";
import { PanelShell, PanelHeader } from "@/components/sections/section-ui";
import { RuleList } from "./RuleList";

export function TagRulesPanel(_props: PanelProps) {
  return (
    <PanelShell maxWidth="max-w-5xl">
      <PanelHeader
        title="Tag Rules"
        description="Configure per-tag settings like master count and layout factor on a per-monitor basis."
        separator={false}
      />

      <RuleList ruleType="tagrule" />
    </PanelShell>
  );
}
