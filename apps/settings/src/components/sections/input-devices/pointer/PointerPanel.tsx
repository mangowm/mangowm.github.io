import {
  useConfigBool,
  useConfigStr,
  useConfigStore,
  useGlobalFloat,
  useGlobalInt,
} from "@/lib/config/store";
import { globalMax, globalMin, globalOptions } from "@/lib/config/schema-meta";
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
  const accelSpeed = useGlobalFloat(`${prefix}_accel_speed`);
  const scrollMethod = useConfigStr(`${prefix}_scroll_method`);
  const scrollButton = useConfigStr(`${prefix}_scroll_button`);
  const clickMethod = useConfigStr(`${prefix}_click_method`);
  const sendEvents = useConfigStr(`${prefix}_send_events_mode`);
  const accelProfileOptions = globalOptions(`${prefix}_accel_profile`) ?? [];
  const scrollMethodOptions = globalOptions(`${prefix}_scroll_method`) ?? [];
  const scrollButtonOptions = globalOptions(`${prefix}_scroll_button`) ?? [];
  const clickMethodOptions = globalOptions(`${prefix}_click_method`) ?? [];
  const sendEventsOptions = globalOptions(`${prefix}_send_events_mode`) ?? [];
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
            options={accelProfileOptions}
            onChange={(value) => setValue(`${prefix}_accel_profile`, value)}
          />
        </div>

        <div ref={fieldRef(`${prefix}_accel_speed`)}>
          <SliderRow
            label="Acceleration Speed"
            description="Negative slows down, positive speeds up."
            value={accelSpeed}
            min={globalMin(`${prefix}_accel_speed`) ?? -1}
            max={globalMax(`${prefix}_accel_speed`) ?? 1}
            step={0.01}
            onChange={(value) => setValue(`${prefix}_accel_speed`, value.toFixed(2))}
          />
        </div>

        <div ref={fieldRef(`${prefix}_scroll_method`)}>
          <SelectRow
            label="Scroll Method"
            description="Two-finger, edge scrolling, or on-button-down."
            value={scrollMethod}
            options={scrollMethodOptions}
            onChange={(value) => setValue(`${prefix}_scroll_method`, value)}
          />
        </div>

        <div ref={fieldRef(`${prefix}_scroll_button`)}>
          <SelectRow
            label="Scroll Button"
            description="Button used for on-button-down scrolling."
            value={scrollButton}
            options={scrollButtonOptions}
            onChange={(value) => setValue(`${prefix}_scroll_button`, value)}
          />
        </div>

        <div ref={fieldRef(`${prefix}_click_method`)}>
          <SelectRow
            label="Click Method"
            description="How clicks are detected."
            value={clickMethod}
            options={clickMethodOptions}
            onChange={(value) => setValue(`${prefix}_click_method`, value)}
          />
        </div>

        <div ref={fieldRef(`${prefix}_send_events_mode`)}>
          <SelectRow
            label="Send Events Mode"
            description="When pointer events are sent to the compositor."
            value={sendEvents}
            options={sendEventsOptions}
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

  const scrollFactor = useGlobalFloat("axis_scroll_factor");
  const axisBindTimeout = useGlobalInt("axis_bind_apply_timeout");

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
              min={globalMin("axis_scroll_factor") ?? 0.1}
              max={globalMax("axis_scroll_factor") ?? 10}
              step={0.1}
              onChange={(value) => setValue("axis_scroll_factor", value.toFixed(1))}
            />
          </div>
          <div ref={fieldRef("axis_bind_apply_timeout")}>
            <SliderRow
              label="Axis Bind Apply Timeout"
              description="How long a scroll axis must be held before its binding fires."
              value={axisBindTimeout}
              min={globalMin("axis_bind_apply_timeout") ?? 0}
              max={globalMax("axis_bind_apply_timeout") ?? 1000}
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
