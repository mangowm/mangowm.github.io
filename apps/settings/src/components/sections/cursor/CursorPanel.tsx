import { useConfigStore, useConfigStr, useGlobalInt } from "@/lib/config/store";
import type { PanelProps } from "@/lib/presentation/section-types";
import { useFocusField } from "@/lib/use-focus-field";
import {
  PanelShell,
  PanelHeader,
  SectionCard,
  TextInputRow,
  SliderRow,
} from "@/components/primitives/section-ui";

export function CursorPanel({ focusKey }: PanelProps) {
  const fieldRef = useFocusField(focusKey);
  const setValue = useConfigStore((s) => s.setValue);

  const cursorTheme = useConfigStr("cursor_theme");
  const cursorSize = useGlobalInt("cursor_size");

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
              configKey="cursor_theme"
              value={cursorTheme}
              placeholder="Adwaita"
              onChange={(v) => setValue("cursor_theme", v)}
            />
          </div>
          <div ref={fieldRef("cursor_size")}>
            <SliderRow
              configKey="cursor_size"
              value={cursorSize}
              unit=" px"
              onChange={(v) => setValue("cursor_size", String(v))}
            />
          </div>
        </SectionCard>
      </div>
    </PanelShell>
  );
}
