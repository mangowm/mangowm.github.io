import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Row, FieldLabel } from "@/components/sections/section-ui";
import { cn } from "@/lib/utils";
import { parseCurve } from "@/lib/curve";

export interface CurveInputRowProps {
  label: string;
  description: string;
  value: string;
  placeholder?: string;
  enabled?: boolean;
  onChange: (v: string) => void;
}

/**
 * Free-text row for a cubic-bezier curve (x1,y1,x2,y2). Keeps a local draft
 * while typing so partial input isn't lost, but only writes values mango's
 * parser accepts (exactly 4 non-negative numbers). Invalid drafts render in
 * red with an inline error and never reach the config.
 */
export function CurveInputRow({
  label,
  description,
  value,
  placeholder,
  enabled,
  onChange,
}: CurveInputRowProps) {
  const [draft, setDraft] = useState(value);
  const isOff = enabled === false;

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const invalid = draft.trim() !== "" && parseCurve(draft) === null;

  return (
    <Row className={isOff ? "pointer-events-none opacity-40" : ""}>
      <FieldLabel label={label} description={description} />
      <div className="flex flex-col items-end gap-1">
        <Input
          type="text"
          value={draft}
          onChange={(e) => {
            const v = e.target.value;
            setDraft(v);
            if (parseCurve(v) !== null) onChange(v);
          }}
          placeholder={placeholder}
          spellCheck={false}
          disabled={isOff}
          aria-label={label}
          className={cn(
            "w-44 shrink-0 font-mono text-[12px]",
            invalid && "border-red-500/60 focus-visible:ring-red-500/30",
          )}
        />
        {invalid && (
          <span className="w-44 text-[10px] leading-tight text-red-500/80">
            Must be 4 comma-separated non-negative numbers (x1,y1,x2,y2)
          </span>
        )}
      </div>
    </Row>
  );
}
