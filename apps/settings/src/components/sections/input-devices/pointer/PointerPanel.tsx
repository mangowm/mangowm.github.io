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
            configKey={`${prefix}_natural_scrolling`}
            value={naturalScrolling}
            onChange={toggle(`${prefix}_natural_scrolling`)}
          />
        </div>

        <div ref={fieldRef(`${prefix}_accel_profile`)}>
          <SelectRow
            configKey={`${prefix}_accel_profile`}
            value={accelProfile}
            options={accelProfileOptions}
            onChange={(value) => setValue(`${prefix}_accel_profile`, value)}
          />
        </div>

        <div ref={fieldRef(`${prefix}_accel_speed`)}>
          <SliderRow
            configKey={`${prefix}_accel_speed`}
            value={accelSpeed}
            min={globalMin(`${prefix}_accel_speed`) ?? -1}
            max={globalMax(`${prefix}_accel_speed`) ?? 1}
            step={0.01}
            onChange={(value) => setValue(`${prefix}_accel_speed`, value.toFixed(2))}
          />
        </div>

        <div ref={fieldRef(`${prefix}_scroll_method`)}>
          <SelectRow
            configKey={`${prefix}_scroll_method`}
            value={scrollMethod}
            options={scrollMethodOptions}
            onChange={(value) => setValue(`${prefix}_scroll_method`, value)}
          />
        </div>

        <div ref={fieldRef(`${prefix}_scroll_button`)}>
          <SelectRow
            configKey={`${prefix}_scroll_button`}
            value={scrollButton}
            options={scrollButtonOptions}
            onChange={(value) => setValue(`${prefix}_scroll_button`, value)}
          />
        </div>

        <div ref={fieldRef(`${prefix}_click_method`)}>
          <SelectRow
            configKey={`${prefix}_click_method`}
            value={clickMethod}
            options={clickMethodOptions}
            onChange={(value) => setValue(`${prefix}_click_method`, value)}
          />
        </div>

        <div ref={fieldRef(`${prefix}_send_events_mode`)}>
          <SelectRow
            configKey={`${prefix}_send_events_mode`}
            value={sendEvents}
            options={sendEventsOptions}
            onChange={(value) => setValue(`${prefix}_send_events_mode`, value)}
          />
        </div>

        <div ref={fieldRef(`${prefix}_left_handed`)}>
          <ToggleRow
            configKey={`${prefix}_left_handed`}
            value={leftHanded}
            onChange={toggle(`${prefix}_left_handed`)}
          />
        </div>

        <div ref={fieldRef(`${prefix}_middle_button_emulation`)}>
          <ToggleRow
            configKey={`${prefix}_middle_button_emulation`}
            value={middleButton}
            onChange={toggle(`${prefix}_middle_button_emulation`)}
          />
        </div>

        {trackpad && (
          <div ref={fieldRef("trackpad_disable_while_typing")}>
            <ToggleRow
              configKey="trackpad_disable_while_typing"
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
              configKey="axis_scroll_factor"
              value={scrollFactor}
              min={globalMin("axis_scroll_factor") ?? 0.1}
              max={globalMax("axis_scroll_factor") ?? 10}
              step={0.1}
              onChange={(value) => setValue("axis_scroll_factor", value.toFixed(1))}
            />
          </div>
          <div ref={fieldRef("axis_bind_apply_timeout")}>
            <SliderRow
              configKey="axis_bind_apply_timeout"
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
