# Drag

Configure mouse-based resize, tile dragging, floating snap, and drag rendering performance.

## Settings

### Floating Resize

| Option             | Default            | Description                                                                                                                       |
| ------------------ | ------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| `drag_corner`      | `3` (Bottom-Right) | Which corner is used for mouse resize. `0`=Top-Left, `1`=Top-Right, `2`=Bottom-Left, `3`=Bottom-Right, `4`=Auto (nearest corner). |
| `drag_warp_cursor` | `1` (on)           | Warp the cursor to the resize corner when starting a drag resize.                                                                 |

### Tile Drag

| Option              | Default   | Description                                                               |
| ------------------- | --------- | ------------------------------------------------------------------------- |
| `drag_tile_to_tile` | `0` (off) | Dragging a tiled window over another tile swaps their positions.          |
| `drag_tile_small`   | `1` (on)  | Treat small tile drags as click-to-focus instead of initiating a drag.    |

### Floating Snap

| Option                 | Default   | Description                                                            |
| ---------------------- | --------- | ---------------------------------------------------------------------- |
| `snap_distance`        | `30`      | Distance in pixels from screen edge/other window to trigger snap.      |
| `enable_floating_snap` | `0` (off) | Enable snap-to-edge behaviour for floating windows.                    |

### Drag Performance

| Option                            | Default | Description                                                                               |
| --------------------------------- | ------- | ----------------------------------------------------------------------------------------- |
| `drag_tile_refresh_interval`      | `8.0`   | Minimum ms between tile drag position updates (lower = smoother, higher = lower CPU).     |
| `drag_floating_refresh_interval`  | `8.0`   | Minimum ms between floating window drag position updates. Set to `0` to sync with vblank. |
