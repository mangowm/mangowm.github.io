import { useConfigStore, useConfigStr, useConfigInt } from "@/lib/config-store";
import type { PanelProps } from "@/lib/section-types";
import { useFocusField } from "@/lib/use-focus-field";
import {
  PanelShell,
  PanelHeader,
  SectionCard,
  SliderRow,
  TextInputRow,
  ColorRow,
} from "@/components/sections/section-ui";

export function GroupBarPanel({ focusKey }: PanelProps) {
  const fieldRef = useFocusField(focusKey);
  const setValue = useConfigStore((s) => s.setValue);

  const barHeight = useConfigInt("group_bar_height", undefined, 0, 500);
  const fontDesc = useConfigStr("group_bar_decorate_font_desc");
  const borderWidth = useConfigInt("group_bar_decorate_border_width", undefined, 0, 100);
  const cornerRadius = useConfigInt("group_bar_decorate_corner_radius", undefined, 0, 100);
  const paddingX = useConfigInt("group_bar_decorate_padding_x", undefined, 0, 100);
  const paddingY = useConfigInt("group_bar_decorate_padding_y", undefined, 0, 100);

  const fgColor = useConfigStr("group_bar_decorate_fg_color");
  const bgColor = useConfigStr("group_bar_decorate_bg_color");
  const focusFgColor = useConfigStr("group_bar_decorate_focus_fg_color");
  const focusBgColor = useConfigStr("group_bar_decorate_focus_bg_color");
  const borderColor = useConfigStr("group_bar_decorate_border_color");

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
              label="Bar Height"
              description="Height of the window group bar in pixels."
              value={barHeight}
              min={0}
              max={500}
              unit="px"
              onChange={(v) => setValue("group_bar_height", String(v))}
            />
          </div>
          <div ref={fieldRef("group_bar_decorate_font_desc")}>
            <TextInputRow
              label="Font"
              description="Pango font description for window group labels, e.g. 'Sans 10' or 'monospace bold 11'."
              value={fontDesc}
              placeholder="Sans 10"
              onChange={(v) => setValue("group_bar_decorate_font_desc", v)}
            />
          </div>
        </SectionCard>
      </div>

      <div className="mb-5">
        <SectionCard title="Colors">
          <div ref={fieldRef("group_bar_decorate_fg_color")}>
            <ColorRow
              label="Text"
              description="Foreground color of window group labels."
              value={fgColor}
              onChange={(v) => setValue("group_bar_decorate_fg_color", v)}
            />
          </div>
          <div ref={fieldRef("group_bar_decorate_bg_color")}>
            <ColorRow
              label="Background"
              description="Background color of the window group bar."
              value={bgColor}
              onChange={(v) => setValue("group_bar_decorate_bg_color", v)}
            />
          </div>
          <div ref={fieldRef("group_bar_decorate_focus_fg_color")}>
            <ColorRow
              label="Focused Text"
              description="Foreground color of the focused group member label."
              value={focusFgColor}
              onChange={(v) => setValue("group_bar_decorate_focus_fg_color", v)}
            />
          </div>
          <div ref={fieldRef("group_bar_decorate_focus_bg_color")}>
            <ColorRow
              label="Focused Background"
              description="Background color of the focused group member bar."
              value={focusBgColor}
              onChange={(v) => setValue("group_bar_decorate_focus_bg_color", v)}
            />
          </div>
          <div ref={fieldRef("group_bar_decorate_border_color")}>
            <ColorRow
              label="Border"
              description="Color of the window group bar outline."
              value={borderColor}
              onChange={(v) => setValue("group_bar_decorate_border_color", v)}
            />
          </div>
        </SectionCard>
      </div>

      <div className="mb-5">
        <SectionCard title="Decoration">
          <div ref={fieldRef("group_bar_decorate_border_width")}>
            <SliderRow
              label="Border Width"
              description="Thickness of the window group bar border in pixels."
              value={borderWidth}
              min={0}
              max={100}
              unit="px"
              onChange={(v) => setValue("group_bar_decorate_border_width", String(v))}
            />
          </div>
          <div ref={fieldRef("group_bar_decorate_corner_radius")}>
            <SliderRow
              label="Corner Radius"
              description="Rounding radius for window group bar corners."
              value={cornerRadius}
              min={0}
              max={100}
              unit="px"
              onChange={(v) => setValue("group_bar_decorate_corner_radius", String(v))}
            />
          </div>
          <div ref={fieldRef("group_bar_decorate_padding_x")}>
            <SliderRow
              label="Padding X"
              description="Horizontal padding inside the window group bar."
              value={paddingX}
              min={0}
              max={100}
              unit="px"
              onChange={(v) => setValue("group_bar_decorate_padding_x", String(v))}
            />
          </div>
          <div ref={fieldRef("group_bar_decorate_padding_y")}>
            <SliderRow
              label="Padding Y"
              description="Vertical padding inside the window group bar."
              value={paddingY}
              min={0}
              max={100}
              unit="px"
              onChange={(v) => setValue("group_bar_decorate_padding_y", String(v))}
            />
          </div>
        </SectionCard>
      </div>
    </PanelShell>
  );
}
