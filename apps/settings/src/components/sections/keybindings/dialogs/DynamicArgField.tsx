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
import { TerminalSquare, AlertCircle } from "lucide-react";

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
      <div className="flex flex-col gap-2 p-3 bg-black/40 border-b border-border/20 last:border-0 relative group transition-colors">
        <div className="flex items-center justify-between">
          <Label
            htmlFor={id}
            className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider"
          >
            <TerminalSquare className="size-3.5" />
            {arg.label}
            {arg.required && <span className="text-destructive">*</span>}
          </Label>
          {error && (
            <span className="text-[10px] text-destructive font-bold flex items-center gap-1 bg-destructive/10 px-1.5 py-0.5 rounded-sm">
              <AlertCircle className="size-3" />
              {error}
            </span>
          )}
        </div>

        <div
          className={cn(
            "relative flex items-start rounded-md border border-border/20 bg-background/50 focus-within:border-primary/50 focus-within:bg-background transition-all",
            error && "border-destructive/50 focus-within:border-destructive/70",
          )}
        >
          <div className="px-3 py-2.5 text-muted-foreground/40 font-mono text-xs select-none shrink-0 border-r border-border/10">
            $
          </div>
          <textarea
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={arg.placeholder || `Enter ${arg.label.toLowerCase()}...`}
            className="w-full bg-transparent px-3 py-2.5 font-mono text-[13px] text-foreground outline-none resize-none min-h-[3rem] leading-relaxed placeholder:text-muted-foreground/30"
            spellCheck={false}
            rows={2}
          />
        </div>

        {arg.description && (
          <span className="text-[11px] text-muted-foreground/50">{arg.description}</span>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[1fr_auto] gap-6 items-center p-3 border-b border-border/20 last:border-0 hover:bg-muted/10 transition-colors">
      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-2">
          <Label htmlFor={id} className="text-[13px] font-semibold text-foreground leading-snug">
            {arg.label}
            {arg.required && <span className="text-destructive ml-0.5">*</span>}
          </Label>
          {error && (
            <span className="text-[10px] text-destructive font-bold flex items-center gap-1 bg-destructive/10 px-1.5 py-0.5 rounded-sm shrink-0">
              <AlertCircle className="size-3" />
              {error}
            </span>
          )}
        </div>
        {arg.description && (
          <span className="text-[11px] text-muted-foreground/60 truncate mt-1">
            {arg.description}
          </span>
        )}
      </div>

      <div className="shrink-0 w-[180px] flex justify-end">
        {arg.options ? (
          <Select value={value || ""} onValueChange={(v) => onChange(v || "")}>
            <SelectTrigger
              id={id}
              className={cn(
                "h-8 w-full text-xs font-mono font-medium shadow-sm transition-all",
                error
                  ? "border-destructive/60 ring-1 ring-destructive/20"
                  : "border-border/50 bg-background hover:bg-accent/50",
              )}
            >
              <SelectValue placeholder={arg.placeholder || "Select..."} />
            </SelectTrigger>
            <SelectContent className="min-w-[180px]">
              {arg.options.map((opt) => (
                <SelectItem key={opt} value={opt} className="text-xs font-mono">
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : arg.type === "float" ? (
          <div className="flex items-center gap-3 w-full">
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
                "h-8 w-14 text-center text-xs font-mono font-medium shadow-sm",
                error
                  ? "border-destructive/60 ring-1 ring-destructive/20"
                  : "bg-background border-border/50",
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
              "h-8 w-full text-xs font-mono font-medium shadow-sm transition-colors",
              error
                ? "border-destructive/60 ring-1 ring-destructive/20 focus-visible:ring-destructive/30"
                : "bg-background border-border/50 focus-visible:border-primary/50",
            )}
          />
        )}
      </div>
    </div>
  );
}
