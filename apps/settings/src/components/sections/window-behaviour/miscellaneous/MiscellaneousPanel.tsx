import { useConfigStore } from "@/lib/config-store";
import { cfgBool, cfgStr } from "@/lib/config-helpers";
import type { PanelProps } from "@/lib/section-types";
import { useFocusField } from "@/lib/use-focus-field";
import {
  PanelShell,
  PanelHeader,
  SectionCard,
  ToggleRow,
  SelectRow,
} from "@/components/sections/section-ui";

const TEARING_OPTIONS = [
  { value: "0", label: "Disabled" },
  { value: "1", label: "Always" },
  { value: "2", label: "Fullscreen Only" },
];

const INHIBIT_OPTIONS = [
  { value: "0", label: "Disabled" },
  { value: "1", label: "Enabled" },
];

export function MiscellaneousPanel({ focusKey }: PanelProps) {
  const fieldRef = useFocusField(focusKey);
  const data = useConfigStore((s) => s.data);
  const setValue = useConfigStore((s) => s.setValue);

  const tb = (key: string) => (v: boolean) => setValue(key, v ? "1" : "0");

  const idleInhibitIgnore = cfgBool(data, "idleinhibit_ignore_visible");
  const shortcutsInhibit = cfgStr(data, "allow_shortcuts_inhibit", "1");
  const lockTransparent = cfgBool(data, "allow_lock_transparent");
  const tearing = cfgStr(data, "allow_tearing", "0");

  return (
    <PanelShell>
      <PanelHeader
        title="Miscellaneous"
        description="System-level policies for idle inhibition, security, and rendering."
        separator={false}
      />

      <div className="mb-5">
        <SectionCard title="Idle & Power">
          <div ref={fieldRef("idleinhibit_ignore_visible")}>
            <ToggleRow
              label="Idle Inhibit Ignore Visible"
              description="Only fullscreen windows may inhibit the idle inhibitor (DPMS/screen blanking). Requests from tiled or floating windows are ignored."
              value={idleInhibitIgnore}
              onChange={tb("idleinhibit_ignore_visible")}
            />
          </div>
        </SectionCard>
      </div>

      <div className="mb-5">
        <SectionCard title="Security">
          <div ref={fieldRef("allow_shortcuts_inhibit")}>
            <SelectRow
              label="Allow Shortcuts Inhibit"
              description="When enabled, applications (games, VMs, remote desktop) can request the compositor to suspend keybindings so all key events reach the app."
              value={shortcutsInhibit}
              options={INHIBIT_OPTIONS}
              onChange={(v) => setValue("allow_shortcuts_inhibit", v)}
            />
          </div>
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

      <div className="mb-5">
        <SectionCard title="Rendering">
          <div ref={fieldRef("allow_tearing")}>
            <SelectRow
              label="Allow Tearing"
              description="Reduce input latency by permitting screen tearing. Disabled = smooth (vsync), Always = maximum responsiveness, Fullscreen Only = compromise for games and video."
              value={tearing}
              options={TEARING_OPTIONS}
              onChange={(v) => setValue("allow_tearing", v)}
            />
          </div>
        </SectionCard>
      </div>
    </PanelShell>
  );
}
