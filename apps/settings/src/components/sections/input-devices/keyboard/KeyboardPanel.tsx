import { useConfigStore, useConfigBool, useConfigInt, useConfigStr } from "@/lib/config-store";
import type { PanelProps } from "@/lib/section-types";
import { useFocusField } from "@/lib/use-focus-field";
import {
  PanelShell,
  PanelHeader,
  SectionCard,
  ToggleRow,
  SliderRow,
  TextInputRow,
  MultiTagInput,
} from "@/components/sections/section-ui";

export function KeyboardPanel({ focusKey }: PanelProps) {
  const fieldRef = useFocusField(focusKey);
  const setValue = useConfigStore((s) => s.setValue);

  // Ranges match mango's CLAMP_INT: repeat_rate [1,1000], repeat_delay [1,20000]
  const repeatRate = useConfigInt("repeat_rate", 25, 1, 1000);
  const repeatDelay = useConfigInt("repeat_delay", 600, 1, 20000);
  const numlockOn = useConfigBool("numlockon");
  const xkbLayout = useConfigStr("xkb_rules_layout", "");
  const xkbVariant = useConfigStr("xkb_rules_variant", "");
  const xkbOptions = useConfigStr("xkb_rules_options", "");
  const xkbModel = useConfigStr("xkb_rules_model", "");
  const xkbRules = useConfigStr("xkb_rules_rules", "");

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
              label="Repeat Rate"
              description="Characters per second while a key is held. Mango range: 1–1000. (0 disables repeat.)"
              value={repeatRate}
              min={1}
              max={1000}
              unit=" cps"
              onChange={(v) => setValue("repeat_rate", String(v))}
            />
          </div>
          <div ref={fieldRef("repeat_delay")}>
            <SliderRow
              label="Repeat Delay"
              description="Milliseconds before key repeat starts. Mango range: 1–20000."
              value={repeatDelay}
              min={1}
              max={20000}
              step={50}
              unit=" ms"
              onChange={(v) => setValue("repeat_delay", String(v))}
            />
          </div>
        </SectionCard>
      </div>

      <div className="mb-5">
        <SectionCard title="Startup">
          <div ref={fieldRef("numlockon")}>
            <ToggleRow
              label="NumLock On Startup"
              description="Enable NumLock when the compositor starts."
              value={numlockOn}
              onChange={(v) => setValue("numlockon", v ? "1" : "0")}
            />
          </div>
        </SectionCard>
      </div>

      <div className="mb-5">
        <SectionCard title="XKB Layout">
          <div ref={fieldRef("xkb_rules_layout")}>
            <MultiTagInput
              label="Layout"
              description="Keyboard layout(s). Add each layout as a separate tag — e.g. 'us', 'ru', 'de'."
              value={xkbLayout}
              tagPlaceholder="us"
              onChange={(v) => setValue("xkb_rules_layout", v)}
            />
          </div>
          <div ref={fieldRef("xkb_rules_variant")}>
            <MultiTagInput
              label="Variant"
              description="Layout variant(s). Add one per layout — e.g. 'dvorak' for 'us', 'winkeys' for 'ru'. Leave blank for default."
              value={xkbVariant}
              tagPlaceholder="dvorak"
              onChange={(v) => setValue("xkb_rules_variant", v)}
            />
          </div>
          <div ref={fieldRef("xkb_rules_options")}>
            <MultiTagInput
              label="Options"
              description="XKB option(s). Add each option as a separate tag — e.g. 'ctrl:nocaps', 'compose:rwin'."
              value={xkbOptions}
              tagPlaceholder="ctrl:nocaps"
              onChange={(v) => setValue("xkb_rules_options", v)}
            />
          </div>
          <div ref={fieldRef("xkb_rules_model")}>
            <TextInputRow
              label="Model"
              description="Keyboard model hint for XKB layout mapping."
              value={xkbModel}
              placeholder=""
              onChange={(v) => setValue("xkb_rules_model", v)}
            />
          </div>
          <div ref={fieldRef("xkb_rules_rules")}>
            <TextInputRow
              label="Rules File"
              description="XKB rules file name — usually left empty for the system default."
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
