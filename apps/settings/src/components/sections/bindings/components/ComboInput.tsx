import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AlertCircle } from "lucide-react";
import {
  MOUSE_BUTTONS,
  MOUSE_BUTTON_LABELS,
  BINDING_DIRECTIONS,
  BINDING_FOLD_STATES,
  BINDING_MOTIONS,
  type BindingType,
} from "@/lib/keybind-types";
import { KeyRecorder, type PickerOption } from "../dialogs/KeyRecorder";

function requiresModifier(button: string): boolean {
  return button === "btn_left" || button === "btn_right";
}

interface ComboInputProps {
  type: BindingType;
  mods: string[];
  onModsChange: (mods: string[]) => void;
  trigger: string;
  onTriggerChange: (v: string) => void;
  fingers?: string;
  onFingersChange?: (v: string) => void;
}

export function ComboInput({
  type,
  mods,
  onModsChange,
  trigger,
  onTriggerChange,
  fingers = "3",
  onFingersChange,
}: ComboInputProps) {
  switch (type) {
    case "keyboard":
      return (
        <KeyRecorder
          mods={mods}
          capturedKey={trigger}
          onModsChange={onModsChange}
          onKeyChange={onTriggerChange}
        />
      );

    case "mouse": {
      const mouseOptions: PickerOption[] = MOUSE_BUTTONS.map((btn) => ({
        label: MOUSE_BUTTON_LABELS[btn] ?? btn,
        value: btn,
      }));

      return (
        <div className="flex flex-col gap-3">
          <KeyRecorder
            mods={mods}
            capturedKey={trigger}
            onModsChange={onModsChange}
            onKeyChange={onTriggerChange}
            pickerOptions={mouseOptions}
            pickerPlaceholder="Choose button..."
            allowRawCode
          />
          {requiresModifier(trigger) && mods.length === 0 && (
            <div className="flex items-center gap-1.5 text-destructive text-[11px] px-1">
              <AlertCircle className="size-3.5" />
              <span>Left and Right buttons require at least one modifier.</span>
            </div>
          )}
        </div>
      );
    }

    case "axis": {
      const axisOptions: PickerOption[] = BINDING_DIRECTIONS.map((d) => ({
        label: d.charAt(0).toUpperCase() + d.slice(1),
        value: d,
      }));

      return (
        <KeyRecorder
          mods={mods}
          capturedKey={trigger}
          onModsChange={onModsChange}
          onKeyChange={onTriggerChange}
          pickerOptions={axisOptions}
          pickerPlaceholder="Choose direction..."
        />
      );
    }

    case "switch": {
      const switchOptions: PickerOption[] = BINDING_FOLD_STATES.map((f) => ({
        label: f === "fold" ? "Closed" : "Open",
        value: f,
      }));

      return (
        <KeyRecorder
          mods={mods}
          capturedKey={trigger}
          onModsChange={onModsChange}
          onKeyChange={onTriggerChange}
          pickerOptions={switchOptions}
          pickerPlaceholder="Choose lid state..."
          showMods={false}
        />
      );
    }

    case "gesture": {
      const motionOptions: PickerOption[] = BINDING_MOTIONS.map((d) => ({
        label: d.charAt(0).toUpperCase() + d.slice(1),
        value: d,
      }));

      return (
        <div className="flex flex-col gap-3">
          <KeyRecorder
            mods={mods}
            capturedKey={trigger}
            onModsChange={onModsChange}
            onKeyChange={onTriggerChange}
            pickerOptions={motionOptions}
            pickerPlaceholder="Choose direction..."
          />
          <div className="flex items-center gap-3 px-1">
            <Label className="text-[13px] font-medium leading-none text-foreground shrink-0">
              Fingers
            </Label>
            <div className="flex items-center gap-1.5 bg-background border border-border/50 rounded-md pl-2 focus-within:ring-2 focus-within:ring-primary/20 shadow-sm">
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={fingers}
                onChange={(e) => onFingersChange?.(e.target.value)}
                placeholder="3"
                className="w-16 h-8 border-none bg-transparent shadow-none focus-visible:ring-0 font-mono text-xs px-1 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </div>
          </div>
        </div>
      );
    }

    default:
      return null;
  }
}
