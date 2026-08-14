import { useEffect, useState } from "react";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useConfigBool, useConfigStr, useConfigInt, useConfigFloat } from "@/lib/config-store";
import { parseCurve } from "@/lib/curve";
import type { BezierValue } from "@/lib/curve";
import { findAnimationCurveAt } from "@/lib/animation";
import { toCss } from "@/lib/color-utils";
import { SectionCard } from "@/components/sections/section-ui";

const DEFAULT_CURVE: BezierValue = [0.25, 0.1, 0.25, 1];

type PreviewEffect = "zoom" | "slide" | "fade" | "none";

/**
 * Mango resolves any open-animation type other than fade/zoom as a slide
 * ("none" disables via duration 0) — see animation/client.h.
 */
function resolveEffect(type: string, animationsOn: boolean): PreviewEffect {
  if (!animationsOn || type === "none") return "none";
  if (type === "zoom") return "zoom";
  if (type === "fade") return "fade";
  return "slide";
}

/**
 * Live preview of the window OPEN animation, driven by the real config:
 * `animation_type_open`, `animation_curve_open`, `animation_duration_open`,
 * `zoom_initial_ratio` and `fadein_begin_opacity`. Uses mango's exact easing
 * evaluation and replays whenever the inputs change. Pass `curve` to preview a
 * specific curve instead of the configured `animation_curve_open`.
 */
export function AnimationPreview({
  curve: curveOverride,
  title = "Animation Preview",
}: {
  curve?: BezierValue;
  title?: string;
}) {
  const animationsOn = useConfigBool("animations");
  const type = useConfigStr("animation_type_open");
  const duration = useConfigInt("animation_duration_open", undefined, 1, 50000);
  const zoomInitial = useConfigFloat("zoom_initial_ratio", undefined, 0.1, 1.0);
  const fadeBegin = useConfigFloat("fadein_begin_opacity", undefined, 0.0, 1.0);
  const rawCurve = useConfigStr("animation_curve_open");
  const rootColor = useConfigStr("rootcolor");
  const focusColor = useConfigStr("focuscolor");

  const parsedCurve = parseCurve(rawCurve);
  const storedCurve: BezierValue =
    parsedCurve && parsedCurve.length === 4
      ? [parsedCurve[0], parsedCurve[1], parsedCurve[2], parsedCurve[3]]
      : DEFAULT_CURVE;
  const curve = curveOverride ?? storedCurve;

  const effect = resolveEffect(type, animationsOn);

  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [replayKey, setReplayKey] = useState(0);

  // Replay whenever an animation input changes.
  useEffect(() => {
    setProgress(0);
    setPlaying(true);
  }, [effect, duration, curve, zoomInitial, fadeBegin, replayKey]);

  useEffect(() => {
    if (!playing) return;
    if (effect === "none") {
      setPlaying(false);
      setProgress(1);
      return;
    }
    const start = performance.now();
    const dur = Math.max(1, duration);
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      setProgress(findAnimationCurveAt(t, curve));
      if (t < 1) raf = requestAnimationFrame(tick);
      else setPlaying(false);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, effect, duration, curve, replayKey]);

  const handleReplay = () => {
    setProgress(0);
    setPlaying(true);
    setReplayKey((k) => k + 1);
  };

  const scale = effect === "zoom" ? zoomInitial + (1 - zoomInitial) * progress : 1;
  const opacity = effect === "fade" ? fadeBegin + (1 - fadeBegin) * progress : 1;
  const translateY = effect === "slide" ? (1 - progress) * 80 : 0;

  return (
    <SectionCard title={title}>
      <div className="px-4 py-3">
        <div
          className="relative h-40 overflow-hidden rounded-lg"
          style={{ backgroundColor: toCss(rootColor) }}
        >
          <div
            className="absolute left-1/2 top-1/2 h-24 w-32 rounded-md border-2"
            style={{
              borderColor: toCss(focusColor),
              backgroundColor: "hsl(var(--card))",
              transform: `translate(-50%, calc(-50% + ${translateY}px)) scale(${scale})`,
              opacity,
            }}
          >
            <div className="flex h-full items-center justify-center">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {effect === "none" ? "no animation" : effect}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="text-[11px] text-muted-foreground">
            {effect === "none"
              ? animationsOn
                ? "Animation type is set to none."
                : "Animations are disabled."
              : `${effect} · ${duration} ms`}
          </span>
          <Button size="sm" variant="secondary" onClick={handleReplay} className="gap-1.5">
            <Play className="size-3.5" />
            Replay
          </Button>
        </div>
      </div>
    </SectionCard>
  );
}
