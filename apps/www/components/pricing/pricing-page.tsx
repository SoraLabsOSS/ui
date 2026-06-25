"use client";

import { Header } from "@/components/header";
import { HomeFooter } from "@/components/home/home-footer";
import type { LatestShippedItem } from "@/lib/registry/get-latest-shipped-registry-item";
import { PricingCards } from "./pricing-cards";
import { PricingFaq } from "./pricing-faq";
import { PricingHero } from "./pricing-hero";

interface PricingPageProps {
  latestShipped: LatestShippedItem | null;
}

export function PricingPage({ latestShipped }: PricingPageProps) {
  return (
    <>
      <Header />
      <main className="min-h-[calc(100dvh-var(--fd-banner-height))] bg-background text-foreground">
        <PricingHero />
        <PricingCards />
        <PricingFaq />
        <HomeFooter latestShipped={latestShipped} />
      </main>
    </>
  );
}
