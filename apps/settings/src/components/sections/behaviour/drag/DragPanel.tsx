import { useConfigStore, useConfigBool, useConfigStr, useGlobalInt } from "@/lib/config/store";
import { globalMax, globalMin } from "@/lib/config/schema-meta";
import type { PanelProps } from "@/lib/presentation/section-types";
import { useFocusField } from "@/lib/use-focus-field";
import {
  PanelShell,
  PanelHeader,
  SectionCard,
  SliderRow,
  ToggleRow,
  SelectRow,
} from "@/components/primitives/section-ui";

const DRAG_CORNER_OPTIONS = [
  { value: "0", label: "Top-Left" },
  { value: "1", label: "Top-Right" },
  { value: "2", label: "Bottom-Left" },
  { value: "3", label: "Bottom-Right" },
  { value: "4", label: "Auto" },
];

export function DragPanel({ focusKey }: PanelProps) {
  const fieldRef = useFocusField(focusKey);
  const setValue = useConfigStore((s) => s.setValue);

  const tb = (key: string) => (v: boolean) => setValue(key, v ? "1" : "0");

  const dragCorner = useConfigStr("drag_corner");
  const dragWarpCursor = useConfigBool("drag_warp_cursor");
  const dragTileToTile = useConfigBool("drag_tile_to_tile");
  const dragTileSmall = useConfigBool("drag_tile_small");
  const snapDist = useGlobalInt("snap_distance");
  const floatSnap = useConfigBool("enable_floating_snap");

  return (
    <PanelShell>
      <PanelHeader
        title="Drag"
        description="Configure how mouse-based resize and drag operations work for floating and tiled windows."
        separator={false}
      />

      <div className="mb-5">
        <SectionCard title="Floating Resize">
          <div ref={fieldRef("drag_corner")}>
            <SelectRow
              configKey="drag_corner"
              value={dragCorner}
              options={DRAG_CORNER_OPTIONS}
              onChange={(v) => setValue("drag_corner", v)}
            />
          </div>
          <div ref={fieldRef("drag_warp_cursor")}>
            <ToggleRow
              configKey="drag_warp_cursor"
              value={dragWarpCursor}
              onChange={tb("drag_warp_cursor")}
            />
          </div>
        </SectionCard>
      </div>

      <div className="mb-5">
        <SectionCard title="Tile Drag">
          <div ref={fieldRef("drag_tile_to_tile")}>
            <ToggleRow
              configKey="drag_tile_to_tile"
              value={dragTileToTile}
              onChange={tb("drag_tile_to_tile")}
            />
          </div>
          <div ref={fieldRef("drag_tile_small")}>
            <ToggleRow
              configKey="drag_tile_small"
              value={dragTileSmall}
              onChange={tb("drag_tile_small")}
            />
          </div>
        </SectionCard>
      </div>

      <div className="mb-5">
        <SectionCard title="Floating Snap">
          <div ref={fieldRef("enable_floating_snap")}>
            <ToggleRow
              configKey="enable_floating_snap"
              value={floatSnap}
              onChange={tb("enable_floating_snap")}
            />
          </div>
          <div ref={fieldRef("snap_distance")}>
            <SliderRow
              configKey="snap_distance"
              value={snapDist}
              min={globalMin("snap_distance") ?? 0}
              max={globalMax("snap_distance") ?? 200}
              unit=" px"
              onChange={(v) => setValue("snap_distance", String(v))}
            />
          </div>
        </SectionCard>
      </div>
    </PanelShell>
  );
}
