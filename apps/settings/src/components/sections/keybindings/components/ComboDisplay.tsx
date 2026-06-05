import { BindingType, MOUSE_BUTTON_LABELS } from "@/lib/keybind-types";
import { xkbToDisplay } from "@/lib/keyboard";
import { parseModifiers } from "@/lib/keybind-parse";
import { KeyBadge } from "./KeyBadge";

interface ComboDisplayProps {
  type: BindingType;
  mods: string;
  /** For keyboard: XKB key name. For mouse: button. For axis: direction. For switch: fold state. For gesture: motion. */
  triggerLabel?: string;
  /** For gesture: the finger count */
  fingers?: string;
}

export function ComboDisplay({ type, mods, triggerLabel, fingers }: ComboDisplayProps) {
  if (!triggerLabel) {
    return <span className="text-xs text-muted-foreground/50 italic">Unbound</span>;
  }

  const parts: string[] = [];
  const parsed = parseModifiers(mods);
  if (parsed.includes("super")) parts.push("Super");
  if (parsed.includes("ctrl")) parts.push("Ctrl");
  if (parsed.includes("alt")) parts.push("Alt");
  if (parsed.includes("shift")) parts.push("Shift");
  if (parsed.includes("hyper")) parts.push("Hyper");

  // Type-specific trigger label
  let triggerDisplay: string;
  switch (type) {
    case "keyboard":
      triggerDisplay = xkbToDisplay(triggerLabel);
      break;
    case "mouse": {
      const isRaw = /^code:\d+$/.test(triggerLabel);
      triggerDisplay = isRaw ? triggerLabel : (MOUSE_BUTTON_LABELS[triggerLabel] ?? triggerLabel);
      break;
    }
    case "axis":
      triggerDisplay = `Scroll ${triggerLabel.charAt(0).toUpperCase() + triggerLabel.slice(1)}`;
      break;
    case "switch":
      triggerDisplay = triggerLabel === "fold" ? "Lid Closed" : "Lid Open";
      break;
    case "gesture": {
      const fingerText = fingers && fingers !== "1" ? `${fingers}-finger ` : "";
      triggerDisplay = `${fingerText}Swipe ${triggerLabel.charAt(0).toUpperCase() + triggerLabel.slice(1)}`;
      break;
    }
    default:
      triggerDisplay = triggerLabel;
  }
  parts.push(triggerDisplay);

  return (
    <span className="inline-flex items-center gap-1">
      {parts.map((p, i) => (
        <span key={i} className="inline-flex items-center gap-1">
          <KeyBadge label={p} />
          {i < parts.length - 1 && (
            <span className="text-[10px] text-muted-foreground/40 font-mono">+</span>
          )}
        </span>
      ))}
    </span>
  );
}
