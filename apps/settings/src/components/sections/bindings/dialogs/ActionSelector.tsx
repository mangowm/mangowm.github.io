import { useState } from "react";
import {
  Terminal,
  Monitor,
  Tag,
  LayoutGrid,
  Layers,
  MousePointer2,
  Settings,
  AppWindow,
  Navigation,
  Search,
  Zap,
  Keyboard,
  Palette,
  Play,
  Shield,
} from "lucide-react";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from "@mangowm/ui/components/combobox";
import { cn } from "cn";
import { categoryLabel, getDispatchersByCategory } from "@/lib/dispatchers";
import type { DispatcherInfo, DispatcherCategory } from "@/lib/dispatchers";

interface ActionSelectorProps {
  value: string;
  onChange: (v: string) => void;
}

const ALL_DISPATCHERS = getDispatchersByCategory().flatMap(([, items]) => items);

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;

  const escapedQuery = escapeRegExp(query.trim());
  const parts = text.split(new RegExp(`(${escapedQuery})`, "gi"));

  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.trim().toLowerCase() ? (
          <span
            key={i}
            className="rounded-sm bg-primary/25 px-[1px] font-bold text-primary-foreground"
          >
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

const CategoryIcon = ({
  category,
  className,
}: {
  category: DispatcherCategory;
  className?: string;
}) => {
  const icons: Record<string, React.ElementType> = {
    window: AppWindow,
    focus: Navigation,
    floating: MousePointer2,
    group: Layers,
    scratchpad: Layers,
    tag: Tag,
    monitor: Monitor,
    layout: LayoutGrid,
    input: Keyboard,
    bindings: Settings,
    appearance: Palette,
    animation: Play,
    behaviour: Settings,
    geometry: LayoutGrid,
    rules: Settings,
    autostart: Terminal,
    environment: Terminal,
    system: Settings,
    security: Shield,
  };
  const Icon = icons[category] || Zap;
  return <Icon className={className} />;
};

function filterDispatcher(item: DispatcherInfo, query: string) {
  if (!query.trim()) return true;
  const q = query.toLowerCase().trim();
  return (
    item.name.toLowerCase().includes(q) ||
    item.description.toLowerCase().includes(q) ||
    item.aliases.some((alias) => alias.toLowerCase().includes(q))
  );
}

export function ActionSelector({ value, onChange }: ActionSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedDispatcher = value
    ? (ALL_DISPATCHERS.find((item) => item.name === value) ?? null)
    : null;

  return (
    <Combobox
      items={ALL_DISPATCHERS}
      filter={filterDispatcher}
      itemToStringLabel={(item: DispatcherInfo) => item.name}
      value={selectedDispatcher}
      onValueChange={(item: DispatcherInfo | null) => {
        if (item) onChange(item.name);
      }}
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        setSearchQuery(nextOpen ? "" : (selectedDispatcher?.name ?? ""));
      }}
      inputValue={searchQuery}
      onInputValueChange={setSearchQuery}
      autoHighlight
    >
      <ComboboxTrigger
        className={cn(
          "flex w-full items-center justify-between gap-3 rounded-lg border border-border/40 text-left transition-all",
          "focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none",
          selectedDispatcher
            ? "bg-card p-3 shadow-sm hover:bg-accent/40"
            : "border-dashed bg-muted/30 p-3 hover:bg-muted/50",
        )}
      >
        {selectedDispatcher ? (
          <div className="flex min-w-0 flex-1 items-center gap-3.5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <CategoryIcon category={selectedDispatcher.category} className="size-4.5" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm font-medium text-foreground">
                {selectedDispatcher.name}
              </span>
              <span className="truncate text-xs text-muted-foreground/70">
                {selectedDispatcher.description}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground/50">
              <Search className="size-4" />
            </div>
            <span className="text-sm font-medium">Search and select a system action...</span>
          </div>
        )}
      </ComboboxTrigger>

      <ComboboxContent className="min-w-0 p-0">
        <ComboboxInput
          showTrigger={false}
          autoFocus
          placeholder="Search dispatchers (e.g. spawn, layout)..."
          className="m-1 mb-0 w-full"
        />
        <ComboboxList className="max-h-[320px]">
          {(item: DispatcherInfo) => (
            <ComboboxItem
              key={item.name}
              value={item}
              className="mx-1 my-0.5 flex-col items-start gap-1 rounded-lg px-3 py-2 pr-8"
            >
              <div className="flex w-full items-center gap-2">
                <CategoryIcon
                  category={item.category}
                  className="size-4 shrink-0 text-muted-foreground"
                />
                <span className="truncate text-sm font-medium text-foreground">
                  <HighlightMatch text={item.name} query={searchQuery} />
                </span>
                <span className="ml-auto shrink-0 rounded-sm bg-muted/50 px-1.5 py-0.5 text-[10px] font-medium tracking-wider text-muted-foreground/60 uppercase">
                  {categoryLabel(item.category)}
                </span>
              </div>
              <span className="truncate text-xs text-muted-foreground/70">{item.description}</span>
            </ComboboxItem>
          )}
        </ComboboxList>
        <ComboboxEmpty className="py-8">
          <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <Search className="mb-1 size-8 opacity-20" />
            <span className="text-sm font-medium">No actions found.</span>
            <span className="text-xs opacity-70">Try a different search term.</span>
          </div>
        </ComboboxEmpty>
      </ComboboxContent>
    </Combobox>
  );
}
