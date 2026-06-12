"use client";

import {
  Tabs,
  TabsHighlight,
  TabsHighlightItem,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/animate-ui/primitives/animate/tabs";
import { cn } from "@workspace/ui/lib/utils";

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
      <TabsHighlight className="absolute inset-0 rounded-lg bg-background shadow-sm dark:bg-foreground/10">
        <TabsList
          className={cn(
            "relative flex h-10 shrink-0 items-center rounded-xl bg-muted p-1",
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
                className="relative z-10 h-full cursor-pointer rounded-lg px-3.5 font-medium text-sm transition-colors duration-150 focus-visible:outline-none data-[state=active]:text-foreground data-[state=inactive]:text-foreground/45"
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
