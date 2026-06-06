import { useState, useCallback } from "react";
import { Plus, ListFilter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RuleCard } from "./RuleCard";
import { RuleEditor } from "./RuleEditor";
import { useRules } from "@/lib/rules/use-rules";
import { parseRuleString } from "@/lib/rules/parser";
import type { RuleType, ParsedRule } from "@/lib/rules/parser";

interface RuleListProps {
  ruleType: RuleType;
}

type EditingState = { mode: "idle" } | { mode: "creating" } | { mode: "editing"; index: number };

function createBlankRule(ruleType: RuleType): ParsedRule {
  return parseRuleString(ruleType, "");
}

export function RuleList({ ruleType }: RuleListProps) {
  const { rules, addRule, updateRule, removeRule } = useRules(ruleType);
  const [editing, setEditing] = useState<EditingState>({ mode: "idle" });

  const handleAdd = useCallback(() => setEditing({ mode: "creating" }), []);
  const handleEdit = useCallback((index: number) => setEditing({ mode: "editing", index }), []);

  const handleDelete = useCallback(
    (index: number) => {
      removeRule(index);
      setEditing({ mode: "idle" });
    },
    [removeRule],
  );

  const handleSaveNew = useCallback(
    (rule: ParsedRule) => {
      addRule(rule);
      setEditing({ mode: "idle" });
    },
    [addRule],
  );

  const handleSaveEdit = useCallback(
    (index: number, rule: ParsedRule) => {
      updateRule(index, rule);
      setEditing({ mode: "idle" });
    },
    [updateRule],
  );

  const handleCancel = useCallback(() => setEditing({ mode: "idle" }), []);

  return (
    <div className="flex flex-col gap-6">
      {editing.mode === "idle" && (
        <div className="flex justify-end px-1">
          <Button variant="secondary" size="sm" onClick={handleAdd} className="gap-1.5 shadow-sm">
            <Plus className="size-3.5" />
            New Rule
          </Button>
        </div>
      )}

      {editing.mode === "creating" && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-300">
          <RuleEditor
            ruleType={ruleType}
            initialRule={createBlankRule(ruleType)}
            onSave={handleSaveNew}
            onCancel={handleCancel}
            index={rules.length}
          />
        </div>
      )}

      {rules.length === 0 && editing.mode === "idle" ? (
        // Borderless, breathable empty state
        <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-500">
          <div className="mb-5 flex size-14 items-center justify-center rounded-full bg-background text-muted-foreground/40 shadow-sm border border-border/50">
            <ListFilter className="size-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground tracking-tight">No Rules Yet</h3>
          <p className="mt-1.5 mb-6 max-w-sm text-sm text-muted-foreground/60 leading-relaxed">
            Rules let you selectively override behaviour based on exact criteria. Add your first
            rule to get started.
          </p>
          <Button variant="default" onClick={handleAdd} className="gap-1.5 shadow-md">
            <Plus className="size-4" />
            Create Rule
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {rules.map((rule, index) => {
            const isEditing =
              (editing.mode === "editing" && editing.index === index) ||
              (editing.mode === "creating" && index === rules.length - 1);

            if (isEditing && editing.mode === "editing") {
              return (
                <div key={rule.id} className="animate-in fade-in duration-200">
                  <RuleEditor
                    ruleType={ruleType}
                    initialRule={rule}
                    onSave={(updated) => handleSaveEdit(index, updated)}
                    onCancel={handleCancel}
                    index={index}
                  />
                </div>
              );
            }

            return (
              <RuleCard
                key={rule.id}
                rule={rule}
                ruleType={ruleType}
                index={index}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
