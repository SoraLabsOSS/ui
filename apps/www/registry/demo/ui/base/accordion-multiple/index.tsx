"use client";

import { cn } from "@workspace/ui/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  type AccordionProps,
  AccordionTrigger,
} from "@/registry/ui/base/accordion";

export default function AccordionMultipleDemo({
  className,
  defaultValue = ["item-1", "item-2"],
  multiple = true,
  ...props
}: AccordionProps) {
  return (
    <div className="flex w-full max-w-lg flex-col items-center justify-start self-start py-4">
      <Accordion
        className={cn("w-full", className)}
        defaultValue={defaultValue}
        multiple={multiple}
        {...props}
      >
        <AccordionItem value="item-1">
          <AccordionTrigger>Multiple Items Expansion</AccordionTrigger>
          <AccordionContent>
            With the <code>multiple</code> prop enabled, multiple accordion
            panels can remain open simultaneously without collapsing others.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Independent Animations</AccordionTrigger>
          <AccordionContent>
            Each panel independently runs its height expand/collapse and blur
            transition using Motion spring physics.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>Gliding Focus Ring</AccordionTrigger>
          <AccordionContent>
            Keyboard users can tab through triggers and see the focus ring
            smoothly glide between items.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
