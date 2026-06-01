import { useConfigStore } from "@/lib/config-store";
import { cfgBool } from "@/lib/config-helpers";
import type { PanelProps } from "@/lib/section-types";
import { useFocusField } from "@/lib/use-focus-field";
import { PanelShell, PanelHeader, SectionCard, ToggleRow } from "@/components/sections/section-ui";

export function WorkspacePanel({ focusKey }: PanelProps) {
  const fieldRef = useFocusField(focusKey);
  const data = useConfigStore((s) => s.data);
  const setValue = useConfigStore((s) => s.setValue);

  const tb = (key: string) => (v: boolean) => setValue(key, v ? "1" : "0");

  const exchangeCrossMon = cfgBool(data, "exchange_cross_monitor");
  const scratchpadCrossMon = cfgBool(data, "scratchpad_cross_monitor");
  const singleScratchpad = cfgBool(data, "single_scratchpad", true);
  const tagCarousel = cfgBool(data, "tag_carousel");
  const viewToBack = cfgBool(data, "view_current_to_back");

  return (
    <PanelShell>
      <PanelHeader
        title="Workspace"
        description="Configure how monitors, tags, and scratchpads interact."
        separator={false}
      />

      <div className="mb-5">
        <SectionCard title="Cross-Monitor">
          <div ref={fieldRef("exchange_cross_monitor")}>
            <ToggleRow
              label="Cross-Monitor Exchange"
              description="Allow swapping window positions between different monitors."
              value={exchangeCrossMon}
              onChange={tb("exchange_cross_monitor")}
            />
          </div>
          <div ref={fieldRef("scratchpad_cross_monitor")}>
            <ToggleRow
              label="Scratchpad Cross-Monitor"
              description="Scratchpad windows can be shown on any monitor, not just the one they were moved from."
              value={scratchpadCrossMon}
              onChange={tb("scratchpad_cross_monitor")}
            />
          </div>
        </SectionCard>
      </div>

      <div className="mb-5">
        <SectionCard title="Scratchpad">
          <div ref={fieldRef("single_scratchpad")}>
            <ToggleRow
              label="Single Scratchpad"
              description="Only one scratchpad window exists at a time. Opening a new one hides the previous."
              value={singleScratchpad}
              onChange={tb("single_scratchpad")}
            />
          </div>
        </SectionCard>
      </div>

      <div className="mb-5">
        <SectionCard title="Tags">
          <div ref={fieldRef("tag_carousel")}>
            <ToggleRow
              label="Tag Carousel"
              description="Tags wrap around in a carousel — navigating past the last tag goes back to the first, and vice versa."
              value={tagCarousel}
              onChange={tb("tag_carousel")}
            />
          </div>
          <div ref={fieldRef("view_current_to_back")}>
            <ToggleRow
              label="View Current to Back"
              description="When you try to view the currently active tag, it sends the current view to the background and switches to the previous tag."
              value={viewToBack}
              onChange={tb("view_current_to_back")}
            />
          </div>
        </SectionCard>
      </div>
    </PanelShell>
  );
}
