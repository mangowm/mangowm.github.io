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
  SliderRow,
  SelectRow,
} from "@/components/sections/section-ui";

// mango: CLAMP_INT(trackpad_accel_profile, 0, 2)
const ACCEL_PROFILE_OPTIONS = [
  { value: "0", label: "Flat" },
  { value: "1", label: "Adaptive" },
  { value: "2", label: "Custom" },
];

// mango: CLAMP_INT(button_map, 0, 1)
//   0 = LMR (Left/Middle/Right), 1 = LRM (Left/Right/Middle)
const BUTTON_MAP_OPTIONS = [
  { value: "0", label: "LMR" },
  { value: "1", label: "LRM" },
];

export function TrackpadPanel({ focusKey }: PanelProps) {
  const fieldRef = useFocusField(focusKey);
  const setValue = useConfigStore((s) => s.setValue);

  const tb = (key: string) => (v: boolean) => setValue(key, v ? "1" : "0");

  // mango defaults: trackpad_natural_scrolling=0, disable_trackpad=0
  // tap_to_click=1, tap_and_drag=1, drag_lock=1, button_map=LRM (1)
  const naturalScroll = useConfigBool("trackpad_natural_scrolling");
  const accelProfile = useConfigStr("trackpad_accel_profile", "1");
  const accelSpeed = useConfigFloat("trackpad_accel_speed", 0.0, -1.0, 1.0);
  // mango: CLAMP_FLOAT(trackpad_scroll_factor, 0.1, 10.0), default 1.0
  const scrollFactor = useConfigFloat("trackpad_scroll_factor", 1.0, 0.1, 10.0);
  const disabled = useConfigBool("disable_trackpad");
  const tapToClick = useConfigBool("tap_to_click", true);
  const tapAndDrag = useConfigBool("tap_and_drag", true);
  const dragLock = useConfigBool("drag_lock", true);
  // mango: CLAMP_INT(button_map, 0, 1), default TAP_MAP_LRM=1
  const buttonMap = useConfigStr("button_map", "1");
  // mango: CLAMP_INT(swipe_min_threshold, 1, 1000), default 1
  const swipeThreshold = useConfigInt("swipe_min_threshold", 1, 1, 1000);

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
              min={0.1}
              max={10.0}
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
              min={-1.0}
              max={1.0}
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
              min={1}
              max={200}
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
