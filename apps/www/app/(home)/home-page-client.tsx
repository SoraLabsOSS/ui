"use client";

import { Header } from "@/components/header";
import { HomeFaq } from "@/components/home/home-faq";
import { HomeFooter } from "@/components/home/home-footer";
import { HomeHeroFeatures } from "@/components/home/home-hero-features";
import { HomeLenis } from "@/components/home/home-lenis";
import { HomeTwoWays } from "@/components/home/home-two-ways";
import { WhoItsFor } from "@/components/home/who-its-for";
import type { LatestShippedItem } from "@/lib/registry/get-latest-shipped-registry-item";

interface HomePageClientProps {
  latestShipped: LatestShippedItem | null;
}

export function HomePageClient({ latestShipped }: HomePageClientProps) {
  return (
    <>
      <Header />
      <HomeLenis>
        <div className="flex min-h-full w-full flex-col justify-between">
          <div>
            <HomeHeroFeatures />
            <WhoItsFor />
            <HomeTwoWays />
            <HomeFaq />
          </div>
          <HomeFooter latestShipped={latestShipped} />
        </div>
      </HomeLenis>
    </>
  );
}
