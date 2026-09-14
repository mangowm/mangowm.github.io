import { Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getOverrideMeta, RULE_MATCHER_LABELS } from "@/lib/rules/metadata";
import type { RuleType, ParsedRule } from "@/lib/rules/parser";

interface RuleCardProps {
  rule: ParsedRule;
  ruleType: RuleType;
  index: number;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}

function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.slice(0, max - 1) + "…";
}

export function RuleCard({ rule, ruleType, index, onEdit, onDelete }: RuleCardProps) {
  const overrideEntries = Object.entries(rule.overrides);
  const matcherEntries = Object.entries(rule.matchers).filter(([, v]) => v?.trim());

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border border-border/50 bg-card text-card-foreground shadow-sm transition-all duration-200",
        "hover:border-border/80 hover:shadow-md",
      )}
    >
      {/* Action Bar - Hidden until hover for a cleaner default state */}
      <div className="absolute right-2 top-2 z-10 flex items-center gap-0.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <button
          onClick={() => onEdit(index)}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
          aria-label="Edit rule"
        >
          <Pencil className="size-3.5" />
        </button>
        <button
          onClick={() => onDelete(index)}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/15 hover:text-destructive transition-colors"
          aria-label="Delete rule"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>

      {/* Matchers Header Section */}
      <div className="border-b border-border/40 bg-muted/20 px-4 py-3">
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
          Match Criteria
        </div>
        <div className="flex min-w-0 flex-wrap items-center gap-2 pr-16">
          {matcherEntries.length > 0 ? (
            matcherEntries.map(([key, val]) => (
              <span
                key={key}
                className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
              >
                <span className="font-semibold opacity-70">{RULE_MATCHER_LABELS[key] ?? key}:</span>
                <span className="max-w-[160px] truncate font-mono text-[11px]">
                  {truncate(val, 30)}
                </span>
              </span>
            ))
          ) : (
            <span className="rounded-md border border-border/40 bg-background/50 px-2 py-1 text-[11px] italic text-muted-foreground/60 shadow-sm">
              Global (Applies to all)
            </span>
          )}
        </div>
      </div>

      {/* Overrides Body Section */}
      <div className="px-4 py-3">
        <div className="mb-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
          Applied Properties
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {overrideEntries.length > 0 ? (
            overrideEntries.map(([key, val]) => (
              <OverridePill key={key} keyName={key} value={val} ruleType={ruleType} />
            ))
          ) : (
            <span className="text-[11px] italic text-muted-foreground/50">
              No overrides configured
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function OverridePill({
  keyName,
  value,
  ruleType,
}: {
  keyName: string;
  value: string;
  ruleType: RuleType;
}) {
  const meta = getOverrideMeta(keyName, ruleType);
  const label = meta?.label ?? keyName;
  const displayValue = meta ? formatValue(meta.type, value) : truncate(value, 15);
  const isBool = meta?.type === "boolean";

  // Semantic coloring matching your OKLCH variables
  const valueStyle = isBool
    ? value === "1"
      ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
      : value === "0"
        ? "text-red-600 dark:text-red-400 bg-red-500/10"
        : "text-muted-foreground bg-muted/50"
    : "text-foreground bg-background";

  return (
    <div className="inline-flex items-center overflow-hidden rounded-md border border-border/60 text-xs shadow-sm transition-colors hover:border-border/80">
      <span className="border-r border-border/60 bg-muted/40 px-2.5 py-1.5 font-medium text-muted-foreground">
        {label}
      </span>
      <span className={cn("px-2.5 py-1.5 font-mono font-medium", valueStyle)}>{displayValue}</span>
    </div>
  );
}

function formatValue(type: string, value: string): string {
  if (type === "boolean") {
    if (value === "1") return "Enabled";
    if (value === "0") return "Disabled";
    return "Default";
  }
  if (type === "float") {
    const n = parseFloat(value);
    return isNaN(n) ? value : n % 1 === 0 ? String(n) : n.toFixed(2);
  }
  return truncate(value, 15);
}
