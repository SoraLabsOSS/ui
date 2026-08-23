"use client";

import { cn } from "@workspace/ui/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  type AccordionProps,
  AccordionTrigger,
} from "@/registry/ui/base/accordion";

const items = [
  {
    id: "what-is",
    title: "What is Motion+?",
    content:
      "Motion+ is a one-time fee, lifetime access membership that unlocks the source code for all Motion examples, early access features, premium components, and an exclusive Discord community.",
  },
  {
    id: "lifetime",
    title: 'What does "lifetime access" mean?',
    content:
      "Just that! No one needs another subscription in their life. Lifetime access means you'll receive all updates to Motion+ as they're released.",
  },
  {
    id: "team",
    title: "How does the team package work?",
    content:
      "After purchase, you can nominate up to 10 team members to join Motion+.",
  },
];

export default function AccordionBorderedDemo({
  className,
  defaultValue = ["what-is"],
  variant = "bordered",
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
        {items.map((item) => (
          <AccordionItem key={item.id} value={item.id}>
            <AccordionTrigger>{item.title}</AccordionTrigger>
            <AccordionContent>{item.content}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
