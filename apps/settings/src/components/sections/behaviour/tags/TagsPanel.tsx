import { useConfigStore } from "@/lib/config-store";
import { cfgBool } from "@/lib/config-helpers";
import type { PanelProps } from "@/lib/section-types";
import { useFocusField } from "@/lib/use-focus-field";
import { PanelShell, PanelHeader, SectionCard, ToggleRow } from "@/components/sections/section-ui";

export function TagsPanel({ focusKey }: PanelProps) {
  const fieldRef = useFocusField(focusKey);
  const data = useConfigStore((s) => s.data);
  const setValue = useConfigStore((s) => s.setValue);

  const tb = (key: string) => (v: boolean) => setValue(key, v ? "1" : "0");

  const tagCarousel = cfgBool(data, "tag_carousel");
  const viewToBack = cfgBool(data, "view_current_to_back");

  return (
    <PanelShell>
      <PanelHeader
        title="Tags"
        description="Configure tag navigation behaviour."
        separator={false}
      />

      <div className="mb-5">
        <SectionCard title="Navigation">
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
