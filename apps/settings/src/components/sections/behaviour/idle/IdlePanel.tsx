import { useConfigStore, useConfigBool, useGlobalInt } from "@/lib/config/store";
import type { PanelProps } from "@/lib/presentation/section-types";
import { useFocusField } from "@/lib/use-focus-field";
import {
  PanelShell,
  PanelHeader,
  SectionCard,
  ToggleRow,
  SliderRow,
} from "@/components/primitives/section-ui";

export function IdlePanel({ focusKey }: PanelProps) {
  const fieldRef = useFocusField(focusKey);
  const setValue = useConfigStore((s) => s.setValue);

  const tb = (key: string) => (v: boolean) => setValue(key, v ? "1" : "0");

  const idleInhibitIgnore = useConfigBool("idle_inhibit_ignore_visible");
  const cursorTimeout = useGlobalInt("cursor_hide_timeout");
  const cursorHideKeypress = useConfigBool("cursor_hide_on_keypress");

  return (
    <PanelShell>
      <PanelHeader
        title="Idle"
        description="Configure inactivity timeouts: screen blanking inhibition, cursor auto-hide, and keypress behaviour."
        separator={false}
      />

      <div className="mb-5">
        <SectionCard title="Screen Blanking">
          <div ref={fieldRef("idle_inhibit_ignore_visible")}>
            <ToggleRow
              configKey="idle_inhibit_ignore_visible"
              value={idleInhibitIgnore}
              onChange={tb("idle_inhibit_ignore_visible")}
            />
          </div>
        </SectionCard>
      </div>

      <div className="mb-5">
        <SectionCard title="Cursor">
          <div ref={fieldRef("cursor_hide_timeout")}>
            <SliderRow
              configKey="cursor_hide_timeout"
              value={cursorTimeout}
              unit=" s"
              onChange={(v) => setValue("cursor_hide_timeout", String(v))}
            />
          </div>
          <div ref={fieldRef("cursor_hide_on_keypress")}>
            <ToggleRow
              configKey="cursor_hide_on_keypress"
              value={cursorHideKeypress}
              onChange={tb("cursor_hide_on_keypress")}
            />
          </div>
        </SectionCard>
      </div>
    </PanelShell>
  );
}
