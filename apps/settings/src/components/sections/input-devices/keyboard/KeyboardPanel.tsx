import { useConfigStore, useConfigBool, useConfigStr, useGlobalInt } from "@/lib/config/store";
import type { PanelProps } from "@/lib/presentation/section-types";
import { useFocusField } from "@/lib/use-focus-field";
import {
  PanelShell,
  PanelHeader,
  SectionCard,
  ToggleRow,
  SliderRow,
  TextInputRow,
  MultiTagInput,
} from "@/components/primitives/section-ui";

export function KeyboardPanel({ focusKey }: PanelProps) {
  const fieldRef = useFocusField(focusKey);
  const setValue = useConfigStore((s) => s.setValue);

  // Ranges match mango's CLAMP_INT: repeat_rate [1,1000], repeat_delay [1,20000]
  const repeatRate = useGlobalInt("repeat_rate");
  const repeatDelay = useGlobalInt("repeat_delay");
  const numlockOn = useConfigBool("numlock_on");
  const xkbLayout = useConfigStr("xkb_rules_layout");
  const xkbVariant = useConfigStr("xkb_rules_variant");
  const xkbOptions = useConfigStr("xkb_rules_options");
  const xkbModel = useConfigStr("xkb_rules_model");
  const xkbRules = useConfigStr("xkb_rules_rules");

  return (
    <PanelShell>
      <PanelHeader
        title="Keyboard"
        description="Configure key repeat behavior and XKB layout settings."
        separator={false}
      />

      <div className="mb-5">
        <SectionCard title="Key Repeat">
          <div ref={fieldRef("repeat_rate")}>
            <SliderRow
              configKey="repeat_rate"
              value={repeatRate}
              unit=" cps"
              onChange={(v) => setValue("repeat_rate", String(v))}
            />
          </div>
          <div ref={fieldRef("repeat_delay")}>
            <SliderRow
              configKey="repeat_delay"
              value={repeatDelay}
              step={50}
              unit=" ms"
              onChange={(v) => setValue("repeat_delay", String(v))}
            />
          </div>
        </SectionCard>
      </div>

      <div className="mb-5">
        <SectionCard title="Startup">
          <div ref={fieldRef("numlock_on")}>
            <ToggleRow
              configKey="numlock_on"
              value={numlockOn}
              onChange={(v) => setValue("numlock_on", v ? "1" : "0")}
            />
          </div>
        </SectionCard>
      </div>

      <div className="mb-5">
        <SectionCard title="XKB Layout">
          <div ref={fieldRef("xkb_rules_layout")}>
            <MultiTagInput
              configKey="xkb_rules_layout"
              value={xkbLayout}
              tagPlaceholder="us"
              onChange={(v) => setValue("xkb_rules_layout", v)}
            />
          </div>
          <div ref={fieldRef("xkb_rules_variant")}>
            <MultiTagInput
              configKey="xkb_rules_variant"
              value={xkbVariant}
              tagPlaceholder="dvorak"
              onChange={(v) => setValue("xkb_rules_variant", v)}
            />
          </div>
          <div ref={fieldRef("xkb_rules_options")}>
            <MultiTagInput
              configKey="xkb_rules_options"
              value={xkbOptions}
              tagPlaceholder="ctrl:nocaps"
              onChange={(v) => setValue("xkb_rules_options", v)}
            />
          </div>
          <div ref={fieldRef("xkb_rules_model")}>
            <TextInputRow
              configKey="xkb_rules_model"
              value={xkbModel}
              placeholder=""
              onChange={(v) => setValue("xkb_rules_model", v)}
            />
          </div>
          <div ref={fieldRef("xkb_rules_rules")}>
            <TextInputRow
              configKey="xkb_rules_rules"
              value={xkbRules}
              placeholder=""
              onChange={(v) => setValue("xkb_rules_rules", v)}
            />
          </div>
        </SectionCard>
      </div>
    </PanelShell>
  );
}
