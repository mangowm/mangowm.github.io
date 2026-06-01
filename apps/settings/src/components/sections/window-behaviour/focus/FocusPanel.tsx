import { useConfigStore } from "@/lib/config-store";
import { cfgBool } from "@/lib/config-helpers";
import type { PanelProps } from "@/lib/section-types";
import { useFocusField } from "@/lib/use-focus-field";
import { PanelShell, PanelHeader, SectionCard, ToggleRow } from "@/components/sections/section-ui";

export function FocusPanel({ focusKey }: PanelProps) {
  const fieldRef = useFocusField(focusKey);
  const data = useConfigStore((s) => s.data);
  const setValue = useConfigStore((s) => s.setValue);

  const tb = (key: string) => (v: boolean) => setValue(key, v ? "1" : "0");

  const sloppyfocus = cfgBool(data, "sloppyfocus", true);
  const warpcursor = cfgBool(data, "warpcursor", true);
  const focusOnActivate = cfgBool(data, "focus_on_activate", true);
  const focusCrossMon = cfgBool(data, "focus_cross_monitor");
  const focusCrossTag = cfgBool(data, "focus_cross_tag");

  return (
    <PanelShell>
      <PanelHeader
        title="Focus"
        description="Control how windows gain focus and where focus can travel."
        separator={false}
      />

      <div className="mb-5">
        <SectionCard title="Focus Behaviour">
          <div ref={fieldRef("sloppyfocus")}>
            <ToggleRow
              label="Sloppy Focus"
              description="Focus follows the mouse: moving the pointer into a window focuses it without clicking. When disabled, you must click to focus."
              value={sloppyfocus}
              onChange={tb("sloppyfocus")}
            />
          </div>
          <div ref={fieldRef("warpcursor")}>
            <ToggleRow
              label="Warp Cursor"
              description="Teleport the cursor to the centre of the newly focused window."
              value={warpcursor}
              onChange={tb("warpcursor")}
            />
          </div>
          <div ref={fieldRef("focus_on_activate")}>
            <ToggleRow
              label="Focus on Activate"
              description="When a window requests activation (urgency hint, xdg-activate), it receives focus immediately."
              value={focusOnActivate}
              onChange={tb("focus_on_activate")}
            />
          </div>
        </SectionCard>
      </div>

      <div className="mb-5">
        <SectionCard title="Boundaries">
          <div ref={fieldRef("focus_cross_monitor")}>
            <ToggleRow
              label="Cross-Monitor Focus"
              description="Allow directional focus changes (focusdir, focusstack) to move between monitors."
              value={focusCrossMon}
              onChange={tb("focus_cross_monitor")}
            />
          </div>
          <div ref={fieldRef("focus_cross_tag")}>
            <ToggleRow
              label="Cross-Tag Focus"
              description="Allow focus to move between windows on different tags."
              value={focusCrossTag}
              onChange={tb("focus_cross_tag")}
            />
          </div>
        </SectionCard>
      </div>
    </PanelShell>
  );
}
