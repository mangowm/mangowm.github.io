import { useConfigStore } from "@/lib/config-store";
import { cfgBool, cfgStr } from "@/lib/config-helpers";
import type { PanelProps } from "@/lib/section-types";
import { useFocusField } from "@/lib/use-focus-field";
import {
  PanelShell,
  PanelHeader,
  SectionCard,
  ToggleRow,
  SelectRow,
} from "@/components/sections/section-ui";

const DRAG_CORNER_OPTIONS = [
  { value: "0", label: "Top-Left" },
  { value: "1", label: "Top-Right" },
  { value: "2", label: "Bottom-Left" },
  { value: "3", label: "Bottom-Right" },
  { value: "4", label: "Auto" },
];

export function DragPanel({ focusKey }: PanelProps) {
  const fieldRef = useFocusField(focusKey);
  const data = useConfigStore((s) => s.data);
  const setValue = useConfigStore((s) => s.setValue);

  const tb = (key: string) => (v: boolean) => setValue(key, v ? "1" : "0");

  const dragCorner = cfgStr(data, "drag_corner", "3");
  const dragWarpCursor = cfgBool(data, "drag_warp_cursor", true);

  return (
    <PanelShell>
      <PanelHeader
        title="Drag"
        description="Configure how mouse-based resize works for floating windows."
        separator={false}
      />

      <div className="mb-5">
        <SectionCard title="Resize Behaviour">
          <div ref={fieldRef("drag_corner")}>
            <SelectRow
              label="Resize Corner"
              description="Default corner used when resizing floating windows with the mouse. Auto picks the corner nearest to the cursor."
              value={dragCorner}
              options={DRAG_CORNER_OPTIONS}
              onChange={(v) => setValue("drag_corner", v)}
            />
          </div>
          <div ref={fieldRef("drag_warp_cursor")}>
            <ToggleRow
              label="Warp Cursor on Drag Resize"
              description="Move the cursor to the resize corner when initiating a mouse drag resize."
              value={dragWarpCursor}
              onChange={tb("drag_warp_cursor")}
            />
          </div>
        </SectionCard>
      </div>
    </PanelShell>
  );
}
