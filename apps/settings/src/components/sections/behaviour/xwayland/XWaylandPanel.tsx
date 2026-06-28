import { useConfigStore, useConfigBool } from "@/lib/config-store";
import type { PanelProps } from "@/lib/section-types";
import { useFocusField } from "@/lib/use-focus-field";
import { PanelShell, PanelHeader, SectionCard, ToggleRow } from "@/components/sections/section-ui";

export function XWaylandPanel({ focusKey }: PanelProps) {
  const fieldRef = useFocusField(focusKey);
  const setValue = useConfigStore((s) => s.setValue);

  const xwaylandPersist = useConfigBool("xwayland_persistence");

  return (
    <PanelShell>
      <PanelHeader
        title="XWayland"
        description="Configure XWayland compatibility behaviour."
        separator={false}
      />

      <div className="mb-5">
        <SectionCard title="Persistence">
          <div ref={fieldRef("xwayland_persistence")}>
            <ToggleRow
              label="XWayland Persistence"
              description="Keep the XWayland server running even when no X11 clients are connected. Disabling saves memory but may slow down first X11 app launch."
              value={xwaylandPersist}
              onChange={(v) => setValue("xwayland_persistence", v ? "1" : "0")}
            />
          </div>
        </SectionCard>
      </div>
    </PanelShell>
  );
}
