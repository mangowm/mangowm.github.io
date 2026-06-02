import { useConfigStore } from "@/lib/config-store";
import { cfgBool, cfgInt } from "@/lib/config-helpers";
import type { PanelProps } from "@/lib/section-types";
import { useFocusField } from "@/lib/use-focus-field";
import {
  PanelShell,
  PanelHeader,
  SectionCard,
  ToggleRow,
  SliderRow,
} from "@/components/sections/section-ui";

export function IdlePanel({ focusKey }: PanelProps) {
  const fieldRef = useFocusField(focusKey);
  const data = useConfigStore((s) => s.data);
  const setValue = useConfigStore((s) => s.setValue);

  const tb = (key: string) => (v: boolean) => setValue(key, v ? "1" : "0");

  // mango: CLAMP_INT(idleinhibit_ignore_visible, 0, 1), default 0
  const idleInhibitIgnore = cfgBool(data, "idleinhibit_ignore_visible");
  // mango: CLAMP_INT(cursor_hide_timeout, 0, 36000), default 0
  const cursorTimeout = cfgInt(data, "cursor_hide_timeout", 0, 0, 36000);

  return (
    <PanelShell>
      <PanelHeader
        title="Idle"
        description="Configure inactivity timeouts: screen blanking inhibition and cursor auto-hide."
        separator={false}
      />

      <div className="mb-5">
        <SectionCard title="Screen Blanking">
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
        <SectionCard title="Cursor">
          <div ref={fieldRef("cursor_hide_timeout")}>
            <SliderRow
              label="Cursor Hide Timeout"
              description="Auto-hide the cursor after this many seconds of inactivity. Set to 0 to never auto-hide. Mango range: 0–36000."
              value={cursorTimeout}
              min={0}
              max={600}
              unit=" s"
              onChange={(v) => setValue("cursor_hide_timeout", String(v))}
            />
          </div>
        </SectionCard>
      </div>
    </PanelShell>
  );
}
