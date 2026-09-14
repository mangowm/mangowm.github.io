import { useConfigStore, useConfigBool, useConfigInt } from "@/lib/config-store";
import type { PanelProps } from "@/lib/section-types";
import { useFocusField } from "@/lib/use-focus-field";
import {
  PanelShell,
  PanelHeader,
  SectionCard,
  ToggleRow,
  SliderRow,
} from "@/components/sections/section-ui";

export function TagsPanel({ focusKey }: PanelProps) {
  const fieldRef = useFocusField(focusKey);
  const setValue = useConfigStore((s) => s.setValue);

  const tb = (key: string) => (v: boolean) => setValue(key, v ? "1" : "0");

  const tagCarousel = useConfigBool("tag_carousel");
  const viewToBack = useConfigBool("view_current_to_back");
  const tagNum = useConfigInt("tag_num", undefined, 1, 31);
  const tagGather = useConfigBool("tag_gather");

  return (
    <PanelShell>
      <PanelHeader
        title="Tags"
        description="Configure tag count and navigation behaviour."
        separator={false}
      />

      <div className="mb-5">
        <SectionCard title="Count">
          <div ref={fieldRef("tag_num")}>
            <SliderRow
              label="Number of Tags"
              description="How many workspaces/tags are available. Range: 1–31."
              value={tagNum}
              min={1}
              max={31}
              unit=" tags"
              onChange={(v) => setValue("tag_num", String(Math.round(v)))}
            />
          </div>
          <div ref={fieldRef("tag_gather")}>
            <ToggleRow
              label="Gather Tags"
              description="Compact tags to remove gaps after windows leave tags."
              value={tagGather}
              onChange={tb("tag_gather")}
            />
          </div>
        </SectionCard>
      </div>

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
