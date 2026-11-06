import { useConfigStore, useConfigStr, useGlobalInt } from "@/lib/config/store";
import type { PanelProps } from "@/lib/presentation/section-types";
import { useFocusField } from "@/lib/use-focus-field";
import {
  PanelShell,
  PanelHeader,
  SectionCard,
  SliderRow,
  TextInputRow,
} from "@/components/primitives/section-ui";

export function JumpLabelPanel({ focusKey }: PanelProps) {
  const fieldRef = useFocusField(focusKey);
  const setValue = useConfigStore((s) => s.setValue);

  const jumpLabels = useConfigStr("jump_labels");
  const fontDesc = useConfigStr("jump_label_decorate_font_desc");
  const borderWidth = useGlobalInt("jump_label_decorate_border_width");
  const cornerRadius = useGlobalInt("jump_label_decorate_corner_radius");
  const paddingX = useGlobalInt("jump_label_decorate_padding_x");
  const paddingY = useGlobalInt("jump_label_decorate_padding_y");

  return (
    <PanelShell>
      <PanelHeader
        title="Jump Labels"
        description="Configure the appearance of overlay jump labels shown in overview navigation mode."
        separator={false}
      />

      <div className="mb-5">
        <SectionCard title="Labels">
          <div ref={fieldRef("jump_labels")}>
            <TextInputRow
              configKey="jump_labels"
              value={jumpLabels}
              placeholder="HJKLASDFGQWERTYUIOPZXCVBNM"
              onChange={(v) => setValue("jump_labels", v)}
            />
          </div>
        </SectionCard>
      </div>

      <div className="mb-5">
        <SectionCard title="Label">
          <div ref={fieldRef("jump_label_decorate_font_desc")}>
            <TextInputRow
              configKey="jump_label_decorate_font_desc"
              value={fontDesc}
              placeholder="Sans 10"
              onChange={(v) => setValue("jump_label_decorate_font_desc", v)}
            />
          </div>
        </SectionCard>
      </div>

      <div className="mb-5">
        <SectionCard title="Decoration">
          <div ref={fieldRef("jump_label_decorate_border_width")}>
            <SliderRow
              configKey="jump_label_decorate_border_width"
              value={borderWidth}
              unit="px"
              onChange={(v) => setValue("jump_label_decorate_border_width", String(v))}
            />
          </div>
          <div ref={fieldRef("jump_label_decorate_corner_radius")}>
            <SliderRow
              configKey="jump_label_decorate_corner_radius"
              value={cornerRadius}
              unit="px"
              onChange={(v) => setValue("jump_label_decorate_corner_radius", String(v))}
            />
          </div>
          <div ref={fieldRef("jump_label_decorate_padding_x")}>
            <SliderRow
              configKey="jump_label_decorate_padding_x"
              value={paddingX}
              unit="px"
              onChange={(v) => setValue("jump_label_decorate_padding_x", String(v))}
            />
          </div>
          <div ref={fieldRef("jump_label_decorate_padding_y")}>
            <SliderRow
              configKey="jump_label_decorate_padding_y"
              value={paddingY}
              unit="px"
              onChange={(v) => setValue("jump_label_decorate_padding_y", String(v))}
            />
          </div>
        </SectionCard>
      </div>
    </PanelShell>
  );
}
