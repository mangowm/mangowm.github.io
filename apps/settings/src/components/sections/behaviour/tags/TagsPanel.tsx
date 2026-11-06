import { useConfigStore, useConfigBool, useGlobalInt } from "@/lib/config/store";
import type { PanelProps } from "@/lib/presentation/section-types";
import { useFocusField } from "@/lib/use-focus-field";
import {
  PanelShell,
  PanelHeader,
  SectionCard,
  ToggleRow,
  SliderRow,
} from "@/components/primitives/section-ui";

export function TagsPanel({ focusKey }: PanelProps) {
  const fieldRef = useFocusField(focusKey);
  const setValue = useConfigStore((s) => s.setValue);

  const tb = (key: string) => (v: boolean) => setValue(key, v ? "1" : "0");

  const tagCarousel = useConfigBool("tag_carousel");
  const viewToBack = useConfigBool("view_current_to_back");
  const tagNum = useGlobalInt("tag_num");
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
              configKey="tag_num"
              value={tagNum}
              unit=" tags"
              onChange={(v) => setValue("tag_num", String(Math.round(v)))}
            />
          </div>
          <div ref={fieldRef("tag_gather")}>
            <ToggleRow configKey="tag_gather" value={tagGather} onChange={tb("tag_gather")} />
          </div>
        </SectionCard>
      </div>

      <div className="mb-5">
        <SectionCard title="Navigation">
          <div ref={fieldRef("tag_carousel")}>
            <ToggleRow configKey="tag_carousel" value={tagCarousel} onChange={tb("tag_carousel")} />
          </div>
          <div ref={fieldRef("view_current_to_back")}>
            <ToggleRow
              configKey="view_current_to_back"
              value={viewToBack}
              onChange={tb("view_current_to_back")}
            />
          </div>
        </SectionCard>
      </div>
    </PanelShell>
  );
}
