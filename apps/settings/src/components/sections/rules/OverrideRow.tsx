import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Row, FieldLabel } from "@/components/sections/section-ui";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { getOverrideMeta } from "@/lib/rules/metadata";
import type { OverrideMeta, RuleType } from "@/lib/rules/types";

interface OverrideRowProps {
  propertyKey: string;
  value: string;
  ruleType: RuleType;
  onChange: (value: string) => void;
  onRemove: () => void;
}

export function OverrideRow({
  propertyKey,
  value,
  ruleType,
  onChange,
  onRemove,
}: OverrideRowProps) {
  const meta = getOverrideMeta(propertyKey, ruleType);

  return (
    <Row className="pr-2">
      <FieldLabel
        label={meta?.label ?? propertyKey}
        description={meta?.description ?? "Unknown property"}
      />
      
      <div className="flex items-center gap-2">
        {meta ? (
          <OverrideInput meta={meta} value={value} ruleType={ruleType} onChange={onChange} />
        ) : (
          <Input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-48 shrink-0 bg-background/50 font-mono text-[12px] shadow-sm transition-colors hover:border-border/80 focus-visible:bg-background"
            spellCheck={false}
            aria-label={propertyKey}
          />
        )}
        
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onRemove}
          className="size-8 shrink-0 rounded-full text-muted-foreground/40 opacity-0 transition-all duration-200 hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100 focus-visible:opacity-100"
          aria-label="Remove override"
          title="Remove override"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </Row>
  );
}

function OverrideInput({
  meta,
  value,
  ruleType,
  onChange,
}: {
  meta: OverrideMeta;
  value: string;
  ruleType: RuleType;
  onChange: (v: string) => void;
}) {
  switch (meta.type) {
    case "boolean": {
      const isInheritMode = ruleType === "windowrule";

      const opts = isInheritMode
        ? ([
            { value: "-1", label: "Default" },
            { value: "0", label: "Off" },
            { value: "1", label: "On" },
          ] as const)
        : ([
            { value: "0", label: "Off" },
            { value: "1", label: "On" },
          ] as const);

      const current = opts.find((o) => o.value === value) ?? opts[isInheritMode ? 0 : 0];

      return (
        <div className="flex shrink-0 overflow-hidden rounded-lg border border-border/40 bg-muted/30 p-1 shadow-inner">
          {opts.map((opt) => {
            const isActive = opt.value === current.value;
            
            const activeStyle = 
              opt.value === "1" ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/20 dark:text-emerald-400" :
              opt.value === "0" ? "bg-red-500/15 text-red-600 border-red-500/20 dark:text-red-400" :
              "bg-background text-foreground border-border/50 shadow-sm";

            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange(opt.value)}
                className={cn(
                  "cursor-pointer rounded-md border border-transparent px-3 py-1 text-[11px] font-semibold tracking-wide transition-all duration-200",
                  isActive 
                    ? activeStyle 
                    : "text-muted-foreground/60 hover:text-foreground/80 hover:bg-muted/50"
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      );
    }

    case "float": {
      const min = meta.range?.[0] ?? 0;
      const max = meta.range?.[1] ?? 1;
      const step = meta.step ?? 0.01;
      const numVal = parseFloat(value);
      const display = isNaN(numVal) ? min : numVal;
      
      return (
        <div className="flex w-48 shrink-0 items-center gap-3">
          <Slider
            value={[display]}
            min={min}
            max={max}
            step={step}
            onValueChange={(v) => onChange(String((Array.isArray(v) ? v : [v])[0]))}
            className="flex-1 cursor-grab active:cursor-grabbing"
            aria-label={meta.label}
          />
          <div className="flex min-w-[3.5rem] items-center justify-center rounded-md border border-border/50 bg-background/50 px-2 py-1 text-center font-mono text-[11px] font-medium text-foreground shadow-sm">
            {display.toFixed(2)}
            <span className="ml-0.5 text-[9px] text-muted-foreground/60">{meta.unit ?? ""}</span>
          </div>
        </div>
      );
    }

    case "integer": {
      const numVal = parseInt(value, 10);
      const display = isNaN(numVal) ? 0 : numVal;
      const min = meta.range?.[0] ?? 0;
      const max = meta.range?.[1] ?? 100;
      
      return (
        <div className="flex w-48 shrink-0 items-center gap-3">
          <Slider
            value={[display]}
            min={min}
            max={max}
            step={1}
            onValueChange={(v) =>
              onChange(String(Math.round((Array.isArray(v) ? v : [v])[0])))
            }
            className="flex-1 cursor-grab active:cursor-grabbing"
            aria-label={meta.label}
          />
          <div className="flex min-w-[3.5rem] items-center justify-center rounded-md border border-border/50 bg-background/50 px-2 py-1 text-center font-mono text-[11px] font-medium text-foreground shadow-sm">
            {display}
            <span className="ml-0.5 text-[9px] text-muted-foreground/60">{meta.unit ?? ""}</span>
          </div>
        </div>
      );
    }

    case "select": {
      const currentValue = meta.options?.find((o) => o.value === value)
        ? value
        : (meta.options?.[0]?.value ?? value);

      return (
        <Select value={currentValue} onValueChange={(v) => v && onChange(v)}>
          <SelectTrigger className="w-36 h-8 text-[12px] bg-background/50 font-medium shadow-sm transition-colors hover:border-border/80 focus:ring-1 focus:ring-primary/30" aria-label={meta.label}>
            <SelectValue>
              {(val) => meta.options?.find((o) => o.value === val)?.label ?? String(val)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="rounded-xl shadow-lg">
            {meta.options?.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="text-[12px] font-medium">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    case "string":
    default: {
      const hasError = meta.pattern && value && !new RegExp(meta.pattern).test(value);

      return (
        <div className="flex flex-col gap-1">
          <Input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={cn(
              "w-48 h-8 shrink-0 bg-background/50 font-mono text-[12px] shadow-sm transition-colors hover:border-border/80 focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-primary/30",
              hasError && "border-red-500/60 focus-visible:ring-red-500/30"
            )}
            spellCheck={false}
            placeholder={meta.description}
            aria-label={meta.label}
          />
          {hasError && meta.patternError && (
            <span className="w-48 text-[10px] leading-tight text-red-500/80">
              {meta.patternError}
            </span>
          )}
        </div>
      );
    }
  }
}
