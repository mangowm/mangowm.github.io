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

const TEARING_OPTIONS = [
  { value: "0", label: "Disabled" },
  { value: "1", label: "Always" },
  { value: "2", label: "Fullscreen Only" },
];

export function RenderingPanel({ focusKey }: PanelProps) {
  const fieldRef = useFocusField(focusKey);
  const setValue = useConfigStore((s) => s.setValue);

  const tb = (key: string) => (v: boolean) => setValue(key, v ? "1" : "0");

  const tearing = useConfigStr("allow_tearing");
  const syncobj = useConfigBool("syncobj_enable");

  return (
    <PanelShell>
      <PanelHeader
        title="Rendering"
        description="Configure display rendering behaviour — tearing control and GPU sync."
        separator={false}
      />

      <div className="mb-5">
        <SectionCard title="Tearing">
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

      <div className="mb-5">
        <SectionCard title="GPU Synchronisation">
          <div ref={fieldRef("syncobj_enable")}>
            <ToggleRow
              label="Sync Object Enable"
              description="Enable DRM sync object timeline support. May improve GPU scheduling on compatible hardware."
              value={syncobj}
              onChange={tb("syncobj_enable")}
            />
          </div>
        </SectionCard>
      </div>
    </PanelShell>
  );
}
