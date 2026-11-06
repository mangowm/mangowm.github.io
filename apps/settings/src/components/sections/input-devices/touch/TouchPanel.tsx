import { useConfigBool, useConfigStore } from "@/lib/config/store";
import type { PanelProps } from "@/lib/presentation/section-types";
import { useFocusField } from "@/lib/use-focus-field";
import {
  PanelShell,
  PanelHeader,
  SectionCard,
  ToggleRow,
} from "@/components/primitives/section-ui";

export function TouchPanel({ focusKey }: PanelProps) {
  const fieldRef = useFocusField(focusKey);
  const setValue = useConfigStore((s) => s.setValue);

  const tb = (key: string) => (v: boolean) => setValue(key, v ? "1" : "0");

  const touchEnable = useConfigBool("touch_enable");
  const touchMouseEmulation = useConfigBool("touch_enable_mouse_emulation");

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
            <ToggleRow configKey="touch_enable" value={touchEnable} onChange={tb("touch_enable")} />
          </div>
          <div ref={fieldRef("touch_enable_mouse_emulation")}>
            <ToggleRow
              configKey="touch_enable_mouse_emulation"
              value={touchMouseEmulation}
              enabled={touchEnable}
              onChange={tb("touch_enable_mouse_emulation")}
            />
          </div>
        </SectionCard>
      </div>
    </PanelShell>
  );
}
