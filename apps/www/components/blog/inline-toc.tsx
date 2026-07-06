"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/ui/components/animate-ui/collapsible";
import { cn } from "@workspace/ui/lib/utils";
import { ChevronDown } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

interface TocItem {
  depth: number;
  title: ReactNode;
  url: string;
}

export interface InlineTocProps extends ComponentProps<typeof Collapsible> {
  items: TocItem[];
}

export function InlineTOC({ items, ...props }: InlineTocProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <Collapsible
      {...props}
      className={cn(
        "not-prose rounded-lg border border-border bg-background text-foreground",
        props.className
      )}
    >
      <CollapsibleTrigger className="group inline-flex w-full items-center justify-between px-4 py-2.5 font-medium">
        {props.children ?? "Table of Contents"}
        <ChevronDown className="size-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="flex flex-col p-4 pt-0 text-muted-foreground text-sm">
          {items.map((item) => (
            <a
              className="border-s py-1.5 hover:text-foreground"
              href={item.url}
              key={item.url}
              style={{
                paddingInlineStart: 12 * Math.max(item.depth - 1, 0) + 12,
              }}
            >
              {item.title}
            </a>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
