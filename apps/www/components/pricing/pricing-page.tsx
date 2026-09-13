"use client";

import { useRef } from "react";
import { useButton3DHover } from "@/hooks/use-button-3d-hover";
import { PricingCards } from "./pricing-cards";
import { PricingFaq } from "./pricing-faq";
import { PricingHero } from "./pricing-hero";

export function PricingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  useButton3DHover(containerRef);

  return (
    <div
      className="home-layout home-content body"
      data-barba="wrapper"
      ref={containerRef}
    >
      <main
        className="main"
        data-barba="container"
        data-barba-namespace="pricing"
      >
        <PricingHero />
        <PricingCards />
        <PricingFaq />
      </main>
    </div>
  );
}
