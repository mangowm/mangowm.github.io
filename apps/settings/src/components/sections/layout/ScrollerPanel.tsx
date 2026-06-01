import { useState, useRef } from "react";
import { useConfigStore } from "@/lib/config-store";
import { cfgBool, cfgInt, cfgFloat, cfgStr } from "@/lib/config-helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import type { PanelProps } from "@/lib/section-types";
import { useFocusField } from "@/lib/use-focus-field";
import {
  PanelShell,
  PanelHeader,
  SectionCard,
  ToggleRow,
  SliderRow,
} from "@/components/sections/section-ui";

function PresetInput({
  values,
  onChange,
}: {
  values: number[];
  onChange: (values: number[]) => void;
}) {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addValue = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const n = parseFloat(trimmed);
    if (!isNaN(n) && n >= 0.1 && n <= 1.0) {
      onChange([...values, Math.round(n * 100) / 100]);
      setText("");
    }
    inputRef.current?.focus();
  };

  const removeValue = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  return (
    <div className="px-4 py-3">
      <div className="mb-2 flex flex-wrap gap-1.5">
        {values.length === 0 && (
          <span className="text-[11px] text-muted-foreground/40 italic">No presets defined</span>
        )}
        {values.map((v, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-0.5 font-mono text-[12px] text-foreground/80"
          >
            {v.toFixed(2)}
            <button
              type="button"
              onClick={() => removeValue(i)}
              className="inline-flex size-3.5 items-center justify-center rounded-sm text-muted-foreground/50 transition-colors hover:text-destructive hover:bg-destructive/10"
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addValue();
            }
          }}
          placeholder="0.50"
          className="h-7 w-24 font-mono text-[12px]"
        />
        <Button
          type="button"
          size="xs"
          variant="secondary"
          onClick={addValue}
          disabled={!text.trim() || isNaN(parseFloat(text.trim()))}
        >
          Add
        </Button>
      </div>
    </div>
  );
}

export function ScrollerPanel({ focusKey }: PanelProps) {
  const fieldRef = useFocusField(focusKey);
  const data = useConfigStore((s) => s.data);
  const setValue = useConfigStore((s) => s.setValue);

  const tb = (key: string) => (v: boolean) => setValue(key, v ? "1" : "0");

  const defaultProportion = cfgFloat(data, "scroller_default_proportion", 0.9, 0.1, 1.0);
  const defaultSingle = cfgFloat(data, "scroller_default_proportion_single", 1.0, 0.1, 1.0);
  const ignoreSingle = cfgBool(data, "scroller_ignore_proportion_single", true);
  const focusCenter = cfgBool(data, "scroller_focus_center");
  const preferCenter = cfgBool(data, "scroller_prefer_center");
  const preferOverspread = cfgBool(data, "scroller_prefer_overspread", true);
  const pointerFocus = cfgBool(data, "edge_scroller_pointer_focus", true);
  const allowSpeed = cfgFloat(data, "edge_scroller_focus_allow_speed", 0.0, 0.0, 1000.0);
  const structs = cfgInt(data, "scroller_structs", 20, 0, 1000);

  // Parse proportion preset
  const presetRaw = cfgStr(data, "scroller_proportion_preset", "");
  const presetValues = presetRaw
    ? presetRaw.split(",").map((s) => {
        const n = parseFloat(s.trim());
        return isNaN(n) ? 0 : n;
      })
    : [];

  const handlePresetChange = (values: number[]) => {
    setValue("scroller_proportion_preset", values.join(","));
  };

  return (
    <PanelShell>
      <PanelHeader
        title="Scroller"
        description="Configure the scroller tiling layout: window proportions, focus behavior, edge scrolling, and preset values."
        separator={false}
      />

      <div className="mb-5">
        <SectionCard title="Proportions">
          <div ref={fieldRef("scroller_default_proportion")}>
            <SliderRow
              label="Default Proportion"
              description="Default proportion of the container occupied by each tiled window."
              value={defaultProportion}
              min={0.1}
              max={1.0}
              step={0.05}
              onChange={(v) => setValue("scroller_default_proportion", v.toFixed(2))}
            />
          </div>
          <div ref={fieldRef("scroller_default_proportion_single")}>
            <SliderRow
              label="Single Window Proportion"
              description="Proportion when there is only one window on the tag."
              value={defaultSingle}
              min={0.1}
              max={1.0}
              step={0.05}
              onChange={(v) => setValue("scroller_default_proportion_single", v.toFixed(2))}
            />
          </div>
          <div ref={fieldRef("scroller_ignore_proportion_single")}>
            <ToggleRow
              label="Ignore Proportion When Solo"
              description="Ignore the proportion setting when only one window is visible."
              value={ignoreSingle}
              onChange={tb("scroller_ignore_proportion_single")}
            />
          </div>
        </SectionCard>
      </div>

      <div className="mb-5">
        <SectionCard title="Focus">
          <div ref={fieldRef("scroller_focus_center")}>
            <ToggleRow
              label="Focus Center"
              description="Focus the window at the center of the viewport when scrolling."
              value={focusCenter}
              onChange={tb("scroller_focus_center")}
            />
          </div>
          <div ref={fieldRef("scroller_prefer_center")}>
            <ToggleRow
              label="Prefer Center"
              description="Prefer to keep the focused window centered in the viewport."
              value={preferCenter}
              onChange={tb("scroller_prefer_center")}
            />
          </div>
          <div ref={fieldRef("scroller_prefer_overspread")}>
            <ToggleRow
              label="Prefer Overspread"
              description="Prefer to overspread windows across the available space."
              value={preferOverspread}
              onChange={tb("scroller_prefer_overspread")}
            />
          </div>
        </SectionCard>
      </div>

      <div className="mb-5">
        <SectionCard title="Edge Scrolling">
          <div ref={fieldRef("edge_scroller_pointer_focus")}>
            <ToggleRow
              label="Pointer Focus at Edge"
              description="Automatically focus the adjacent window when the pointer reaches the screen edge."
              value={pointerFocus}
              onChange={tb("edge_scroller_pointer_focus")}
            />
          </div>
          <div ref={fieldRef("edge_scroller_focus_allow_speed")}>
            <SliderRow
              label="Focus Allow Speed"
              description="Maximum pointer speed for edge-triggered focus changes (0 = always allowed)."
              value={allowSpeed}
              min={0}
              max={1000}
              step={1}
              onChange={(v) => setValue("edge_scroller_focus_allow_speed", String(v))}
            />
          </div>
        </SectionCard>
      </div>

      <div className="mb-5">
        <SectionCard title="Structs">
          <div ref={fieldRef("scroller_structs")}>
            <SliderRow
              label="Scroller Structs"
              description="Number of structural positions available in the scroller."
              value={structs}
              min={0}
              max={100}
              step={1}
              onChange={(v) => setValue("scroller_structs", String(Math.round(v)))}
            />
          </div>
        </SectionCard>
      </div>

      <div className="mb-5">
        <SectionCard title="Proportion Presets">
          <PresetInput values={presetValues} onChange={handlePresetChange} />
        </SectionCard>
      </div>
    </PanelShell>
  );
}
