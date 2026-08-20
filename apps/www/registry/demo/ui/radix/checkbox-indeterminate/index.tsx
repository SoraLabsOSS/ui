"use client";

import { useState } from "react";
import { Checkbox } from "@/registry/ui/radix/checkbox";

const items = [
  { id: "comments", label: "Comments" },
  { id: "mentions", label: "Mentions" },
  { id: "offers", label: "Promotions" },
];

export default function RadixCheckboxIndeterminateDemo() {
  const [selected, setSelected] = useState<string[]>(["comments", "mentions"]);
  const allSelected = selected.length === items.length;
  const isIndeterminate = selected.length > 0 && !allSelected;

  const toggleAll = () => {
    setSelected(allSelected ? [] : items.map((i) => i.id));
  };

  const toggleItem = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className="flex w-full max-w-sm flex-col gap-3 rounded-lg border border-border p-4">
        <div className="flex items-center gap-3 border-border border-b pb-3">
          <Checkbox
            checked={isIndeterminate ? "indeterminate" : allSelected}
            id="radix-select-all"
            onCheckedChange={toggleAll}
          />
          <label
            className="cursor-pointer select-none font-semibold text-foreground text-sm"
            htmlFor="radix-select-all"
          >
            Select all notifications
          </label>
        </div>
        <div className="flex flex-col gap-2.5 pt-1 pl-6">
          {items.map((item) => (
            <div className="flex items-center gap-2.5" key={item.id}>
              <Checkbox
                checked={selected.includes(item.id)}
                id={`radix-${item.id}`}
                onCheckedChange={() => toggleItem(item.id)}
              />
              <label
                className="cursor-pointer select-none font-medium text-foreground text-sm"
                htmlFor={`radix-${item.id}`}
              >
                {item.label}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
