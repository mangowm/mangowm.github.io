## Window Effects

Controls the visual polish of windows: blur, shadows, and rounded corners.

### Blur

- **`blur`** – Toggle background blur behind windows.
- **`blur_layer`** – Apply blur behind layer-shell surfaces (bars, notifications).
- **`blur_optimized`** – Use a faster (but slightly different looking) blur path.
- **`blur_params_num_passes`** – Number of blur iterations. Higher = smoother, more GPU.
- **`blur_params_radius`** – Pixel radius of the blur kernel.
- **`blur_params_noise`** – Noise added to the blurred image (reduces banding).
- **`blur_params_brightness`** – Brightness multiplier for the blurred layer.
- **`blur_params_contrast`** – Contrast multiplier for the blurred layer.
- **`blur_params_saturation`** – Saturation multiplier for the blurred layer.

### Border Radius

- **`border_radius`** – Radius (in px) applied to window corners. Set to `0` for sharp corners.
- **`border_radius_location_default`** – Bitmask selecting which corners are rounded. Defaults to `All Corners`.

### Shadows

- **`shadows`** – Toggle drop shadows under windows.
- **`shadow_only_floating`** – Only draw shadows for floating (non-tiled) windows.
- **`layer_shadows`** – Draw shadows under layer-shell surfaces as well.
- **`shadows_size`** – How far the shadow extends beyond the window (px).
- **`shadows_blur`** – Sigma value for shadow Gaussian blur (higher = softer).
- **`shadows_position_x`** / **`shadows_position_y`** – Offset of the shadow relative to the window (px).
