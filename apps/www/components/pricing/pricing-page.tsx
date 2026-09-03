"use client";

import type { LatestShippedItem } from "@/lib/registry/get-latest-shipped-registry-item";
import { PricingCards } from "./pricing-cards";
import { PricingFaq } from "./pricing-faq";
import { PricingHero } from "./pricing-hero";

interface PricingPageProps {
  latestShipped?: LatestShippedItem | null;
}

export function PricingPage(_props: PricingPageProps = {}) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <PricingHero />
      <PricingCards />
      <PricingFaq />
    </main>
  );
}
