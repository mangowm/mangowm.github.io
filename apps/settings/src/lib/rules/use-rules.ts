import { useCallback } from "react";
import { useConfigStore } from "@/lib/config-store";
import { parseRuleString, serializeRule } from "@/lib/rules/parser";
import type { RuleType, ParsedRule } from "@/lib/rules/types";

export type { RuleType, ParsedRule };

export function useRules(ruleType: RuleType) {
  const rawRules = useConfigStore((s) => s.data[ruleType]) ?? [];
  const addEntry = useConfigStore((s) => s.addEntry);
  const updateEntry = useConfigStore((s) => s.updateEntry);
  const removeEntry = useConfigStore((s) => s.removeEntry);

  const rules: ParsedRule[] = rawRules.map((raw) => parseRuleString(ruleType, raw));

  const addRule = useCallback(
    (rule: ParsedRule) => addEntry(ruleType, serializeRule(rule)),
    [addEntry, ruleType],
  );

  const updateRule = useCallback(
    (index: number, rule: ParsedRule) => updateEntry(ruleType, index, serializeRule(rule)),
    [updateEntry, ruleType],
  );

  const removeRule = useCallback(
    (index: number) => removeEntry(ruleType, index),
    [removeEntry, ruleType],
  );

  return { rules, addRule, updateRule, removeRule, rawRules };
}
