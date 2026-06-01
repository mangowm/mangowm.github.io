import { useConfigStore } from "@/lib/config-store";
import { cfgInt, cfgStr } from "@/lib/config-helpers";
import type { PanelProps } from "@/lib/section-types";
import { useFocusField } from "@/lib/use-focus-field";
import {
  PanelShell,
  PanelHeader,
  SectionCard,
  TextInputRow,
  SliderRow,
} from "@/components/sections/section-ui";



export function CursorPanel({ focusKey }: PanelProps) {
  const fieldRef = useFocusField(focusKey);
  const data = useConfigStore((s) => s.data);
  const setValue = useConfigStore((s) => s.setValue);

  const cursorTheme = cfgStr(data, "cursor_theme", "");
  const cursorSize = cfgInt(data, "cursor_size", 24, 16, 128);

  return (
    <PanelShell>
      <PanelHeader
        title="Cursor"
        description="Configure the XCursor theme and size."
        separator={false}
      />

      <div className="mb-5">
        <SectionCard title="Cursor">
          <div ref={fieldRef("cursor_theme")}>
            <TextInputRow
              label="Theme"
              description="XCursor theme name — e.g. 'Adwaita', 'Breeze', 'DMZ-White', 'Vanilla-DMZ'."
              value={cursorTheme}
              placeholder="Adwaita"
              onChange={(v) => setValue("cursor_theme", v)}
            />
          </div>
          <div ref={fieldRef("cursor_size")}>
            <SliderRow
              label="Size"
              description="Cursor size in pixels. Larger values are more visible on HiDPI displays."
              value={cursorSize}
              min={16}
              max={128}
              unit=" px"
              onChange={(v) => setValue("cursor_size", String(v))}
            />
          </div>
        </SectionCard>
      </div>
    </PanelShell>
  );
}
