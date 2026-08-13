import { useConfigStore, useConfigBool, useConfigStr } from "@/lib/config-store";
import type { PanelProps } from "@/lib/section-types";
import { useFocusField } from "@/lib/use-focus-field";
import {
  PanelShell,
  PanelHeader,
  SectionCard,
  ToggleRow,
  TextInputRow,
} from "@/components/sections/section-ui";

export function TouchPanel({ focusKey }: PanelProps) {
  const fieldRef = useFocusField(focusKey);
  const setValue = useConfigStore((s) => s.setValue);

  const tb = (key: string) => (v: boolean) => setValue(key, v ? "1" : "0");

  const touchEnable = useConfigBool("touch_enable");
  const touchMouseEmulation = useConfigBool("touch_enable_mouse_emulation");
  const touchMapToMon = useConfigStr("touch_map_to_mon");

  return (
    <PanelShell>
      <PanelHeader
        title="Touch"
        description="Configure touchscreen input handling and mapping."
        separator={false}
      />

      <div className="mb-5">
        <SectionCard title="Behaviour">
          <div ref={fieldRef("touch_enable")}>
            <ToggleRow
              label="Enable Touch"
              description="Enable touchscreen input. Disabling turns off all touch events."
              value={touchEnable}
              onChange={tb("touch_enable")}
            />
          </div>
          <div ref={fieldRef("touch_enable_mouse_emulation")}>
            <ToggleRow
              label="Mouse Emulation"
              description="Convert touch gestures into mouse events (click, drag, scroll)."
              value={touchMouseEmulation}
              enabled={touchEnable}
              onChange={tb("touch_enable_mouse_emulation")}
            />
          </div>
        </SectionCard>
      </div>

      <div className="mb-5">
        <SectionCard title="Mapping">
          <div ref={fieldRef("touch_map_to_mon")}>
            <TextInputRow
              label="Map to Monitor"
              description="Monitor name to map the touchscreen to. Leave empty for no mapping."
              value={touchMapToMon}
              placeholder="eDP-1"
              enabled={touchEnable}
              onChange={(v) => setValue("touch_map_to_mon", v)}
            />
          </div>
        </SectionCard>
      </div>
    </PanelShell>
  );
}
