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

export function GroupBarPanel({ focusKey }: PanelProps) {
  const fieldRef = useFocusField(focusKey);
  const setValue = useConfigStore((s) => s.setValue);

  const barHeight = useGlobalInt("group_bar_height");
  const fontDesc = useConfigStr("group_bar_decorate_font_desc");
  const borderWidth = useGlobalInt("group_bar_decorate_border_width");
  const cornerRadius = useGlobalInt("group_bar_decorate_corner_radius");
  const paddingX = useGlobalInt("group_bar_decorate_padding_x");
  const paddingY = useGlobalInt("group_bar_decorate_padding_y");

  return (
    <PanelShell>
      <PanelHeader
        title="Group Bar"
        description="Configure the appearance of the per-window group bar shown when windows are grouped."
        separator={false}
      />

      <div className="mb-5">
        <SectionCard title="Bar">
          <div ref={fieldRef("group_bar_height")}>
            <SliderRow
              configKey="group_bar_height"
              value={barHeight}
              unit="px"
              onChange={(v) => setValue("group_bar_height", String(v))}
            />
          </div>
          <div ref={fieldRef("group_bar_decorate_font_desc")}>
            <TextInputRow
              configKey="group_bar_decorate_font_desc"
              value={fontDesc}
              placeholder="Sans 10"
              onChange={(v) => setValue("group_bar_decorate_font_desc", v)}
            />
          </div>
        </SectionCard>
      </div>

      <div className="mb-5">
        <SectionCard title="Decoration">
          <div ref={fieldRef("group_bar_decorate_border_width")}>
            <SliderRow
              configKey="group_bar_decorate_border_width"
              value={borderWidth}
              unit="px"
              onChange={(v) => setValue("group_bar_decorate_border_width", String(v))}
            />
          </div>
          <div ref={fieldRef("group_bar_decorate_corner_radius")}>
            <SliderRow
              configKey="group_bar_decorate_corner_radius"
              value={cornerRadius}
              unit="px"
              onChange={(v) => setValue("group_bar_decorate_corner_radius", String(v))}
            />
          </div>
          <div ref={fieldRef("group_bar_decorate_padding_x")}>
            <SliderRow
              configKey="group_bar_decorate_padding_x"
              value={paddingX}
              unit="px"
              onChange={(v) => setValue("group_bar_decorate_padding_x", String(v))}
            />
          </div>
          <div ref={fieldRef("group_bar_decorate_padding_y")}>
            <SliderRow
              configKey="group_bar_decorate_padding_y"
              value={paddingY}
              unit="px"
              onChange={(v) => setValue("group_bar_decorate_padding_y", String(v))}
            />
          </div>
        </SectionCard>
      </div>
    </PanelShell>
  );
}
