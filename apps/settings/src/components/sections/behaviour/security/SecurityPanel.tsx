import { useConfigStore, useConfigBool } from "@/lib/config/store";
import type { PanelProps } from "@/lib/presentation/section-types";
import { useFocusField } from "@/lib/use-focus-field";
import {
  PanelShell,
  PanelHeader,
  SectionCard,
  ToggleRow,
} from "@/components/primitives/section-ui";

export function SecurityPanel({ focusKey }: PanelProps) {
  const fieldRef = useFocusField(focusKey);
  const setValue = useConfigStore((s) => s.setValue);

  const tb = (key: string) => (v: boolean) => setValue(key, v ? "1" : "0");

  const shortcutsInhibit = useConfigBool("allow_shortcuts_inhibit");
  const lockTransparent = useConfigBool("allow_lock_transparent");

  return (
    <PanelShell>
      <PanelHeader
        title="Security"
        description="Control how applications can interact with the compositor — keyboard shortcut inhibition and lockscreen transparency."
        separator={false}
      />

      <div className="mb-5">
        <SectionCard title="Keyboard">
          <div ref={fieldRef("allow_shortcuts_inhibit")}>
            <ToggleRow
              configKey="allow_shortcuts_inhibit"
              value={shortcutsInhibit}
              onChange={tb("allow_shortcuts_inhibit")}
            />
          </div>
        </SectionCard>
      </div>

      <div className="mb-5">
        <SectionCard title="Lockscreen">
          <div ref={fieldRef("allow_lock_transparent")}>
            <ToggleRow
              configKey="allow_lock_transparent"
              value={lockTransparent}
              onChange={tb("allow_lock_transparent")}
            />
          </div>
        </SectionCard>
      </div>
    </PanelShell>
  );
}
