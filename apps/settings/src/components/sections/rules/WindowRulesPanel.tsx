import type { PanelProps } from "@/lib/section-types";
import { PanelShell, PanelHeader } from "@/components/sections/section-ui";
import { RuleList } from "./RuleList";

export function WindowRulesPanel(_props: PanelProps) {
  return (
    <PanelShell maxWidth="max-w-5xl">
      <PanelHeader
        title="Window Rules"
        description="Match windows by app ID or title to apply visual and behavioural overrides."
        separator={false}
      />

      <RuleList ruleType="windowrule" />
    </PanelShell>
  );
}
