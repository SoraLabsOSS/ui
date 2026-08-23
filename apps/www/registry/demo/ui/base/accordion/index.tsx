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
    title: "What is Sora UI?",
    content:
      "Sora UI is a high-craft React component registry built with TypeScript, Tailwind CSS v4, Base UI, Radix UI, and Motion. It provides fully animated, accessible primitives and production-ready components.",
  },
  {
    id: "lifetime",
    title: "How does the Motion animation logic work?",
    content:
      "Every accordion item uses Motion spring physics (bounce: 0.2, visualDuration: 0.4) for layout transitions, combined with mask gradient fading, subtle blur transitions, and gliding layoutId focus rings for accessible keyboard navigation.",
  },
  {
    id: "team",
    title: "Can I customize the styling and variants?",
    content:
      "Yes! The component supports default, bordered, separated, and ghost variants via Class Variance Authority, along with full Tailwind class override capabilities on every part.",
  },
];

export default function AccordionDemo({
  className,
  defaultValue = ["what-is"],
  ...props
}: AccordionProps) {
  return (
    <div className="flex w-full max-w-lg flex-col items-center justify-start self-start py-4">
      <Accordion
        className={cn("w-full", className)}
        defaultValue={defaultValue}
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
