import {
  useConfigStore,
  useConfigBool,
  useConfigStr,
  useGlobalFloat,
  useGlobalInt,
} from "@/lib/config/store";
import { globalMax, globalMin, globalOptions } from "@/lib/config/schema-meta";
import type { PanelProps } from "@/lib/presentation/section-types";
import { useFocusField } from "@/lib/use-focus-field";
import {
  PanelShell,
  PanelHeader,
  SectionCard,
  ToggleRow,
  SliderRow,
  SelectRow,
} from "@/components/primitives/section-ui";

const ACCEL_PROFILE_OPTIONS = globalOptions("trackpad_accel_profile") ?? [];
const BUTTON_MAP_OPTIONS = globalOptions("button_map") ?? [];

export function TrackpadPanel({ focusKey }: PanelProps) {
  const fieldRef = useFocusField(focusKey);
  const setValue = useConfigStore((s) => s.setValue);

  const tb = (key: string) => (v: boolean) => setValue(key, v ? "1" : "0");

  const naturalScroll = useConfigBool("trackpad_natural_scrolling");
  const accelProfile = useConfigStr("trackpad_accel_profile");
  const accelSpeed = useGlobalFloat("trackpad_accel_speed");
  const scrollFactor = useGlobalFloat("trackpad_scroll_factor");
  const disabled = useConfigBool("disable_trackpad");
  const tapToClick = useConfigBool("tap_to_click");
  const tapAndDrag = useConfigBool("tap_and_drag");
  const dragLock = useConfigBool("drag_lock");
  const buttonMap = useConfigStr("button_map");
  const swipeThreshold = useGlobalInt("swipe_min_threshold");

  return (
    <PanelShell>
      <PanelHeader
        title="Trackpad"
        description="Configure trackpad input behavior, acceleration, and gestures."
        separator={false}
      />

      <div className="mb-5">
        <SectionCard title="Scrolling">
          <div ref={fieldRef("trackpad_natural_scrolling")}>
            <ToggleRow
              label="Natural Scrolling"
              description="Reverse scroll direction for the trackpad."
              value={naturalScroll}
              onChange={tb("trackpad_natural_scrolling")}
            />
          </div>
          <div ref={fieldRef("trackpad_scroll_factor")}>
            <SliderRow
              label="Scroll Factor"
              description="Multiplier for trackpad scroll speed. Mango range: 0.1–10.0."
              value={scrollFactor}
              min={globalMin("trackpad_scroll_factor") ?? 0.1}
              max={globalMax("trackpad_scroll_factor") ?? 10}
              step={0.1}
              onChange={(v) => setValue("trackpad_scroll_factor", v.toFixed(1))}
            />
          </div>
        </SectionCard>
      </div>

      <div className="mb-5">
        <SectionCard title="Acceleration">
          <div ref={fieldRef("trackpad_accel_profile")}>
            <SelectRow
              label="Acceleration Profile"
              description="Flat = constant pointer speed. Adaptive = speed varies with velocity. Custom = user-defined curve."
              value={accelProfile}
              options={ACCEL_PROFILE_OPTIONS}
              onChange={(v) => setValue("trackpad_accel_profile", v)}
            />
          </div>
          <div ref={fieldRef("trackpad_accel_speed")}>
            <SliderRow
              label="Acceleration Speed"
              description="Trackpad pointer acceleration factor."
              value={accelSpeed}
              min={globalMin("trackpad_accel_speed") ?? -1}
              max={globalMax("trackpad_accel_speed") ?? 1}
              step={0.01}
              onChange={(v) => setValue("trackpad_accel_speed", v.toFixed(2))}
            />
          </div>
        </SectionCard>
      </div>

      <div className="mb-5">
        <SectionCard title="Gestures & Taps">
          <div ref={fieldRef("tap_to_click")}>
            <ToggleRow
              label="Tap to Click"
              description="Tap the trackpad surface to register a click."
              value={tapToClick}
              onChange={tb("tap_to_click")}
            />
          </div>
          <div ref={fieldRef("tap_and_drag")}>
            <ToggleRow
              label="Tap and Drag"
              description="Double-tap and hold to drag items."
              value={tapAndDrag}
              onChange={tb("tap_and_drag")}
            />
          </div>
          <div ref={fieldRef("drag_lock")}>
            <ToggleRow
              label="Drag Lock"
              description="Lift your finger briefly without cancelling the drag."
              value={dragLock}
              onChange={tb("drag_lock")}
            />
          </div>
          <div ref={fieldRef("button_map")}>
            <SelectRow
              label="Button Map"
              description="Tap gesture button mapping. LMR = 1-finger=Left, 2-finger=Middle, 3-finger=Right. LRM = 2-finger=Right, 3-finger=Middle."
              value={buttonMap}
              options={BUTTON_MAP_OPTIONS}
              onChange={(v) => setValue("button_map", v)}
            />
          </div>
          <div ref={fieldRef("swipe_min_threshold")}>
            <SliderRow
              label="Swipe Minimum Threshold"
              description="Minimum pointer movement in pixels to trigger a swipe gesture. Higher values reduce accidental triggers. Mango range: 1–1000."
              value={swipeThreshold}
              min={globalMin("swipe_min_threshold") ?? 1}
              max={globalMax("swipe_min_threshold") ?? 200}
              unit=" px"
              onChange={(v) => setValue("swipe_min_threshold", String(v))}
            />
          </div>
        </SectionCard>
      </div>

      <div className="mb-5">
        <SectionCard title="Device">
          <div ref={fieldRef("disable_trackpad")}>
            <ToggleRow
              label="Disable Trackpad"
              description="Completely disable the built-in trackpad."
              value={disabled}
              onChange={tb("disable_trackpad")}
            />
          </div>
        </SectionCard>
      </div>
    </PanelShell>
  );
}
