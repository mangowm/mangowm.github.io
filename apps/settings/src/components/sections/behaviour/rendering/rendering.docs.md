# Rendering

Configure display rendering behaviour — tearing control and GPU synchronisation.

## Settings

### Tearing

| Option          | Default   | Description                                                                                       |
| --------------- | --------- | ------------------------------------------------------------------------------------------------- |
| `allow_tearing` | `0` (off) | Reduce input latency by permitting screen tearing. `0`=Disabled, `1`=Always, `2`=Fullscreen Only. |

### GPU Synchronisation

| Option           | Default   | Description                                                          |
| ---------------- | --------- | -------------------------------------------------------------------- |
| `syncobj_enable` | `0` (off) | Enable DRM sync object timeline support for improved GPU scheduling. |
