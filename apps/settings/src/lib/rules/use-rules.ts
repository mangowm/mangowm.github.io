import { useCallback } from "react";

import { useConfigStore } from "@/lib/config/store";
import { parseRuleString, serializeRule } from "@/lib/rules/parser";
import type { ParsedRule, RuleType } from "@/lib/rules/types";

export type { ParsedRule, RuleType };

const CONFIG_KEY: Record<RuleType, string> = {
  windowrule: "window_rule",
  monitorrule: "monitor_rule",
  tagrule: "tag_rule",
  layerrule: "layer_rule",
};

export function useRules(ruleType: RuleType) {
  const key = CONFIG_KEY[ruleType];
  const rawRules = useConfigStore((state) => state.data[key]) ?? [];
  const addEntry = useConfigStore((state) => state.addEntry);
  const updateEntry = useConfigStore((state) => state.updateEntry);
  const removeEntry = useConfigStore((state) => state.removeEntry);

  const rules: ParsedRule[] = rawRules.map((raw) => parseRuleString(ruleType, raw));

  const addRule = useCallback(
    (rule: ParsedRule) => addEntry(key, serializeRule(rule)),
    [addEntry, key],
  );

  const updateRule = useCallback(
    (index: number, rule: ParsedRule) => updateEntry(key, index, serializeRule(rule)),
    [updateEntry, key],
  );

  const removeRule = useCallback((index: number) => removeEntry(key, index), [removeEntry, key]);

  return { rules, addRule, updateRule, removeRule, rawRules };
}
