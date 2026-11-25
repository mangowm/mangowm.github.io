import { cn } from "cn";
import type { DispatcherArg } from "@/lib/dispatchers";
import { Label } from "@mangowm/ui/components/label";
import { Input } from "@mangowm/ui/components/input";
import { Slider } from "@mangowm/ui/components/slider";
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
      <div className="group relative flex flex-col gap-2 border-b border-border/20 bg-black/40 p-3 transition-colors last:border-0">
        <div className="flex items-center justify-between">
          <Label
            htmlFor={id}
            className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase"
          >
            <TerminalSquare className="size-3.5" />
            {arg.label}
            {arg.required && <span className="text-destructive">*</span>}
          </Label>
          {error && (
            <span className="flex items-center gap-1 rounded-sm bg-destructive/10 px-1.5 py-0.5 text-[10px] font-bold text-destructive">
              <AlertCircle className="size-3" />
              {error}
            </span>
          )}
        </div>

        <div
          className={cn(
            "relative flex items-start rounded-md border border-border/20 bg-background/50 transition-all focus-within:border-primary/50 focus-within:bg-background",
            error && "border-destructive/50 focus-within:border-destructive/70",
          )}
        >
          <div className="shrink-0 border-r border-border/10 px-3 py-2.5 font-mono text-xs text-muted-foreground/40 select-none">
            $
          </div>
          <textarea
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={arg.placeholder || `Enter ${arg.label.toLowerCase()}...`}
            className="min-h-[3rem] w-full resize-none bg-transparent px-3 py-2.5 font-mono text-[13px] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/30"
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
    <div className="grid grid-cols-[1fr_auto] items-center gap-6 border-b border-border/20 p-3 transition-colors last:border-0 hover:bg-muted/10">
      <div className="flex min-w-0 flex-col">
        <div className="flex items-center gap-2">
          <Label htmlFor={id} className="text-[13px] leading-snug font-semibold text-foreground">
            {arg.label}
            {arg.required && <span className="ml-0.5 text-destructive">*</span>}
          </Label>
          {error && (
            <span className="flex shrink-0 items-center gap-1 rounded-sm bg-destructive/10 px-1.5 py-0.5 text-[10px] font-bold text-destructive">
              <AlertCircle className="size-3" />
              {error}
            </span>
          )}
        </div>
        {arg.description && (
          <span className="mt-1 truncate text-[11px] text-muted-foreground/60">
            {arg.description}
          </span>
        )}
      </div>

      <div className="flex w-[180px] shrink-0 justify-end">
        {arg.options ? (
          <Select value={value || ""} onValueChange={(v) => onChange(v || "")}>
            <SelectTrigger
              id={id}
              className={cn(
                "h-8 w-full font-mono text-xs font-medium shadow-sm transition-all",
                error
                  ? "border-destructive/60 ring-1 ring-destructive/20"
                  : "border-border/50 bg-background hover:bg-accent/50",
              )}
            >
              <SelectValue placeholder={arg.placeholder || "Select..."} />
            </SelectTrigger>
            <SelectContent className="min-w-[180px]">
              {arg.options.map((opt) => (
                <SelectItem key={opt} value={opt} className="font-mono text-xs">
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : arg.type === "float" ? (
          <div className="flex w-full items-center gap-3">
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
                "h-8 w-14 text-center font-mono text-xs font-medium shadow-sm",
                error
                  ? "border-destructive/60 ring-1 ring-destructive/20"
                  : "border-border/50 bg-background",
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
              "h-8 w-full font-mono text-xs font-medium shadow-sm transition-colors",
              error
                ? "border-destructive/60 ring-1 ring-destructive/20 focus-visible:ring-destructive/30"
                : "border-border/50 bg-background focus-visible:border-primary/50",
            )}
          />
        )}
      </div>
    </div>
  );
}
