import { useConfigStore } from "@/lib/config-store";
import { cfgBool } from "@/lib/config-helpers";
import type { PanelProps } from "@/lib/section-types";
import { useFocusField } from "@/lib/use-focus-field";
import { PanelShell, PanelHeader, SectionCard, ToggleRow } from "@/components/sections/section-ui";

export function XWaylandPanel({ focusKey }: PanelProps) {
  const fieldRef = useFocusField(focusKey);
  const data = useConfigStore((s) => s.data);
  const setValue = useConfigStore((s) => s.setValue);

  // mango: CLAMP_INT(xwayland_persistence, 0, 1), default 1
  const xwaylandPersist = cfgBool(data, "xwayland_persistence", true);

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
