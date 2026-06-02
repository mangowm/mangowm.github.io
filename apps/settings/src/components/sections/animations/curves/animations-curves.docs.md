## Animation Curves

Controls the cubic-bezier easing curves for each animation type. Each curve is a set of four comma-separated floating-point values representing the two control points of a cubic bezier: `x1,y1,x2,y2`.

The standard easing curve used for most animations is `0.46,1.0,0.29,0.99` (a smooth ease-out).

### Window Animation Curves

- **`animation_curve_move`** – Bezier curve for move and resize animations.
- **`animation_curve_open`** – Bezier curve for window open animations.
- **`animation_curve_close`** – Bezier curve for window close animations.
- **`animation_curve_tag`** – Bezier curve for tag-switch (workspace) animations.
- **`animation_curve_focus`** – Bezier curve for focus-change animations.

### Opacity Animation Curves

- **`animation_curve_opafadein`** – Bezier curve for fade-in opacity transitions.
- **`animation_curve_opafadeout`** – Bezier curve for fade-out opacity transitions.
