"use client";

import Link from "next/link";
import { useState } from "react";
import { PRICING_FAQ_ITEMS } from "./pricing-config";

function FaqAnswer({ content, title }: { content: string; title: string }) {
  if (title === "Can I use components commercially?") {
    return (
      <p className="pricing-faq__answer">
        Yes. Use components in personal, commercial, and client projects. See
        the <Link href="/docs/license">License</Link> page for full terms,
        including the Commons Clause restriction on reselling components as-is.
      </p>
    );
  }

  if (title === "How do I install?") {
    return (
      <p className="pricing-faq__answer">
        Initialize shadcn/ui, register the @soralabs namespace, then run{" "}
        <code>npx shadcn@latest add @soralabs/&lt;component-name&gt;</code>.
        Full steps are in the{" "}
        <Link href="/docs/installation">Installation</Link> guide.
      </p>
    );
  }

  return <p className="pricing-faq__answer">{content}</p>;
}

export function PricingFaq() {
  const [openIndexes, setOpenIndexes] = useState<number[]>([0]);

  const toggleItem = (index: number) => {
    setOpenIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <section className="pricing-faq" id="faq">
      <div className="is--md-m container">
        <div className="pricing-faq__header">
          <p className="eyebrow">FAQ</p>
          <h2 className="h-s">Questions about pricing</h2>
        </div>

        <div className="pricing-faq__list">
          {PRICING_FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndexes.includes(index);
            return (
              <div
                className="pricing-faq__item"
                data-state={isOpen ? "open" : "closed"}
                key={item.title}
              >
                <button
                  aria-expanded={isOpen}
                  className="pricing-faq__trigger"
                  onClick={() => toggleItem(index)}
                  type="button"
                >
                  <h3 className="pricing-faq__title">{item.title}</h3>
                  <div aria-hidden="true" className="pricing-faq__icon">
                    <span className="pricing-faq__icon-bar is--h" />
                    <span className="pricing-faq__icon-bar is--v" />
                  </div>
                </button>
                <div className="pricing-faq__content">
                  <div className="pricing-faq__content-inner">
                    <FaqAnswer content={item.content} title={item.title} />
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
