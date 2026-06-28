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

// CLAMP_INT(mouse_accel_profile, 0, 2)
//   libinput: 0 = NONE, 1 = FLAT, 2 = ADAPTIVE
const ACCEL_PROFILE_OPTIONS = [
  { value: "0", label: "None" },
  { value: "1", label: "Flat" },
  { value: "2", label: "Adaptive" },
];

// mango: CLAMP_INT(scroll_method, 0, 4)
//   0 = NO_SCROLL, 1 = 2FG, 2 = EDGE, 3 = ON_BUTTON_DOWN, 4 = (reserved)
const SCROLL_METHOD_OPTIONS = [
  { value: "0", label: "No Scroll" },
  { value: "1", label: "Two-Finger" },
  { value: "2", label: "Edge" },
  { value: "3", label: "On-Button-Down" },
  { value: "4", label: "Custom (4)" },
];

// mango: CLAMP_INT(scroll_button, 272, 279)
const SCROLL_BUTTON_OPTIONS = [
  { value: "272", label: "BTN_LEFT" },
  { value: "273", label: "BTN_RIGHT" },
  { value: "274", label: "BTN_MIDDLE" },
  { value: "275", label: "BTN_SIDE" },
  { value: "276", label: "BTN_EXTRA" },
  { value: "277", label: "BTN_FORWARD" },
  { value: "278", label: "BTN_BACK" },
  { value: "279", label: "BTN_TASK" },
];

// CLAMP_INT(click_method, 0, 2)
//   libinput: 0 = NONE, 1 = BUTTON_AREAS, 2 = CLICKFINGER
const CLICK_METHOD_OPTIONS = [
  { value: "0", label: "None" },
  { value: "1", label: "Button Areas" },
  { value: "2", label: "Clickfinger" },
];

// mango: CLAMP_INT(send_events_mode, 0, 2)
//   0 = ENABLED, 1 = DISABLED_ON_EXTERNAL_MOUSE, 2 = DISABLED
const SEND_EVENTS_OPTIONS = [
  { value: "0", label: "Enabled" },
  { value: "1", label: "Disabled w/ External Mouse" },
  { value: "2", label: "Disabled" },
];

export function PointerPanel({ focusKey }: PanelProps) {
  const fieldRef = useFocusField(focusKey);
  const setValue = useConfigStore((s) => s.setValue);

  const tb = (key: string) => (v: boolean) => setValue(key, v ? "1" : "0");

  const naturalScroll = useConfigBool("mouse_natural_scrolling");
  const accelProfile = useConfigStr("mouse_accel_profile");
  const accelSpeed = useConfigFloat("mouse_accel_speed", undefined, -1.0, 1.0);
  const scrollFactor = useConfigFloat("axis_scroll_factor", undefined, 0.1, 10.0);
  const axisBindTimeout = useConfigInt("axis_bind_apply_timeout", undefined, 0, 1000);
  const scrollMethod = useConfigStr("scroll_method");
  const scrollButton = useConfigStr("scroll_button");
  const clickMethod = useConfigStr("click_method");
  const sendEventsMode = useConfigStr("send_events_mode");
  const disableTyping = useConfigBool("disable_while_typing");
  const leftHanded = useConfigBool("left_handed");
  const middleBtn = useConfigBool("middle_button_emulation");

  return (
    <PanelShell>
      <PanelHeader
        title="Pointer / Mouse"
        description="Configure mouse and pointer device behavior."
        separator={false}
      />

      <div className="mb-5">
        <SectionCard title="Scrolling">
          <div ref={fieldRef("mouse_natural_scrolling")}>
            <ToggleRow
              label="Natural Scrolling"
              description="Reverse scroll direction so content moves with your fingers."
              value={naturalScroll}
              onChange={tb("mouse_natural_scrolling")}
            />
          </div>
          <div ref={fieldRef("axis_scroll_factor")}>
            <SliderRow
              label="Axis Scroll Factor"
              description="Multiplier for scroll wheel speed. Mango range: 0.1–10.0."
              value={scrollFactor}
              min={0.1}
              max={10.0}
              step={0.1}
              onChange={(v) => setValue("axis_scroll_factor", v.toFixed(1))}
            />
          </div>
          <div ref={fieldRef("axis_bind_apply_timeout")}>
            <SliderRow
              label="Axis Bind Apply Timeout"
              description="How long (ms) a scroll axis must be held before its binding fires. Prevents accidental triggers. Mango range: 0–1000."
              value={axisBindTimeout}
              min={0}
              max={1000}
              step={10}
              unit=" ms"
              onChange={(v) => setValue("axis_bind_apply_timeout", String(v))}
            />
          </div>
          <div ref={fieldRef("scroll_method")}>
            <SelectRow
              label="Scroll Method"
              description="How scrolling works. Two-Finger, Edge, or On-Button-Down."
              value={scrollMethod}
              options={SCROLL_METHOD_OPTIONS}
              onChange={(v) => setValue("scroll_method", v)}
            />
          </div>
          <div ref={fieldRef("scroll_button")}>
            <SelectRow
              label="Scroll Button"
              description="Button used for on-button-down scrolling mode."
              value={scrollButton}
              options={SCROLL_BUTTON_OPTIONS}
              onChange={(v) => setValue("scroll_button", v)}
            />
          </div>
        </SectionCard>
      </div>

      <div className="mb-5">
        <SectionCard title="Acceleration">
          <div ref={fieldRef("mouse_accel_profile")}>
            <SelectRow
              label="Acceleration Profile"
              description="Flat = constant pointer speed. Adaptive = speed varies with velocity. Custom = user-defined curve."
              value={accelProfile}
              options={ACCEL_PROFILE_OPTIONS}
              onChange={(v) => setValue("mouse_accel_profile", v)}
            />
          </div>
          <div ref={fieldRef("mouse_accel_speed")}>
            <SliderRow
              label="Acceleration Speed"
              description="Pointer acceleration factor. Negative slows down, positive speeds up. Mango range: -1.0 to 1.0."
              value={accelSpeed}
              min={-1.0}
              max={1.0}
              step={0.01}
              onChange={(v) => setValue("mouse_accel_speed", v.toFixed(2))}
            />
          </div>
        </SectionCard>
      </div>

      <div className="mb-5">
        <SectionCard title="Clicking">
          <div ref={fieldRef("click_method")}>
            <SelectRow
              label="Click Method"
              description="How clicks are detected. None = hardware click only, Clickfinger = finger count, Button Areas = zones."
              value={clickMethod}
              options={CLICK_METHOD_OPTIONS}
              onChange={(v) => setValue("click_method", v)}
            />
          </div>
          <div ref={fieldRef("send_events_mode")}>
            <SelectRow
              label="Send Events Mode"
              description="Controls when pointer events are sent to the compositor."
              value={sendEventsMode}
              options={SEND_EVENTS_OPTIONS}
              onChange={(v) => setValue("send_events_mode", v)}
            />
          </div>
        </SectionCard>
      </div>

      <div className="mb-5">
        <SectionCard title="Button Behavior">
          <div ref={fieldRef("disable_while_typing")}>
            <ToggleRow
              label="Disable While Typing"
              description="Temporarily disable the touchpad while typing on the keyboard. Enabled by default."
              value={disableTyping}
              onChange={tb("disable_while_typing")}
            />
          </div>
          <div ref={fieldRef("left_handed")}>
            <ToggleRow
              label="Left Handed"
              description="Swap the left and right mouse buttons for left-handed use."
              value={leftHanded}
              onChange={tb("left_handed")}
            />
          </div>
          <div ref={fieldRef("middle_button_emulation")}>
            <ToggleRow
              label="Middle Button Emulation"
              description="Emulate middle-click by pressing left and right buttons together."
              value={middleBtn}
              onChange={tb("middle_button_emulation")}
            />
          </div>
        </SectionCard>
      </div>
    </PanelShell>
  );
}
