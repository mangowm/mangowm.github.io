import { useConfigStore, useConfigBool, useConfigStr } from "@/lib/config-store";
import type { PanelProps } from "@/lib/section-types";
import { useFocusField } from "@/lib/use-focus-field";
import {
  PanelShell,
  PanelHeader,
  SectionCard,
  ToggleRow,
  SelectRow,
} from "@/components/sections/section-ui";

const INHIBIT_OPTIONS = [
  { value: "0", label: "Disabled" },
  { value: "1", label: "Enabled" },
];

export function SecurityPanel({ focusKey }: PanelProps) {
  const fieldRef = useFocusField(focusKey);
  const setValue = useConfigStore((s) => s.setValue);

  const tb = (key: string) => (v: boolean) => setValue(key, v ? "1" : "0");

  // mango: CLAMP_INT(allow_shortcuts_inhibit, 0, 1), default SHORTCUTS_INHIBIT_ENABLE
  const shortcutsInhibit = useConfigStr("allow_shortcuts_inhibit", "1");
  // mango: CLAMP_INT(allow_lock_transparent, 0, 1), default 0
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
            <SelectRow
              label="Allow Shortcuts Inhibit"
              description="When enabled, applications (games, VMs, remote desktop) can request the compositor to suspend keybindings so all key events reach the app."
              value={shortcutsInhibit}
              options={INHIBIT_OPTIONS}
              onChange={(v) => setValue("allow_shortcuts_inhibit", v)}
            />
          </div>
        </SectionCard>
      </div>

      <div className="mb-5">
        <SectionCard title="Lockscreen">
          <div ref={fieldRef("allow_lock_transparent")}>
            <ToggleRow
              label="Allow Lock Transparent"
              description="Permit transparent or translucent lockscreen surfaces. Disable to enforce fully opaque lockscreens for privacy and security."
              value={lockTransparent}
              onChange={tb("allow_lock_transparent")}
            />
          </div>
        </SectionCard>
      </div>
    </PanelShell>
  );
}
