import {
  useConfigBool,
  useConfigFloat,
  useConfigInt,
  useConfigStr,
  useConfigStore,
} from "@/lib/config/store";
import type { PanelProps } from "@/lib/presentation/section-types";
import { useFocusField } from "@/lib/use-focus-field";
import {
  PanelHeader,
  PanelShell,
  SectionCard,
  SelectRow,
  SliderRow,
  ToggleRow,
} from "@/components/primitives/section-ui";

const ACCEL_PROFILE_OPTIONS = [
  { value: "0", label: "None" },
  { value: "1", label: "Flat" },
  { value: "2", label: "Adaptive" },
];

const SCROLL_METHOD_OPTIONS = [
  { value: "0", label: "No Scroll" },
  { value: "1", label: "Two-Finger" },
  { value: "2", label: "Edge" },
  { value: "3", label: "On-Button-Down" },
  { value: "4", label: "Custom (4)" },
];

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

const CLICK_METHOD_OPTIONS = [
  { value: "0", label: "None" },
  { value: "1", label: "Button Areas" },
  { value: "2", label: "Clickfinger" },
];

const SEND_EVENTS_OPTIONS = [
  { value: "0", label: "Enabled" },
  { value: "1", label: "Disabled w/ External Mouse" },
  { value: "2", label: "Disabled" },
];

interface DeviceSectionProps {
  prefix: "mouse" | "trackpad";
  title: string;
  focusKey?: string;
  trackpad?: boolean;
}

function DeviceSection({ prefix, title, focusKey, trackpad = false }: DeviceSectionProps) {
  const fieldRef = useFocusField(focusKey);
  const setValue = useConfigStore((state) => state.setValue);
  const toggle = (key: string) => (value: boolean) => setValue(key, value ? "1" : "0");

  const naturalScrolling = useConfigBool(`${prefix}_natural_scrolling`);
  const accelProfile = useConfigStr(`${prefix}_accel_profile`);
  const accelSpeed = useConfigFloat(`${prefix}_accel_speed`, undefined, -1, 1);
  const scrollMethod = useConfigStr(`${prefix}_scroll_method`);
  const scrollButton = useConfigStr(`${prefix}_scroll_button`);
  const clickMethod = useConfigStr(`${prefix}_click_method`);
  const sendEvents = useConfigStr(`${prefix}_send_events_mode`);
  const leftHanded = useConfigBool(`${prefix}_left_handed`);
  const middleButton = useConfigBool(`${prefix}_middle_button_emulation`);
  const disableWhileTyping = useConfigBool(`${prefix}_disable_while_typing`);

  return (
    <div className="mb-5">
      <SectionCard title={title}>
        <div ref={fieldRef(`${prefix}_natural_scrolling`)}>
          <ToggleRow
            label="Natural Scrolling"
            description="Reverse scroll direction so content moves with your fingers."
            value={naturalScrolling}
            onChange={toggle(`${prefix}_natural_scrolling`)}
          />
        </div>

        <div ref={fieldRef(`${prefix}_accel_profile`)}>
          <SelectRow
            label="Acceleration Profile"
            description="Flat keeps constant speed. Adaptive varies with velocity."
            value={accelProfile}
            options={ACCEL_PROFILE_OPTIONS}
            onChange={(value) => setValue(`${prefix}_accel_profile`, value)}
          />
        </div>

        <div ref={fieldRef(`${prefix}_accel_speed`)}>
          <SliderRow
            label="Acceleration Speed"
            description="Negative slows down, positive speeds up."
            value={accelSpeed}
            min={-1}
            max={1}
            step={0.01}
            onChange={(value) => setValue(`${prefix}_accel_speed`, value.toFixed(2))}
          />
        </div>

        <div ref={fieldRef(`${prefix}_scroll_method`)}>
          <SelectRow
            label="Scroll Method"
            description="Two-finger, edge scrolling, or on-button-down."
            value={scrollMethod}
            options={SCROLL_METHOD_OPTIONS}
            onChange={(value) => setValue(`${prefix}_scroll_method`, value)}
          />
        </div>

        <div ref={fieldRef(`${prefix}_scroll_button`)}>
          <SelectRow
            label="Scroll Button"
            description="Button used for on-button-down scrolling."
            value={scrollButton}
            options={SCROLL_BUTTON_OPTIONS}
            onChange={(value) => setValue(`${prefix}_scroll_button`, value)}
          />
        </div>

        <div ref={fieldRef(`${prefix}_click_method`)}>
          <SelectRow
            label="Click Method"
            description="How clicks are detected."
            value={clickMethod}
            options={CLICK_METHOD_OPTIONS}
            onChange={(value) => setValue(`${prefix}_click_method`, value)}
          />
        </div>

        <div ref={fieldRef(`${prefix}_send_events_mode`)}>
          <SelectRow
            label="Send Events Mode"
            description="When pointer events are sent to the compositor."
            value={sendEvents}
            options={SEND_EVENTS_OPTIONS}
            onChange={(value) => setValue(`${prefix}_send_events_mode`, value)}
          />
        </div>

        <div ref={fieldRef(`${prefix}_left_handed`)}>
          <ToggleRow
            label="Left Handed"
            description="Swap the left and right buttons."
            value={leftHanded}
            onChange={toggle(`${prefix}_left_handed`)}
          />
        </div>

        <div ref={fieldRef(`${prefix}_middle_button_emulation`)}>
          <ToggleRow
            label="Middle Button Emulation"
            description="Emulate middle-click with the left and right buttons."
            value={middleButton}
            onChange={toggle(`${prefix}_middle_button_emulation`)}
          />
        </div>

        {trackpad && (
          <div ref={fieldRef("trackpad_disable_while_typing")}>
            <ToggleRow
              label="Disable While Typing"
              description="Temporarily disable the touchpad while typing."
              value={disableWhileTyping}
              onChange={toggle("trackpad_disable_while_typing")}
            />
          </div>
        )}
      </SectionCard>
    </div>
  );
}

export function PointerPanel({ focusKey }: PanelProps) {
  const fieldRef = useFocusField(focusKey);
  const setValue = useConfigStore((state) => state.setValue);

  const scrollFactor = useConfigFloat("axis_scroll_factor", undefined, 0.1, 10);
  const axisBindTimeout = useConfigInt("axis_bind_apply_timeout", undefined, 0, 1000);

  return (
    <PanelShell>
      <PanelHeader
        title="Pointer"
        description="Configure mouse and trackpad behaviour separately."
        separator={false}
      />

      <DeviceSection prefix="mouse" title="Mouse" focusKey={focusKey} />
      <DeviceSection prefix="trackpad" title="Trackpad" focusKey={focusKey} trackpad />

      <div className="mb-5">
        <SectionCard title="Axis">
          <div ref={fieldRef("axis_scroll_factor")}>
            <SliderRow
              label="Axis Scroll Factor"
              description="Multiplier for scroll wheel speed."
              value={scrollFactor}
              min={0.1}
              max={10}
              step={0.1}
              onChange={(value) => setValue("axis_scroll_factor", value.toFixed(1))}
            />
          </div>
          <div ref={fieldRef("axis_bind_apply_timeout")}>
            <SliderRow
              label="Axis Bind Apply Timeout"
              description="How long a scroll axis must be held before its binding fires."
              value={axisBindTimeout}
              min={0}
              max={1000}
              step={10}
              unit=" ms"
              onChange={(value) => setValue("axis_bind_apply_timeout", String(value))}
            />
          </div>
        </SectionCard>
      </div>
    </PanelShell>
  );
}
