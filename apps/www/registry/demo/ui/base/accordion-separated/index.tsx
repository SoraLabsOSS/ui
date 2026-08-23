"use client";

import { cn } from "@workspace/ui/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  type AccordionProps,
  AccordionTrigger,
} from "@/registry/ui/base/accordion";

export default function AccordionSeparatedDemo({
  className,
  defaultValue = ["item-1"],
  variant = "separated",
  ...props
}: AccordionProps) {
  return (
    <div className="flex w-full max-w-lg flex-col items-center justify-start self-start py-4">
      <Accordion
        className={cn("w-full", className)}
        defaultValue={defaultValue}
        variant={variant}
        {...props}
      >
        <AccordionItem value="item-1">
          <AccordionTrigger>
            Can I use this in Next.js App Router?
          </AccordionTrigger>
          <AccordionContent>
            Yes. All components are fully compatible with Next.js 15+, React 19,
            and Server Components.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>How does accessibility work?</AccordionTrigger>
          <AccordionContent>
            It is built on Base UI, ensuring full WAI-ARIA compliance, roving
            keyboard focus, and screen reader announcements.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>Is reduced motion supported?</AccordionTrigger>
          <AccordionContent>
            Yes. The component honors the user&apos;s prefers-reduced-motion
            setting automatically.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
