import { xkbToDisplay } from "@/lib/keyboard";
import { parseModifiers } from "@/lib/keybind-parse";
import { KeyBadge } from "./KeyBadge";

interface ComboDisplayProps {
  mods: string;
  xkbKey: string;
}

export function ComboDisplay({ mods, xkbKey }: ComboDisplayProps) {
  if (!xkbKey) {
    return <span className="text-xs text-muted-foreground/50 italic">Unbound</span>;
  }
  const parsed = parseModifiers(mods);
  const parts: string[] = [];
  if (parsed.includes("super")) parts.push("Super");
  if (parsed.includes("ctrl")) parts.push("Ctrl");
  if (parsed.includes("alt")) parts.push("Alt");
  if (parsed.includes("shift")) parts.push("Shift");
  if (parsed.includes("hyper")) parts.push("Hyper");
  parts.push(xkbToDisplay(xkbKey));

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
