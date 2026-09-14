import { useConfigStore, useConfigInt } from "@/lib/config-store";
import type { PanelProps } from "@/lib/section-types";
import { useFocusField } from "@/lib/use-focus-field";
import { PanelShell, PanelHeader, SectionCard, SliderRow } from "@/components/sections/section-ui";

export function TimingPanel({ focusKey }: PanelProps) {
  const fieldRef = useFocusField(focusKey);
  const setValue = useConfigStore((s) => s.setValue);

  const durMove = useConfigInt("animation_duration_move", undefined, 1, 50000);
  const durOpen = useConfigInt("animation_duration_open", undefined, 1, 50000);
  const durClose = useConfigInt("animation_duration_close", undefined, 1, 50000);
  const durTag = useConfigInt("animation_duration_tag", undefined, 1, 50000);
  const durFocus = useConfigInt("animation_duration_focus", undefined, 0, 50000);

  return (
    <PanelShell>
      <PanelHeader
        title="Animation Timing"
        description="Set the duration (in milliseconds) for each type of animation. Higher values = slower, more pronounced animations."
        separator={false}
      />

      <div className="mb-5">
        <SectionCard title="Durations (ms)">
          <div ref={fieldRef("animation_duration_move")}>
            <SliderRow
              label="Move / Resize"
              description="Animation duration when a window moves or resizes."
              value={durMove}
              min={1}
              max={5000}
              step={10}
              unit="ms"
              onChange={(v) => setValue("animation_duration_move", String(v))}
            />
          </div>
          <div ref={fieldRef("animation_duration_open")}>
            <SliderRow
              label="Window Open"
              description="Animation duration when a new window opens."
              value={durOpen}
              min={1}
              max={5000}
              step={10}
              unit="ms"
              onChange={(v) => setValue("animation_duration_open", String(v))}
            />
          </div>
          <div ref={fieldRef("animation_duration_close")}>
            <SliderRow
              label="Window Close"
              description="Animation duration when a window closes."
              value={durClose}
              min={1}
              max={5000}
              step={10}
              unit="ms"
              onChange={(v) => setValue("animation_duration_close", String(v))}
            />
          </div>
          <div ref={fieldRef("animation_duration_tag")}>
            <SliderRow
              label="Tag Switch"
              description="Animation duration when switching tags (workspaces)."
              value={durTag}
              min={1}
              max={5000}
              step={10}
              unit="ms"
              onChange={(v) => setValue("animation_duration_tag", String(v))}
            />
          </div>
          <div ref={fieldRef("animation_duration_focus")}>
            <SliderRow
              label="Focus Change"
              description="Animation duration when focus changes between windows."
              value={durFocus}
              min={1}
              max={5000}
              step={10}
              unit="ms"
              onChange={(v) => setValue("animation_duration_focus", String(v))}
            />
          </div>
        </SectionCard>
      </div>
    </PanelShell>
  );
}
