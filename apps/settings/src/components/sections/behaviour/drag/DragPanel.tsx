import {
  useConfigStore,
  useConfigBool,
  useConfigFloat,
  useConfigInt,
  useConfigStr,
} from "@/lib/config-store";
import type { PanelProps } from "@/lib/section-types";
import { useFocusField } from "@/lib/use-focus-field";
import {
  PanelShell,
  PanelHeader,
  SectionCard,
  ToggleRow,
  SelectRow,
  SliderRow,
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
  const setValue = useConfigStore((s) => s.setValue);

  const tb = (key: string) => (v: boolean) => setValue(key, v ? "1" : "0");

  const dragCorner = useConfigStr("drag_corner", "3");
  const dragWarpCursor = useConfigBool("drag_warp_cursor", true);

  // mango: CLAMP_INT(drag_tile_to_tile, 0, 1), default 0
  const dragTileToTile = useConfigBool("drag_tile_to_tile");
  // mango: CLAMP_INT(drag_tile_small, 0, 1), default 1
  const dragTileSmall = useConfigBool("drag_tile_small", true);

  // mango: CLAMP_FLOAT(drag_tile_refresh_interval, 1.0, 16.0), default 8.0
  const tileRefresh = useConfigFloat("drag_tile_refresh_interval", 8.0, 1.0, 16.0);
  // mango: CLAMP_FLOAT(drag_floating_refresh_interval, 0.0, 1000.0), default 8.0
  const floatRefresh = useConfigFloat("drag_floating_refresh_interval", 8.0, 0.0, 1000.0);

  // mango: CLAMP_INT(snap_distance, 0, 99999), default 30
  const snapDist = useConfigInt("snap_distance", 30, 0, 99999);
  // mango: CLAMP_INT(enable_floating_snap, 0, 1), default 0
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

      <div className="mb-5">
        <SectionCard title="Tile Drag">
          <div ref={fieldRef("drag_tile_to_tile")}>
            <ToggleRow
              label="Tile-to-Tile Drag"
              description="Allow reordering tiled windows by dragging one onto another. When disabled, tiled windows cannot be dragged."
              value={dragTileToTile}
              onChange={tb("drag_tile_to_tile")}
            />
          </div>
          <div ref={fieldRef("drag_tile_small")}>
            <ToggleRow
              label="Small Tile Preview"
              description="When dragging a tiled window, shrink it to a small thumbnail so you can see the layout underneath."
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
              label="Floating Snap"
              description="Snap floating windows to each other and to screen edges when moved close enough."
              value={floatSnap}
              onChange={tb("enable_floating_snap")}
            />
          </div>
          <div ref={fieldRef("snap_distance")}>
            <SliderRow
              label="Snap Distance"
              description="Maximum distance in pixels for a floating window to snap. Mango range: 0–99999."
              value={snapDist}
              min={0}
              max={200}
              unit=" px"
              onChange={(v) => setValue("snap_distance", String(v))}
            />
          </div>
        </SectionCard>
      </div>

      <div className="mb-5">
        <SectionCard title="Drag Performance">
          <div ref={fieldRef("drag_tile_refresh_interval")}>
            <SliderRow
              label="Tile Drag Refresh"
              description="Render refresh interval when dragging tiled windows. Lower values = smoother but more GPU work. Mango range: 1.0–16.0."
              value={tileRefresh}
              min={1.0}
              max={16.0}
              step={0.5}
              unit=" ms"
              onChange={(v) => setValue("drag_tile_refresh_interval", v.toFixed(1))}
            />
          </div>
          <div ref={fieldRef("drag_floating_refresh_interval")}>
            <SliderRow
              label="Floating Drag Refresh"
              description="Render refresh interval when dragging floating windows. 0 = every frame. Mango range: 0.0–1000.0."
              value={floatRefresh}
              min={0.0}
              max={1000.0}
              step={0.5}
              unit=" ms"
              onChange={(v) => setValue("drag_floating_refresh_interval", v.toFixed(1))}
            />
          </div>
        </SectionCard>
      </div>
    </PanelShell>
  );
}
