import { Button } from "@/components/ui/button";

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  icon?: React.ElementType;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div
      data-slot="button-group"
      className="flex items-center rounded-lg bg-card ring-1 ring-foreground/10 p-0.5"
    >
      {options.map((option) => {
        const Icon = option.icon;
        const isActive = value === option.value;
        return (
          <Button
            key={option.value}
            role="tab"
            aria-selected={isActive}
            variant={isActive ? "default" : "ghost"}
            size="icon-sm"
            onClick={() => onChange(option.value)}
            title={option.label}
          >
            {Icon && <Icon className="size-4" />}
            <span className="sr-only">{option.label}</span>
          </Button>
        );
      })}
    </div>
  );
}
