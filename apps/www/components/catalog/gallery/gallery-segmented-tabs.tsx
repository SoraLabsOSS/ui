"use client";

import { cn } from "@workspace/ui/lib/utils";

import {
  Tabs,
  TabsHighlight,
  TabsHighlightItem,
  TabsList,
  TabsTrigger,
} from "@/registry/primitives/animate/tabs";

interface GallerySegmentedTabsProps<T extends string> {
  className?: string;
  onChange: (value: T) => void;
  options: readonly { label: string; value: T }[];
  value: T;
}

export function GallerySegmentedTabs<T extends string>({
  className,
  onChange,
  options,
  value,
}: GallerySegmentedTabsProps<T>) {
  return (
    <Tabs
      onValueChange={(next) => {
        onChange(next as T);
      }}
      value={value}
    >
      <TabsHighlight className="bg-background dark:bg-foreground/10 absolute inset-0 rounded-lg shadow-sm">
        <TabsList
          className={cn(
            "bg-muted relative flex h-10 shrink-0 items-center rounded-xl p-1",
            className
          )}
        >
          {options.map(({ label, value: optionValue }) => (
            <TabsHighlightItem
              className="h-full"
              key={optionValue}
              value={optionValue}
            >
              <TabsTrigger
                className="data-[state=active]:text-foreground data-[state=inactive]:text-foreground/45 relative z-10 h-full cursor-pointer rounded-lg px-3.5 text-sm font-medium transition-colors duration-150 focus-visible:outline-none"
                value={optionValue}
              >
                {label}
              </TabsTrigger>
            </TabsHighlightItem>
          ))}
        </TabsList>
      </TabsHighlight>
    </Tabs>
  );
}
