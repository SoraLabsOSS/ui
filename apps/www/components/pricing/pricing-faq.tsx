"use client";

import Link from "next/link";
import { useState } from "react";
import { PRICING_FAQ_ITEMS } from "./pricing-config";

function FaqAnswer({ content, title }: { content: string; title: string }) {
  if (title === "Can I use components commercially?") {
    return (
      <p className="pricing-faq__answer p-m">
        Yes. Use components in personal, commercial, and client projects. See
        the <Link href="/docs/license">License</Link> page for full terms,
        including the Commons Clause restriction on reselling components as-is.
      </p>
    );
  }

  if (title === "How do I install?") {
    return (
      <p className="pricing-faq__answer p-m">
        Initialize shadcn/ui, register the @soralabs namespace, then run{" "}
        <code>npx shadcn@latest add @soralabs/&lt;component-name&gt;</code>.
        Full steps are in the{" "}
        <Link href="/docs/installation">Installation</Link> guide.
      </p>
    );
  }

  return <p className="pricing-faq__answer p-m">{content}</p>;
}

export function PricingFaq() {
  const [openAccordion, setOpenAccordion] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setOpenAccordion((prev) => (prev === index ? null : index));
  };

  return (
    <section className="pricing-faq" id="faq">
      <div className="is--md-m container">
        <div className="pricing-faq__header">
          <p className="eyebrow">FAQ</p>
          <h2 className="h-s">Questions about pricing</h2>
        </div>

        <div className="pricing-faq__list" data-accordion-close-siblings="true">
          {PRICING_FAQ_ITEMS.map((item, index) => {
            const isOpen = openAccordion === index;
            return (
              <div
                className="group w-full border-neutral-400 border-t last:border-b"
                data-accordion-status={isOpen ? "active" : "not-active"}
                key={item.title}
              >
                {/* biome-ignore lint/a11y/useKeyWithClickEvents lint/a11y/noStaticElementInteractions lint/a11y/noNoninteractiveElementInteractions: Accordion Toggle */}
                <div
                  className="flex min-h-[3.5rem] cursor-pointer items-center justify-between py-[var(--gap-m)]"
                  data-accordion-toggle=""
                  data-hover=""
                  onClick={() => toggleAccordion(index)}
                >
                  <h4 className="h-xs">{item.title}</h4>
                  <svg
                    className="size-[0.625em] shrink-0 rotate-0 items-center justify-center transition-transform duration-[var(--duration-default)] ease-[var(--cubic-default)] group-data-[accordion-status=active]:rotate-[315deg]"
                    fill="none"
                    viewBox="0 0 13 13"
                    width="100%"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <title>Toggle</title>
                    <path
                      d="M5.96149 12.0996V6.99217H0.839844V5.20705H5.96149V0.0996094H7.74294V5.20705H12.8398V6.99217H7.74294V12.0996H5.96149Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <div className="relative grid grid-rows-[0fr] overflow-hidden transition-[grid-template-rows] duration-[var(--duration-default)] ease-[var(--cubic-default)] group-data-[accordion-status=active]:grid-rows-[1fr]">
                  <div className="relative flex h-[100000%] flex-col overflow-hidden">
                    <div className="pb-[var(--gap-l)]">
                      <FaqAnswer content={item.content} title={item.title} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
