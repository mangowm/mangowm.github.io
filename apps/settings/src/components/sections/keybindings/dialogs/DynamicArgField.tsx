import { cn } from "@/lib/utils";
import type { DispatcherArg } from "@/lib/dispatchers";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DynamicArgFieldProps {
  arg: DispatcherArg;
  value: string;
  error: string | null;
  onChange: (v: string) => void;
}

export function DynamicArgField({ arg, value, error, onChange }: DynamicArgFieldProps) {
  const id = `arg-${arg.name}`;

  if (arg.type === "command") {
    return (
      <div className="group flex flex-col px-4 py-2.5 transition-colors hover:bg-accent/50 focus-within:bg-accent/50">
        <div className="flex items-start gap-2.5">
          <span className="mt-1.5 text-muted-foreground/25 font-mono text-sm select-none shrink-0">
            $
          </span>
          <div className="flex-1 min-w-0">
            <textarea
              id={id}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={arg.placeholder || `Enter ${arg.label}...`}
              className="w-full bg-transparent py-1 font-mono text-[13px] text-foreground outline-none resize-none min-h-[2.5rem] leading-relaxed placeholder:text-muted-foreground/40"
              spellCheck={false}
              rows={2}
            />
          </div>
          {error && (
            <span className="text-[11px] text-destructive font-medium shrink-0 mt-1.5">
              {error}
            </span>
          )}
        </div>
        {arg.description && (
          <div className="ml-7 mt-0.5">
            <span className="text-[11px] text-muted-foreground/60">{arg.description}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="group flex items-center justify-between gap-4 px-4 py-2.5 transition-colors hover:bg-accent/50 focus-within:bg-accent/50">
      <div className="flex flex-col min-w-0 pr-2">
        <Label
          htmlFor={id}
          className="text-[13px] font-medium text-foreground font-mono leading-snug"
        >
          {arg.label}
          {arg.required && <span className="text-destructive ml-0.5">*</span>}
        </Label>
        {arg.description && (
          <span className="text-[11px] text-muted-foreground/60 truncate mt-0.5">
            {arg.description}
          </span>
        )}
        {error && <span className="text-[11px] text-destructive font-medium mt-0.5">{error}</span>}
      </div>
      <div className="shrink-0">
        {arg.options ? (
          <Select value={value || ""} onValueChange={(v) => onChange(v || "")}>
            <SelectTrigger
              id={id}
              className="h-8 w-[140px] text-xs font-mono bg-background border-border/50"
            >
              <SelectValue placeholder={arg.placeholder || "Select"} />
            </SelectTrigger>
            <SelectContent>
              {arg.options.map((opt) => (
                <SelectItem key={opt} value={opt} className="text-xs font-mono">
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : arg.type === "float" ? (
          <div className="flex items-center gap-2.5 w-[180px]">
            <Slider
              value={[value ? Number(value) : 0]}
              min={arg.min ?? 0}
              max={arg.max ?? 1}
              step={arg.step ?? 0.01}
              onValueChange={(v) => onChange(String(Array.isArray(v) ? v[0] : v))}
              className="flex-1"
            />
            <Input
              id={id}
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={arg.placeholder}
              className={cn(
                "h-7 w-14 text-center text-xs font-mono bg-background border-border/50",
                error && "border-destructive/60",
              )}
            />
          </div>
        ) : (
          <Input
            id={id}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={arg.placeholder}
            className={cn(
              "h-8 w-[160px] text-xs font-mono bg-background border-border/50",
              error && "border-destructive/60",
            )}
          />
        )}
      </div>
    </div>
  );
}
