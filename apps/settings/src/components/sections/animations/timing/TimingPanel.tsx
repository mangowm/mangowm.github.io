import { useConfigStore, useGlobalInt } from "@/lib/config/store";
import type { PanelProps } from "@/lib/presentation/section-types";
import { useFocusField } from "@/lib/use-focus-field";
import {
  PanelShell,
  PanelHeader,
  SectionCard,
  SliderRow,
} from "@/components/primitives/section-ui";

export function TimingPanel({ focusKey }: PanelProps) {
  const fieldRef = useFocusField(focusKey);
  const setValue = useConfigStore((s) => s.setValue);

  const durMove = useGlobalInt("animation_duration_move");
  const durOpen = useGlobalInt("animation_duration_open");
  const durClose = useGlobalInt("animation_duration_close");
  const durTag = useGlobalInt("animation_duration_tag");
  const durFocus = useGlobalInt("animation_duration_focus");

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
              configKey="animation_duration_move"
              label="Move / Resize"
              description="Animation duration when a window moves or resizes."
              value={durMove}
              step={10}
              unit="ms"
              onChange={(v) => setValue("animation_duration_move", String(v))}
            />
          </div>
          <div ref={fieldRef("animation_duration_open")}>
            <SliderRow
              configKey="animation_duration_open"
              label="Window Open"
              description="Animation duration when a new window opens."
              value={durOpen}
              step={10}
              unit="ms"
              onChange={(v) => setValue("animation_duration_open", String(v))}
            />
          </div>
          <div ref={fieldRef("animation_duration_close")}>
            <SliderRow
              configKey="animation_duration_close"
              label="Window Close"
              description="Animation duration when a window closes."
              value={durClose}
              step={10}
              unit="ms"
              onChange={(v) => setValue("animation_duration_close", String(v))}
            />
          </div>
          <div ref={fieldRef("animation_duration_tag")}>
            <SliderRow
              configKey="animation_duration_tag"
              label="Tag Switch"
              description="Animation duration when switching tags (workspaces)."
              value={durTag}
              step={10}
              unit="ms"
              onChange={(v) => setValue("animation_duration_tag", String(v))}
            />
          </div>
          <div ref={fieldRef("animation_duration_focus")}>
            <SliderRow
              configKey="animation_duration_focus"
              label="Focus Change"
              description="Animation duration when focus changes between windows."
              value={durFocus}
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
