import { useConfigStore, useConfigStr, useConfigInt } from "@/lib/config-store";
import type { PanelProps } from "@/lib/section-types";
import { useFocusField } from "@/lib/use-focus-field";
import {
  PanelShell,
  PanelHeader,
  SectionCard,
  SliderRow,
  TextInputRow,
} from "@/components/sections/section-ui";

export function JumpLabelPanel({ focusKey }: PanelProps) {
  const fieldRef = useFocusField(focusKey);
  const setValue = useConfigStore((s) => s.setValue);

  const fontDesc = useConfigStr("jump_label_decorate_font_desc");
  const borderWidth = useConfigInt("jump_label_decorate_border_width", undefined, 0, 100);
  const cornerRadius = useConfigInt("jump_label_decorate_corner_radius", undefined, 0, 100);
  const paddingX = useConfigInt("jump_label_decorate_padding_x", undefined, 0, 100);
  const paddingY = useConfigInt("jump_label_decorate_padding_y", undefined, 0, 100);

  const fgColor = useConfigStr("jump_label_decorate_fg_color");
  const bgColor = useConfigStr("jump_label_decorate_bg_color");
  const focusFgColor = useConfigStr("jump_label_decorate_focus_fg_color");
  const focusBgColor = useConfigStr("jump_label_decorate_focus_bg_color");
  const borderColor = useConfigStr("jump_label_decorate_border_color");

  return (
    <PanelShell>
      <PanelHeader
        title="Jump Labels"
        description="Configure the appearance of overlay jump labels shown in overview navigation mode."
        separator={false}
      />

      <div className="mb-5">
        <SectionCard title="Label">
          <div ref={fieldRef("jump_label_decorate_font_desc")}>
            <TextInputRow
              label="Font"
              description="Pango font description for jump labels, e.g. 'Sans 10' or 'monospace bold 11'."
              value={fontDesc}
              placeholder="Sans 10"
              onChange={(v) => setValue("jump_label_decorate_font_desc", v)}
            />
          </div>
        </SectionCard>
      </div>

      <div className="mb-5">
        <SectionCard title="Colors">
          <div ref={fieldRef("jump_label_decorate_fg_color")}>
            <TextInputRow
              label="Text"
              description="Foreground color of jump labels. Hex format: 0xRRGGBBAA."
              value={fgColor}
              placeholder="0xc4939dff"
              onChange={(v) => setValue("jump_label_decorate_fg_color", v)}
            />
          </div>
          <div ref={fieldRef("jump_label_decorate_bg_color")}>
            <TextInputRow
              label="Background"
              description="Background color of jump labels. Hex format: 0xRRGGBBAA."
              value={bgColor}
              placeholder="0x323232ff"
              onChange={(v) => setValue("jump_label_decorate_bg_color", v)}
            />
          </div>
          <div ref={fieldRef("jump_label_decorate_focus_fg_color")}>
            <TextInputRow
              label="Focused Text"
              description="Foreground color of the focused jump label. Hex format: 0xRRGGBBAA."
              value={focusFgColor}
              placeholder="0xeda6b4ff"
              onChange={(v) => setValue("jump_label_decorate_focus_fg_color", v)}
            />
          </div>
          <div ref={fieldRef("jump_label_decorate_focus_bg_color")}>
            <TextInputRow
              label="Focused Background"
              description="Background color of the focused jump label. Hex format: 0xRRGGBBAA."
              value={focusBgColor}
              placeholder="0x4e453cff"
              onChange={(v) => setValue("jump_label_decorate_focus_bg_color", v)}
            />
          </div>
          <div ref={fieldRef("jump_label_decorate_border_color")}>
            <TextInputRow
              label="Border"
              description="Color of the jump label outline. Hex format: 0xRRGGBBAA."
              value={borderColor}
              placeholder="0x8baa9bff"
              onChange={(v) => setValue("jump_label_decorate_border_color", v)}
            />
          </div>
        </SectionCard>
      </div>

      <div className="mb-5">
        <SectionCard title="Decoration">
          <div ref={fieldRef("jump_label_decorate_border_width")}>
            <SliderRow
              label="Border Width"
              description="Thickness of the jump label border in pixels."
              value={borderWidth}
              min={0}
              max={100}
              unit="px"
              onChange={(v) => setValue("jump_label_decorate_border_width", String(v))}
            />
          </div>
          <div ref={fieldRef("jump_label_decorate_corner_radius")}>
            <SliderRow
              label="Corner Radius"
              description="Rounding radius for jump label corners."
              value={cornerRadius}
              min={0}
              max={100}
              unit="px"
              onChange={(v) => setValue("jump_label_decorate_corner_radius", String(v))}
            />
          </div>
          <div ref={fieldRef("jump_label_decorate_padding_x")}>
            <SliderRow
              label="Padding X"
              description="Horizontal padding inside jump labels."
              value={paddingX}
              min={0}
              max={100}
              unit="px"
              onChange={(v) => setValue("jump_label_decorate_padding_x", String(v))}
            />
          </div>
          <div ref={fieldRef("jump_label_decorate_padding_y")}>
            <SliderRow
              label="Padding Y"
              description="Vertical padding inside jump labels."
              value={paddingY}
              min={0}
              max={100}
              unit="px"
              onChange={(v) => setValue("jump_label_decorate_padding_y", String(v))}
            />
          </div>
        </SectionCard>
      </div>
    </PanelShell>
  );
}
