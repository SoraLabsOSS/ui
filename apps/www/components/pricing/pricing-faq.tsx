"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionText,
  AccordionTrigger,
} from "@workspace/ui/components/sora-ui/disclosure/accordion";
import { cn } from "@workspace/ui/lib/utils";
import Link from "next/link";
import { HomeShell } from "@/components/home-shell";
import { PRICING_FAQ_ITEMS } from "./pricing-config";

const accordionTriggerClassName = cn(
  "items-start gap-4 py-6 lg:items-center",
  "[&>span:first-child]:font-mono [&>span:first-child]:font-normal [&>span:first-child]:text-xs [&>span:first-child]:uppercase [&>span:first-child]:leading-snug [&>span:first-child]:tracking-widest",
  "[&_[data-anm-accordion-icon]]:size-3"
);

const accordionTextClassName =
  "max-w-[96ch] pb-6 text-base text-muted-foreground leading-relaxed";

function FaqAnswer({ content, title }: { content: string; title: string }) {
  if (title === "Can I use components commercially?") {
    return (
      <AccordionText className={accordionTextClassName}>
        Yes. Use components in personal, commercial, and client projects. See
        the{" "}
        <Link
          className="text-foreground underline underline-offset-4 transition-opacity hover:opacity-70"
          href="/docs/license"
        >
          License
        </Link>{" "}
        page for full terms, including the Commons Clause restriction on
        reselling components as-is.
      </AccordionText>
    );
  }

  if (title === "How do I install?") {
    return (
      <AccordionText className={accordionTextClassName}>
        Initialize shadcn/ui, register the @soralabs namespace, then run{" "}
        <code className="font-mono text-foreground text-sm">
          npx shadcn@latest add @soralabs/&lt;component-name&gt;
        </code>
        . Full steps are in the{" "}
        <Link
          className="text-foreground underline underline-offset-4 transition-opacity hover:opacity-70"
          href="/docs/installation"
        >
          Installation
        </Link>{" "}
        guide.
      </AccordionText>
    );
  }

  return (
    <AccordionText className={accordionTextClassName}>{content}</AccordionText>
  );
}

export function PricingFaq() {
  return (
    <section className="border-foreground/10 border-t bg-background py-20 md:py-28">
      <HomeShell>
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-muted-foreground text-xs uppercase tracking-widest">
            FAQ
          </p>
          <h2 className="mt-4 font-medium text-2xl tracking-tight md:text-3xl">
            Questions about pricing
          </h2>
        </div>

        <div className="mx-auto mt-10 max-w-2xl">
          <Accordion className="w-full">
            {PRICING_FAQ_ITEMS.map((item, index) => (
              <AccordionItem defaultOpen={index === 0} key={item.title}>
                <AccordionTrigger className={accordionTriggerClassName}>
                  {item.title}
                </AccordionTrigger>
                <AccordionContent>
                  <FaqAnswer content={item.content} title={item.title} />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </HomeShell>
    </section>
  );
}
