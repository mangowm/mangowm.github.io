import { useState, useCallback } from "react";
import { Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OverrideRow } from "./OverrideRow";
import { OverridePalette } from "./OverridePalette";
import {
  RULE_MATCHERS,
  RULE_MATCHER_LABELS,
  RULE_MATCHER_OPTIONS,
  RULE_MATCHER_PLACEHOLDERS,
} from "@/lib/rules/metadata";
import { setOverride, removeOverride, setMatcher } from "@/lib/rules/parser";
import type { RuleType, ParsedRule } from "@/lib/rules/parser";
import type { OverrideMeta } from "@/lib/rules/types";

interface RuleEditorProps {
  ruleType: RuleType;
  initialRule: ParsedRule;
  onSave: (rule: ParsedRule) => void;
  onCancel: () => void;
  index: number;
}

export function RuleEditor({ ruleType, initialRule, onSave, onCancel, index }: RuleEditorProps) {
  const [draft, setDraft] = useState<ParsedRule>(() => ({
    ...initialRule,
    matchers: { ...initialRule.matchers },
    overrides: { ...initialRule.overrides },
  }));

  const [paletteOpen, setPaletteOpen] = useState(false);
  const matcherKeys = RULE_MATCHERS[ruleType];
  const overrideKeys = Object.keys(draft.overrides);

  const handleMatcherChange = useCallback((key: string, value: string) => {
    setDraft((prev) => setMatcher(prev, key, value));
  }, []);

  const handleOverrideChange = useCallback((key: string, value: string) => {
    setDraft((prev) => setOverride(prev, key, value));
  }, []);

  const handleRemoveOverride = useCallback((key: string) => {
    setDraft((prev) => removeOverride(prev, key));
  }, []);

  const handleAddOverride = useCallback((meta: OverrideMeta) => {
    setDraft((prev) => setOverride(prev, meta.key, getDefaultValue(meta)));
    setPaletteOpen(false); // Close palette on select for flow
  }, []);

  const hasMatchers = matcherKeys.some((k) => draft.matchers[k]?.trim());

  return (
    <div className="relative flex flex-col overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm transition-all">
      {/* Editor Top Bar */}
      <div className="flex items-center justify-between border-b border-border/40 bg-muted/10 px-5 py-3">
        <div className="flex items-center gap-3">
          <h4 className="text-sm font-semibold text-foreground">Configuring Rule #{index + 1}</h4>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive h-8 px-3"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={() => onSave(draft)}
            disabled={!hasMatchers}
            className="h-8 px-4 shadow-sm"
          >
            <Check className="mr-1.5 size-3.5" />
            Save Rule
          </Button>
        </div>
      </div>

      {/* Form Content - No internal borders! */}
      <div className="flex flex-col">
        {/* Matchers Block - Subtle tinted background */}
        <div className="bg-muted/10 px-5 py-4">
          <div className="flex flex-col gap-1">
            {matcherKeys.map((key) => {
              const options = RULE_MATCHER_OPTIONS[key];
              return (
                <MatcherInput
                  key={key}
                  label={RULE_MATCHER_LABELS[key] ?? key}
                  placeholder={RULE_MATCHER_PLACEHOLDERS[key] ?? key}
                  value={draft.matchers[key] ?? ""}
                  options={options}
                  onChange={(v) => handleMatcherChange(key, v)}
                />
              );
            })}
          </div>
        </div>

        {/* Overrides Block - Plain background */}
        <div className="px-5 py-4">
          <div className="flex flex-col gap-1">
            {overrideKeys.length === 0 ? (
              <div className="py-4 text-sm italic text-muted-foreground/50">
                No properties selected to override.
              </div>
            ) : (
              overrideKeys.map((key) => (
                <OverrideRow
                  key={key}
                  propertyKey={key}
                  value={draft.overrides[key]}
                  ruleType={ruleType}
                  onChange={(v) => handleOverrideChange(key, v)}
                  onRemove={() => handleRemoveOverride(key)}
                />
              ))
            )}
          </div>

          <div className="flex justify-center border-t border-border/30 mt-3 pt-3">
            {paletteOpen ? (
              <div className="w-full">
                <OverridePalette
                  ruleType={ruleType}
                  usedKeys={new Set(overrideKeys)}
                  onSelect={handleAddOverride}
                  onClose={() => setPaletteOpen(false)}
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setPaletteOpen(true)}
                className="flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground/50 transition-colors hover:text-primary"
              >
                <Plus className="size-3.5" />
                Add Override
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MatcherInput({
  label,
  placeholder,
  value,
  options,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  options?: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  if (options) {
    const currentValue = options.find((o) => o.value === value) ? value : (options[0]?.value ?? "");

    return (
      <div className="group flex items-center justify-between gap-3 rounded-md px-2 py-1.5 transition-colors hover:bg-muted/30">
        <span className="text-[13px] font-medium text-foreground">{label}</span>
        <Select value={currentValue} onValueChange={(v) => v !== null && onChange(v)}>
          <SelectTrigger
            className="w-64 h-9 text-[12px] bg-background/50 font-medium shadow-sm transition-colors hover:border-border/80 focus:ring-1 focus:ring-primary/30"
            aria-label={label}
          >
            <SelectValue>
              {options.find((o) => o.value === currentValue)?.label ?? currentValue}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="rounded-xl shadow-lg">
            {options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="text-[12px] font-medium">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <div className="group flex items-center justify-between gap-3 rounded-md px-2 py-1.5 transition-colors hover:bg-muted/30">
      <span className="text-[13px] font-medium text-foreground">{label}</span>
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        spellCheck={false}
        className="w-64 bg-background/50 font-mono text-[12px] shadow-sm transition-colors focus-visible:bg-background"
      />
    </div>
  );
}

function getDefaultValue(meta: OverrideMeta): string {
  switch (meta.type) {
    case "boolean":
      return "1";
    case "float":
    case "integer": {
      if (!meta.range) return "0";
      if (meta.key === "scale") return "1.0";
      if (meta.range[0] <= 0 && meta.range[1] >= 0) return "0";
      return String(meta.range[0]);
    }
    case "select":
      return meta.options?.[0]?.value ?? "";
    case "string":
    default:
      return "";
  }
}
