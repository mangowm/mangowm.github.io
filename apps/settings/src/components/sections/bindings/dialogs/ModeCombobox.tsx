import { useEffect, useState } from "react";
import { PlusIcon } from "lucide-react";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@mangowm/ui/components/combobox";

interface ModeComboboxProps {
  value: string;
  existingModes: string[];
  onChange: (val: string) => void;
}

export function ModeCombobox({ value, existingModes, onChange }: ModeComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(value || "");

  useEffect(() => {
    if (!open) setSearch(value || "");
  }, [value, open]);

  const query = search.trim();
  const isNew = query !== "" && query !== value && !existingModes.includes(query);
  const items = isNew ? [...existingModes, query] : existingModes;

  return (
    <Combobox
      items={items}
      autoHighlight
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        setSearch(next ? "" : value || "");
      }}
      value={value || null}
      onValueChange={(next) => {
        if (typeof next !== "string" || !next) return;
        onChange(next);
        setSearch(next);
      }}
      inputValue={search}
      onInputValueChange={setSearch}
    >
      <ComboboxInput
        showClear
        placeholder="default"
        aria-label="Binding mode"
        className="h-11 w-full"
      />
      <ComboboxContent>
        <ComboboxList>
          {(item: string) =>
            isNew && item === query ? (
              <ComboboxItem key={item} value={item} className="font-mono">
                <PlusIcon className="size-3.5 text-primary" />
                <span>Add &quot;{item}&quot;</span>
              </ComboboxItem>
            ) : (
              <ComboboxItem key={item} value={item} className="font-mono">
                {item}
              </ComboboxItem>
            )
          }
        </ComboboxList>
        <ComboboxEmpty>No matching modes</ComboboxEmpty>
      </ComboboxContent>
    </Combobox>
  );
}
